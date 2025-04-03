
import { AIResponse } from '@/types/ai.types';
import { callGeminiApi } from '../api/geminiApi';

export const extractKeywords = async (content: string): Promise<AIResponse> => {
  try {
    const prompt = `
      Based on the following text, extract or generate between 3-5 general category tags that would best classify this content.
      
      Focus on identifying broad themes, topics, or categories that would help organize this content in a knowledge management system.
      Don't just extract specific words from the text - instead, determine the general categories or domains this content belongs to.
      
      For example:
      - A recipe might get tags like "Cooking", "Food", "Recipes", not specific ingredients
      - A programming tutorial might get "Programming", "Web Development", "Tutorial", not specific code terms
      - A journal entry might get "Journal", "Personal", "Reflection", not specific events mentioned
      
      Return only a JSON array of strings with no additional text.
      
      Text to analyze:
      ${content}
    `;

    const data = await callGeminiApi(prompt, { temperature: 0.2 });
    const keywordsText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!keywordsText) {
      return { error: 'No keywords extracted', success: false };
    }

    // Parse the JSON array from the response
    try {
      const cleanedText = keywordsText.replace(/```json|```/g, '').trim();
      const keywords = JSON.parse(cleanedText);
      return { keywords, success: true, data: { keywords } };
    } catch (parseError) {
      console.error('Error parsing keywords:', parseError, keywordsText);
      
      // Fallback: Try to extract keywords even if not valid JSON
      const extractedKeywords = keywordsText
        .replace(/["'\[\]\{\}]/g, '')
        .split(/,|\n/)
        .map(k => k.trim())
        .filter(k => k && k.length > 1);
      
      return { keywords: extractedKeywords, success: true, data: { keywords: extractedKeywords } };
    }

  } catch (error) {
    console.error('Error extracting keywords:', error);
    return { 
      error: error instanceof Error ? error.message : 'An error occurred while extracting keywords',
      success: false 
    };
  }
};
