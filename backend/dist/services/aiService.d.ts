interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
declare class AIService {
    private readonly apiKey;
    private readonly baseUrl;
    constructor();
    callAI(messages: AIMessage[]): Promise<string>;
    analyzePsychology(memoryRecord: any, conversationData: any[], stage: string): Promise<{
        insight: string;
        emotionalState: string;
        growthIndicators: string[];
    }>;
    private createPsychologyAnalysisPrompt;
    private formatAnalysisInput;
    private parseAnalysisResponse;
    private extractField;
    private extractArray;
    private getFallbackAnalysis;
}
export declare const aiService: AIService;
export type { AIMessage };
//# sourceMappingURL=aiService.d.ts.map