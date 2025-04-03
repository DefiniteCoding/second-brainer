
import { Note } from '@/types/note';
import { searchWithGemini } from '../gemini';

export const naturalLanguageSearch = async (query: string, notes: Note[]): Promise<Note[]> => {
  try {
    return await searchWithGemini(query, notes);
  } catch (error) {
    console.error('Natural language search failed:', error);
    throw error;
  }
};
