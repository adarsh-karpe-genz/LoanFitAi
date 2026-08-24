/**
 * Future Phase 4 Explainable AI (XAI) & Advisor Interfaces
 */

export interface AdvisorChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface XAIExplanationResult {
  topRecommendationReason: string;
  tradeoffAnalysis: string[];
  keyFactors: {
    factor: string;
    impact: 'positive' | 'neutral' | 'negative';
    description: string;
  }[];
}
