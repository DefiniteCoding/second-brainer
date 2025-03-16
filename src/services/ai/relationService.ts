import { Note } from '@/contexts/NotesContext';
import { AIResponse } from '@/types/ai.types';
import { callGeminiApi } from '../api/geminiApi';

export const findRelatedNotes = async (content: string): Promise<AIResponse> => {
  try {
    const prompt = `
      Analyze this text and identify key concepts, themes, and topics that could be used to find related content.
      Return only a JSON array of keywords and phrases that capture the main ideas.
      
      Text to analyze:
      ${content}
    `;

    const data = await callGeminiApi(prompt, { temperature: 0.1 });
    const relatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!relatedText) {
      return { error: 'No related concepts found' };
    }

    try {
      const cleanedText = relatedText.replace(/```json|```/g, '').trim();
      const concepts = JSON.parse(cleanedText);
      return { concepts };
    } catch (parseError) {
      console.error('Error parsing concepts:', parseError, relatedText);
      
      // Fallback: Try to extract concepts even if not valid JSON
      const extractedConcepts = relatedText
        .replace(/["'\[\]\{\}]/g, '')
        .split(/,|\n/)
        .map(k => k.trim())
        .filter(k => k && k.length > 1);
      
      return { concepts: extractedConcepts };
    }

  } catch (error) {
    console.error('Error finding related concepts:', error);
    return { error: error instanceof Error ? error.message : 'An error occurred while finding related concepts' };
  }
}; 