import { Note } from '@/contexts/NotesContext';
import { encryptApiKey, decryptApiKey } from '@/lib/encryption';
import { generateSummary } from './summaryService';
import { extractKeywords } from './keywordService';
import { findRelatedNotes } from './relationService';

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

    // TODO: Implement natural language search using Gemini API
    // For now, return a simple text match
    const searchTerms = query.toLowerCase().split(' ');
    return notes.filter(note => {
      const content = (note.title + ' ' + note.content).toLowerCase();
      return searchTerms.every(term => content.includes(term));
    });
  } catch (error) {
    console.error('Error performing natural language search:', error);
    return [];
  }
};

export { generateSummary, extractKeywords, findRelatedNotes }; 