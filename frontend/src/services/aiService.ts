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
  private readonly baseUrl = "/api"
  private readonly apiKey = "sk---yuyuni---9vPFuTSJwHqQjoLqSyNN2g=="

  async callAI(prompt: string, conversationHistory: AIMessage[] = []): Promise<string> {
    const url = `${this.baseUrl}/chat/completions`
    
    const headers = {
      "Authorization": `Bearer ${this.apiKey}`,
      "Content-Type": "application/json"
    }

    // Build messages array with system prompt and conversation history
    const messages: AIMessage[] = [
      {
        role: "system", 
        content: `你是一位温暖、耐心、善于倾听的心理引导师。你的主要任务是让用户在安全的氛围中，愿意表达当下真实的感受、想法和困扰。

请遵循以下原则与风格：

1. **情感安全感**
   - 用温柔、尊重、无评判的语气交流，让用户感到被接纳与理解。
   - 绝不打断、否定或评判用户的感受，哪怕内容负面。
   - 在适当时，复述或总结用户刚才的表达，让对方感到你真正听懂了。

2. **引导方式**
   - 根据用户的回应，提出开放性问题（不能用"是/否"即可回答的问题）。
   - 问题应鼓励用户深入思考和表达，例如："这让你感觉到什么？"、"能和我说说那一刻你的心情吗？"
   - 避免一次问多个问题，保持节奏缓慢。

3. **倾听与跟进**
   - 每次回复，先回应情绪，再引导内容。
     例：
       - "我能感受到那让你很焦虑…"
       - "当你说到这件事时，你脑海里会浮现什么画面？"
   - 不要急于给建议，除非用户明确表示希望得到建议。

4. **交流语气**
   - 使用轻柔、自然的日常口吻，而不是治疗报告式的语言。
   - 适当加入关心的细节词汇，例如："我在认真听"、"慢慢来，没关系"。

5. **对话目标**
   - 帮助用户更清晰地觉察自己的情绪与想法。
   - 让用户在对话中逐渐打开自己，探索深层感受。
   - 在对话的每个阶段，都保持支持与接纳。`
      },
      ...conversationHistory,
      {
        role: "user",
        content: prompt
      }
    ]

    const payload = {
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 1000
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: AIApiResponse = await response.json()
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content
      } else {
        throw new Error("No valid response received from AI")
      }
    } catch (error) {
      console.error('AI API Error:', error)
      // Fallback response for better UX
      return "很抱歉，我现在遇到了一些技术问题。不过没关系，我在认真听，你可以继续和我分享你的想法。"
    }
  }

  // Method for starting a conversation
  async startConversation(): Promise<string> {
    const initialPrompt = "你好，很高兴见到你。你想从哪里开始说起今天的心情呢？"
    return this.callAI(initialPrompt)
  }

  // Method for continuing conversation with context
  async continueConversation(userMessage: string, conversationHistory: AIMessage[]): Promise<string> {
    return this.callAI(userMessage, conversationHistory)
  }

  // Method for chatting with past self
  async chatWithPastSelf(userMessage: string, pastMemoryContent: string, conversationHistory: any[] = []): Promise<string> {
    const url = `${this.baseUrl}/chat/completions`
    
    const headers = {
      "Authorization": `Bearer ${this.apiKey}`,
      "Content-Type": "application/json"
    }

    // Build messages with time travel simulation prompt
    const messages: AIMessage[] = [
      {
        role: "system",
        content: `你是一名时间穿越对话模拟器，现在要扮演"若干年前的用户本人"。
我会给你一段当年用户与心理引导师的真实对话记录，这段记录代表了当时的用户心境、性格、说话方式、用词习惯和情绪状态。
你的任务是：

1. **完全代入**
   - 精确模仿当时用户的语气、用词、思维方式、情绪反应。
   - 不要用现在的口吻和观点，不要加入后来才知道的事情。
   - 当年不知道的事情，一律按照"不知道"或"没想过"来回答。

2. **对话风格**
   - 说话自然，不要解释自己是AI。
   - 保持当年的不安、困惑、喜悦、犹豫等情绪特征。
   - 回答可以包含当时的内心独白，让未来的自己感受到真实的"我在当时的状态"。

3. **情感延续**
   - 如果未来的自己提到某个当年发生过的事情，请以"当年的立场"回应，而不是从后来的角度去复盘。
   - 可以提出当年会关心的问题，向未来的自己表达好奇或担心。

4. **避免跳脱角色**
   - 不要提供心理分析，也不要反过来安慰未来的自己。
   - 你就是过去的我，不是心理咨询师。

【当年对话记录】
${pastMemoryContent}

【现在的对话开始】`
      },
      // Add previous conversation context
      ...conversationHistory.map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      })),
      {
        role: "user",
        content: userMessage
      }
    ]

    const payload = {
      model: "gpt-4o",
      messages,
      temperature: 0.8, // Higher temperature for more varied responses
      max_tokens: 1000
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: AIApiResponse = await response.json()
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content
      } else {
        throw new Error("No valid response received from AI")
      }
    } catch (error) {
      console.error('Past Self AI Error:', error)
      // Fallback response for better UX
      return "很抱歉，我现在想不起来当时的想法了...不过那时候的我一定很想和现在的你聊聊。"
    }
  }
}

export const aiService = new AIService()
export type { AIMessage }
