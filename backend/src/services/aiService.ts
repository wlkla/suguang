interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AIApiResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

class AIService {
  private readonly apiKey: string
  private readonly baseUrl: string

  constructor() {
    // 优先使用环境变量，如果为空或是占位符则使用默认值
    const envApiKey = process.env.OPENAI_API_KEY
    this.apiKey = (envApiKey && envApiKey !== 'your-openai-api-key') 
      ? envApiKey 
      : 'sk---yuyuni---9vPFuTSJwHqQjoLqSyNN2g=='
    
    this.baseUrl = process.env.LLM_BASE_URL || 'http://llms-se.baidu-int.com:8200'
    
    console.log('🔧 AI Service initialized:', {
      baseUrl: this.baseUrl,
      apiKeyPrefix: this.apiKey.substring(0, 10) + '...'
    })
  }

  async callAI(messages: AIMessage[]): Promise<string> {
    const apiUrl = `${this.baseUrl}/chat/completions`
    
    console.log('🌐 AI API URL:', apiUrl)
    console.log('🔑 API Key:', this.apiKey.substring(0, 10) + '...')
    
    const headers = {
      "Authorization": `Bearer ${this.apiKey}`,
      "Content-Type": "application/json"
    }

    const payload = {
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 1500
    }

    console.log('📤 Sending request to AI service:', {
      url: apiUrl,
      messageCount: messages.length,
      model: payload.model
    })

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      console.log('📡 AI Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ AI Response error details:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText
        })
        throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}, body: ${errorText}`)
      }

      const data = await response.json() as AIApiResponse
      console.log('📊 AI Response data structure:', {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length || 0,
        fullResponse: JSON.stringify(data, null, 2).substring(0, 300) + '...'
      })
      
      if (data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
        const content = data.choices[0].message.content.trim()
        console.log('📝 AI Content received:', {
          length: content.length,
          preview: content.substring(0, 100) + '...'
        })
        return content
      } else {
        console.error('❌ Invalid AI response structure:', data)
        throw new Error(`No valid response received from AI. Response: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error('❌ AI API Error details:', {
        message: error instanceof Error ? error.message : String(error),
        url: apiUrl,
        payload: JSON.stringify(payload, null, 2),
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }

  async analyzePsychology(memoryRecord: any, analysisData: any, stage: string): Promise<{
    insight: string
    emotionalState: string
    growthIndicators: string[]
  }> {
    const systemPrompt = this.createPsychologyAnalysisPrompt()
    const userPrompt = this.formatAnalysisInput(memoryRecord, analysisData, stage)

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ]

    console.log('🔍 Starting psychology analysis for stage:', stage)
    console.log('📝 Memory record:', memoryRecord.title)
    console.log('💬 Analysis data:', analysisData ? `Current: ${analysisData.currentConversation?.length || 0} messages, History: ${analysisData.allHistoryConversations?.length || 0} total messages across ${analysisData.conversationCount || 0} conversations` : 'none')
    
    try {
      console.log('🤖 Calling AI service for psychology analysis...')
      console.log('📋 Analysis context:', {
        stage,
        memoryTitle: memoryRecord.title,
        hasAnalysisData: !!analysisData,
        currentConversationMessages: analysisData?.currentConversation?.length || 0,
        totalHistoryMessages: analysisData?.allHistoryConversations?.length || 0,
        conversationCount: analysisData?.conversationCount || 0
      })
      
      const response = await this.callAI(messages)
      console.log('✅ AI Analysis Response received:', {
        length: response.length,
        preview: response.substring(0, 200) + '...'
      })
      
      const result = this.parseAnalysisResponse(response)
      console.log('🎯 Parsed analysis result:', {
        hasInsight: !!result.insight,
        hasEmotionalState: !!result.emotionalState,
        growthIndicatorsCount: result.growthIndicators.length,
        result
      })
      
      // 验证分析结果的质量
      if (!result.insight || result.insight.length < 20) {
        console.warn('⚠️ AI analysis result seems too short or empty, using fallback')
        throw new Error('AI analysis result is inadequate')
      }
      
      return result
    } catch (error) {
      console.error('❌ Psychology analysis error details:', {
        error: error instanceof Error ? error.message : String(error),
        stage,
        memoryId: memoryRecord.id,
        stack: error instanceof Error ? error.stack : undefined
      })
      
      console.log('🔄 Falling back to backup analysis for stage:', stage)
      const fallback = this.getFallbackAnalysis(stage)
      console.log('💾 Using fallback analysis:', fallback)
      return fallback
    }
  }

  private createPsychologyAnalysisPrompt(): string {
    return `你是一位专业的心理分析师，专门分析个人成长轨迹和心理变化。你的任务是基于用户的记忆记录和完整的对话历史，提供深度的思想变化历程分析。

你将接收到：
1. 用户的原始记忆记录
2. 用户与过去自己的完整对话历史（如果有多次对话）
3. 当前分析阶段（initial/conversation_N）

请按照以下格式返回JSON分析结果：

{
  "insight": "详细的心理洞察分析，重点关注思想变化历程（200-300字）",
  "emotionalState": "当前情绪状态描述（30-50字）", 
  "growthIndicators": ["成长指标1", "成长指标2", "成长指标3", "成长指标4"]
}

分析要求：

1. **思想变化历程分析 (insight)**：
   - **纵向发展**：如果有多次对话，重点分析用户思维的演变轨迹
   - **模式识别**：识别用户思考问题的模式变化、观念转变
   - **深度挖掘**：从历次对话中发现用户未曾直接表达的内在变化
   - **转折点定位**：找出关键的心理转折点和突破时刻
   - **整合理解**：将零散的对话片段整合为连贯的成长故事
   - **未来指向**：基于历史轨迹，洞察用户可能的发展方向

2. **情绪状态 (emotionalState)**：
   - 综合多次对话的情绪变化趋势
   - 描述当前最新的情绪状态和心理基调
   - 考虑情绪的层次性和复杂性

3. **成长指标 (growthIndicators)**：
   - 基于完整历程识别的真实成长维度
   - 例如：思维深化、自我认知、情感成熟、价值重构、行为改变、关系洞察等
   - 确保指标反映实际的变化轨迹

特别注意：
- 如果只有单次对话，重点分析初次探索的特点
- 如果有多次对话，必须突出变化的连续性和演进特征
- 避免孤立地分析单次对话，要从整体历程的角度思考
- 用温暖、专业的语调，避免病理化描述
- 基于实际提供的内容，不要臆测
- 返回有效的JSON格式`
  }

  private formatAnalysisInput(memoryRecord: any, analysisData: any, stage: string): string {
    let input = `【分析阶段】${stage}\n\n`
    
    input += `【原始记忆记录】\n`
    input += `标题: ${memoryRecord.title || '无标题'}\n`
    input += `内容: ${memoryRecord.content}\n`
    input += `记录时间: ${memoryRecord.createdAt}\n`
    if (memoryRecord.mood) {
      input += `当时心情评分: ${memoryRecord.mood}/5\n`
    }
    if (memoryRecord.tags) {
      input += `标签: ${memoryRecord.tags}\n`
    }

    // 处理完整的对话历史数据
    if (analysisData && analysisData.allHistoryConversations && analysisData.allHistoryConversations.length > 0) {
      input += `\n【完整的思想变化历程】\n`
      input += `总对话次数: ${analysisData.conversationCount}次\n`
      input += `总消息数: ${analysisData.allHistoryConversations.length}条\n\n`

      // 按对话分组显示历史
      const conversationGroups = new Map()
      analysisData.allHistoryConversations.forEach((msg: any) => {
        const convId = msg.conversationId || 'unknown'
        if (!conversationGroups.has(convId)) {
          conversationGroups.set(convId, {
            messages: [],
            date: msg.conversationDate
          })
        }
        conversationGroups.get(convId).messages.push(msg)
      })

      let conversationIndex = 1
      for (const [convId, group] of conversationGroups.entries()) {
        const isCurrentConversation = convId === 'current'
        const conversationTitle = isCurrentConversation 
          ? `【第${conversationIndex}次对话 - 当前对话】` 
          : `【第${conversationIndex}次对话】`
        
        input += `${conversationTitle}\n`
        input += `对话时间: ${new Date(group.date).toLocaleString('zh-CN')}\n`
        
        group.messages.forEach((msg: any, index: number) => {
          const sender = msg.sender === 'user' ? '现在的我' : '过去的我'
          input += `${sender}: ${msg.text}\n`
        })
        
        const userMessages = group.messages.filter((msg: any) => msg.sender === 'user')
        input += `本次对话用户发送了${userMessages.length}条消息\n\n`
        conversationIndex++
      }
      
      const totalUserMessages = analysisData.allHistoryConversations.filter((msg: any) => msg.sender === 'user')
      input += `【总体统计】用户在${analysisData.conversationCount}次对话中共发送了${totalUserMessages.length}条消息，展现了持续的自我探索和思考。`
    } else if (analysisData && analysisData.currentConversation && analysisData.currentConversation.length > 0) {
      input += `\n【当前对话记录】\n`
      analysisData.currentConversation.forEach((msg: any, index: number) => {
        const sender = msg.sender === 'user' ? '现在的我' : '过去的我'
        input += `${sender}: ${msg.text}\n`
      })
      
      const userMessages = analysisData.currentConversation.filter((msg: any) => msg.sender === 'user')
      input += `\n【对话统计】用户共发送了${userMessages.length}条消息，进行了深度的自我对话。`
    } else {
      input += `\n【分析类型】这是基于原始记忆的初步分析，尚未进行与过去自己的对话。`
    }

    return input
  }

  private parseAnalysisResponse(response: string): {
    insight: string
    emotionalState: string
    growthIndicators: string[]
  } {
    console.log('🔍 Parsing AI analysis response:', {
      responseLength: response.length,
      responsePreview: response.substring(0, 200) + '...'
    })
    
    try {
      // 尝试清理响应文本，移除可能的markdown标记
      let cleanResponse = response.trim()
      
      // 如果响应包含代码块标记，提取JSON部分
      const jsonMatch = cleanResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
      if (jsonMatch) {
        cleanResponse = jsonMatch[1]
        console.log('📝 Extracted JSON from code block')
      }
      
      // 尝试找到JSON对象的开始和结束
      const jsonStart = cleanResponse.indexOf('{')
      const jsonEnd = cleanResponse.lastIndexOf('}')
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1)
        console.log('📝 Extracted JSON object:', cleanResponse.substring(0, 100) + '...')
      }
      
      const parsed = JSON.parse(cleanResponse)
      console.log('✅ Successfully parsed JSON:', parsed)
      
      if (parsed.insight && parsed.emotionalState && parsed.growthIndicators) {
        const result = {
          insight: String(parsed.insight).trim(),
          emotionalState: String(parsed.emotionalState).trim(),
          growthIndicators: Array.isArray(parsed.growthIndicators) 
            ? parsed.growthIndicators.map((item: any) => String(item).trim())
            : []
        }
        console.log('✅ Valid analysis structure parsed:', result)
        return result
      } else {
        console.warn('⚠️ Parsed JSON missing required fields:', {
          hasInsight: !!parsed.insight,
          hasEmotionalState: !!parsed.emotionalState,
          hasGrowthIndicators: !!parsed.growthIndicators
        })
      }
    } catch (error) {
      console.error('❌ JSON parsing failed:', {
        error: error instanceof Error ? error.message : String(error),
        responseLength: response.length,
        responseStart: response.substring(0, 100)
      })
    }

    // 文本解析备用方案
    console.log('🔄 Falling back to text extraction')
    const insight = this.extractField(response, 'insight') || 
                   this.extractField(response, '"insight"') ||
                   response.substring(0, Math.min(200, response.length))
    
    const emotionalState = this.extractField(response, 'emotionalState') || 
                          this.extractField(response, '"emotionalState"') ||
                          '情绪状态复杂，正在成长中'
    
    const growthIndicators = this.extractArray(response, 'growthIndicators') || 
                            this.extractArray(response, '"growthIndicators"') ||
                            ['自我觉察', '内在成长']

    const fallbackResult = { insight, emotionalState, growthIndicators }
    console.log('📝 Text extraction result:', fallbackResult)
    return fallbackResult
  }

  private extractField(text: string, field: string): string | null {
    const patterns = [
      new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`, 'i'),
      new RegExp(`${field}\\s*[:：]\\s*(.+?)(?=\\n|$)`, 'i')
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        return match[1].trim()
      }
    }
    return null
  }

  private extractArray(text: string, field: string): string[] | null {
    const patterns = [
      new RegExp(`"${field}"\\s*:\\s*\\[([^\\]]+)\\]`, 'i'),
      new RegExp(`${field}\\s*[:：]\\s*\\[([^\\]]+)\\]`, 'i')
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        return match[1]
          .split(/[,，]/)
          .map(item => item.replace(/["\s]/g, ''))
          .filter(item => item.length > 0)
      }
    }
    return null
  }

  private getFallbackAnalysis(stage: string): {
    insight: string
    emotionalState: string
    growthIndicators: string[]
  } {
    const fallbacks = {
      initial: {
        insight: "从这段记录中，可以看出你正在思考重要的人生议题。这体现了你的内省能力和对成长的渴望，这种自我觉察本身就是一种积极的心理资源。",
        emotionalState: "具有反思意识，内心有成长的渴望",
        growthIndicators: ["自我觉察", "内省能力", "成长意识"]
      },
      default: {
        insight: "通过与过去自己的对话，你展现出了对内在世界的探索能力。这种跨时空的自我对话体现了你在自我认知和情感整合方面的发展。",
        emotionalState: "开放探索，愿意与内在对话",
        growthIndicators: ["自我对话", "情感整合", "时间觉察", "内在探索"]
      }
    }

    return stage === 'initial' ? fallbacks.initial : fallbacks.default
  }
}

export const aiService = new AIService()
export type { AIMessage }