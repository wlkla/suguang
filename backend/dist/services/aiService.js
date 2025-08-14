"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = void 0;
class AIService {
    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY || 'sk---jingyasen---lnYU+fwaaHuhoeZUvnlzHA==';
        // 使用与前端相同的LLM服务
        this.baseUrl = process.env.LLM_BASE_URL || 'http://llms-se.baidu-int.com:8200';
    }
    async callAI(messages) {
        const apiUrl = `${this.baseUrl}/chat/completions`;
        console.log('🌐 AI API URL:', apiUrl);
        console.log('🔑 API Key:', this.apiKey.substring(0, 10) + '...');
        const headers = {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
        };
        const payload = {
            model: "gpt-4o",
            messages,
            temperature: 0.7,
            max_tokens: 1500
        };
        console.log('📤 Sending request to AI service:', {
            url: apiUrl,
            messageCount: messages.length,
            model: payload.model
        });
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });
            console.log('📡 AI Response status:', response.status);
            if (!response.ok) {
                const error = await response.text();
                console.log('❌ AI Response error:', error);
                throw new Error(`HTTP error! status: ${response.status}, message: ${error}`);
            }
            const data = await response.json();
            console.log('📊 AI Response data structure:', {
                hasChoices: !!data.choices,
                choicesLength: data.choices?.length || 0
            });
            if (data.choices && data.choices.length > 0) {
                const content = data.choices[0].message.content.trim();
                console.log('📝 AI Content length:', content.length);
                return content;
            }
            else {
                throw new Error("No valid response received from AI");
            }
        }
        catch (error) {
            console.error('❌ AI API Error:', error);
            throw error;
        }
    }
    async analyzePsychology(memoryRecord, conversationData, stage) {
        const systemPrompt = this.createPsychologyAnalysisPrompt();
        const userPrompt = this.formatAnalysisInput(memoryRecord, conversationData, stage);
        const messages = [
            {
                role: 'system',
                content: systemPrompt
            },
            {
                role: 'user',
                content: userPrompt
            }
        ];
        console.log('🔍 Starting psychology analysis for stage:', stage);
        console.log('📝 Memory record:', memoryRecord.title);
        console.log('💬 Conversation data:', conversationData ? `${conversationData.length} messages` : 'none');
        try {
            console.log('🤖 Calling AI service...');
            const response = await this.callAI(messages);
            console.log('✅ AI Analysis Response received:', response.substring(0, 200) + '...');
            const result = this.parseAnalysisResponse(response);
            console.log('🎯 Parsed analysis result:', result);
            return result;
        }
        catch (error) {
            console.error('❌ Psychology analysis error:', error);
            console.log('🔄 Falling back to backup analysis for stage:', stage);
            // 返回备用分析
            const fallback = this.getFallbackAnalysis(stage);
            console.log('💾 Using fallback analysis:', fallback);
            return fallback;
        }
    }
    createPsychologyAnalysisPrompt() {
        return `你是一位专业的心理分析师，专门分析个人成长轨迹和心理变化。你的任务是基于用户的记忆记录和与过去自己的对话，提供深度的心理洞察分析。

请按照以下格式返回JSON分析结果：

{
  "insight": "详细的心理洞察分析（150-200字）",
  "emotionalState": "当前情绪状态描述（30-50字）", 
  "growthIndicators": ["成长指标1", "成长指标2", "成长指标3", "成长指标4"]
}

分析要求：

1. **心理洞察 (insight)**：
   - 分析用户在这个时间点的内心状态、思维模式变化
   - 识别关键的心理转折点或成长момент
   - 探讨用户的应对策略、价值观变化
   - 用温暖、专业的语调，避免病理化描述
   - 重点关注成长性和积极变化

2. **情绪状态 (emotionalState)**：
   - 准确描述当前的情绪基调和心理状态
   - 考虑情绪的复杂性和层次性
   - 使用具体、形象的词汇

3. **成长指标 (growthIndicators)**：
   - 提供3-4个关键的成长维度标签
   - 例如：自我觉察、情绪调节、人际边界、价值澄清、应对能力、内在力量等
   - 确保指标具体且积极

请确保分析：
- 基于实际提供的内容，不要臆测
- 保持客观和专业性
- 突出积极的成长方面
- 语言温暖但不过分乐观
- 返回有效的JSON格式`;
    }
    formatAnalysisInput(memoryRecord, conversationData, stage) {
        let input = `【分析阶段】${stage}\n\n`;
        input += `【原始记忆记录】\n`;
        input += `标题: ${memoryRecord.title || '无标题'}\n`;
        input += `内容: ${memoryRecord.content}\n`;
        input += `记录时间: ${memoryRecord.createdAt}\n`;
        if (memoryRecord.mood) {
            input += `当时心情评分: ${memoryRecord.mood}/5\n`;
        }
        if (memoryRecord.tags) {
            input += `标签: ${memoryRecord.tags}\n`;
        }
        if (conversationData && conversationData.length > 0) {
            input += `\n【与过去自己的对话记录】\n`;
            conversationData.forEach((msg, index) => {
                const sender = msg.sender === 'user' ? '现在的我' : '过去的我';
                input += `${sender}: ${msg.text}\n`;
            });
            const userMessages = conversationData.filter(msg => msg.sender === 'user');
            input += `\n【对话统计】用户共发送了${userMessages.length}条消息，进行了深度的自我对话。`;
        }
        else {
            input += `\n【分析类型】这是基于原始记忆的初步分析，尚未进行与过去自己的对话。`;
        }
        return input;
    }
    parseAnalysisResponse(response) {
        try {
            // 尝试直接解析JSON
            const parsed = JSON.parse(response);
            if (parsed.insight && parsed.emotionalState && parsed.growthIndicators) {
                return {
                    insight: parsed.insight,
                    emotionalState: parsed.emotionalState,
                    growthIndicators: Array.isArray(parsed.growthIndicators) ? parsed.growthIndicators : []
                };
            }
        }
        catch (error) {
            // 如果JSON解析失败，尝试从文本中提取信息
            console.log('JSON parsing failed, trying text extraction');
        }
        // 文本解析备用方案
        const insight = this.extractField(response, 'insight') || response.substring(0, 200);
        const emotionalState = this.extractField(response, 'emotionalState') || '情绪状态复杂，正在成长中';
        const growthIndicators = this.extractArray(response, 'growthIndicators') || ['自我觉察', '内在成长'];
        return { insight, emotionalState, growthIndicators };
    }
    extractField(text, field) {
        const patterns = [
            new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`, 'i'),
            new RegExp(`${field}\\s*[:：]\\s*(.+?)(?=\\n|$)`, 'i')
        ];
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }
        return null;
    }
    extractArray(text, field) {
        const patterns = [
            new RegExp(`"${field}"\\s*:\\s*\\[([^\\]]+)\\]`, 'i'),
            new RegExp(`${field}\\s*[:：]\\s*\\[([^\\]]+)\\]`, 'i')
        ];
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1]
                    .split(/[,，]/)
                    .map(item => item.replace(/["\s]/g, ''))
                    .filter(item => item.length > 0);
            }
        }
        return null;
    }
    getFallbackAnalysis(stage) {
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
        };
        return stage === 'initial' ? fallbacks.initial : fallbacks.default;
    }
}
exports.aiService = new AIService();
//# sourceMappingURL=aiService.js.map