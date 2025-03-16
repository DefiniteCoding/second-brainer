import { GeminiConfig } from '@/types/ai.types';
import { getApiKey } from '@/services/ai';

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export const callGeminiApi = async (prompt: string, config: Partial<GeminiConfig> = {}): Promise<any> => {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set up your API key first.');
  }

  const finalConfig = {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    ...config
  };

  const response = await fetch(GEMINI_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: finalConfig.temperature,
        topK: finalConfig.topK,
        topP: finalConfig.topP
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to call Gemini API');
  }

  return response.json();
}; 