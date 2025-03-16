import { AIResponse } from '@/types/ai.types';
import { callGeminiApi } from '../api/geminiApi';

export const extractKeywords = async (content: string): Promise<AIResponse> => {
  try {
    const prompt = `
      Extract the most important keywords from the following text.
      Return only a JSON array of strings with no additional text.
      
      Text to analyze:
      ${content}
    `;

    const data = await callGeminiApi(prompt, { temperature: 0.1 });
    const keywordsText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!keywordsText) {
      return { error: 'No keywords extracted' };
    }

    // Parse the JSON array from the response
    try {
      const cleanedText = keywordsText.replace(/```json|```/g, '').trim();
      const keywords = JSON.parse(cleanedText);
      return { keywords };
    } catch (parseError) {
      console.error('Error parsing keywords:', parseError, keywordsText);
      
      // Fallback: Try to extract keywords even if not valid JSON
      const extractedKeywords = keywordsText
        .replace(/["'\[\]\{\}]/g, '')
        .split(/,|\n/)
        .map(k => k.trim())
        .filter(k => k && k.length > 1);
      
      return { keywords: extractedKeywords };
    }

  } catch (error) {
    console.error('Error extracting keywords:', error);
    return { error: error instanceof Error ? error.message : 'An error occurred while extracting keywords' };
  }
}; 