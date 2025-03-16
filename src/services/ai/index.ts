import { Note } from '@/contexts/NotesContext';
import { encryptApiKey, decryptApiKey } from '@/lib/encryption';
import { generateSummary } from './summaryService';
import { extractKeywords } from './keywordService';
import { findRelatedNotes } from './relationService';
import { callGeminiApi } from '../api/geminiApi';

const GEMINI_API_KEY_STORAGE_KEY = 'gemini_api_key_encrypted';

export const setApiKey = async (apiKey: string): Promise<void> => {
  try {
    const encryptedKey = await encryptApiKey(apiKey);
    localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, encryptedKey);
  } catch (error) {
    console.error('Error setting API key:', error);
    throw new Error('Failed to save API key');
  }
};

export const getApiKey = async (): Promise<string | null> => {
  try {
    const encryptedKey = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
    if (!encryptedKey) return null;
    return await decryptApiKey(encryptedKey);
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
};

export const hasApiKey = (): boolean => {
  return !!localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
};

export const removeApiKey = (): void => {
  localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
};

export const naturalLanguageSearch = async (query: string, notes: Note[]): Promise<Note[]> => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error('API key not found');
    }

    // Prepare notes for comparison
    const notesWithIndex = notes.map((note, index) => ({
      index,
      content: `${note.title || ''}\n${note.content}`,
    }));

    // Create a prompt for semantic search
    const prompt = `
      I want to find the most relevant notes that match this search query: "${query}"

      Here are the notes to search through (format: note number followed by content):
      ${notesWithIndex.map(note => `Note ${note.index + 1}:\n${note.content}\n---`).join('\n')}

      Return only a JSON array of note numbers (1-based) that are most relevant to the search query, ordered by relevance.
      Example response: [3, 1, 4]
      Only include notes that are actually relevant to the query.
    `;

    // Call Gemini API with a lower temperature for more focused results
    const response = await callGeminiApi(prompt, {
      temperature: 0.1,
      topK: 5,
    });

    try {
      // Parse the response and get the relevant note indices
      const relevantIndices: number[] = JSON.parse(response.trim());
      
      // Convert 1-based indices to 0-based and filter out invalid indices
      return relevantIndices
        .map(index => notes[index - 1])
        .filter(note => note !== undefined);
    } catch (parseError) {
      console.error('Error parsing Gemini API response:', parseError);
      // Fallback to basic text search if parsing fails
      const searchTerms = query.toLowerCase().split(' ');
      return notes.filter(note => {
        const content = `${note.title || ''} ${note.content}`.toLowerCase();
        return searchTerms.every(term => content.includes(term));
      });
    }
  } catch (error) {
    console.error('Error performing natural language search:', error);
    // Fallback to basic text search
    const searchTerms = query.toLowerCase().split(' ');
    return notes.filter(note => {
      const content = `${note.title || ''} ${note.content}`.toLowerCase();
      return searchTerms.every(term => content.includes(term));
    });
  }
};

export { generateSummary, extractKeywords, findRelatedNotes }; 