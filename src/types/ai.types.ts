
export interface AIResponse {
  summary?: string;
  keywords?: string[];
  concepts?: string[];
  suggestedConnections?: string[];
  error?: string;
  success?: boolean;
  data?: {
    summary?: string;
    keywords?: string[];
    concepts?: string[];
    suggestedConnections?: string[];
  };
}

export interface SummaryOptions {
  length?: 'short' | 'medium' | 'long';
  focus?: 'general' | 'technical' | 'creative';
}

export interface GeminiConfig {
  temperature: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
} 
