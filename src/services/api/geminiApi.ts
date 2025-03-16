import { GeminiConfig } from '@/types/ai.types';
import { getApiKey } from '@/services/ai';

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const callGeminiApi = async (prompt: string, config: Partial<GeminiConfig> = {}): Promise<any> => {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set up your API key first.');
  }

  const finalConfig = {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
    ...config
  };

  try {
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
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ],
        generationConfig: {
          temperature: finalConfig.temperature,
          topK: finalConfig.topK,
          topP: finalConfig.topP,
          maxOutputTokens: finalConfig.maxOutputTokens,
          stopSequences: []
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to call Gemini API');
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated from Gemini API');
    }

    return data;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}; 