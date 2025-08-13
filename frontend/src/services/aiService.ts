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
  private readonly baseUrl = "http://llms-se.baidu-int.com:8200"
  private readonly apiKey = "sk---jingyasen---lnYU+fwaaHuhoeZUvnlzHA=="

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
        content: "你是一个温暖、善解人意的AI伙伴，专门帮助用户探索内心世界。你会通过深入的提问引导用户表达自己的想法、感受和观点。请保持对话的自然流畅，每次只问一个问题，让用户感到舒适和被理解。"
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
      return "很抱歉，我现在无法回应。请稍后再试，或者继续分享你的想法。"
    }
  }

  // Method for starting a conversation
  async startConversation(): Promise<string> {
    const initialPrompt = "开始一段深度的思想对话"
    return this.callAI(initialPrompt)
  }

  // Method for continuing conversation with context
  async continueConversation(userMessage: string, conversationHistory: AIMessage[]): Promise<string> {
    return this.callAI(userMessage, conversationHistory)
  }
}

export const aiService = new AIService()
export type { AIMessage }