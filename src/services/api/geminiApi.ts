import { GeminiConfig } from '@/types/ai.types';

let geminiApiKey = 'AIzaSyDzeU0MahoC4Y4EM6NxjinKva7cv0AtU-g';

export const setApiKey = (key: string): void => {
  geminiApiKey = key;
  localStorage.setItem('gemini-api-key', key);
};

export const getApiKey = (): string => {
  return geminiApiKey;
};

export const hasApiKey = (): boolean => {
  return !!geminiApiKey;
};

export const DEFAULT_CONFIG: GeminiConfig = {
  temperature: 0.2,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 800,
};

export const callGeminiApi = async (prompt: string, config: Partial<GeminiConfig> = {}): Promise<any> => {
  if (!geminiApiKey) {
    throw new Error('No API key found. Please set your Gemini API key in Settings.');
  }

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': geminiApiKey
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        ...DEFAULT_CONFIG,
        ...config
      }
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to call Gemini API');
  }

  return data;
}; 