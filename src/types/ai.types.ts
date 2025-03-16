export interface AIResponse {
  summary?: string;
  keywords?: string[];
  suggestedConnections?: string[];
  error?: string;
}

export interface SummaryOptions {
  length?: 'short' | 'medium' | 'long';
  focus?: 'general' | 'technical' | 'creative';
}

export interface GeminiConfig {
  temperature: number;
  topK: number;
  topP: number;
  maxOutputTokens: number;
} 