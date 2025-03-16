import { 
  generateSummary, 
  extractKeywords, 
  findRelatedNotes, 
  naturalLanguageSearch,
  setApiKey,
  hasApiKey 
} from '@/services/ai';
import { Note } from '@/contexts/NotesContext';
import { encryptApiKey, decryptApiKey } from '@/lib/encryption';

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

    // Your existing naturalLanguageSearch implementation using the decrypted apiKey
    // ... rest of the implementation
  } catch (error) {
    console.error('Natural language search error:', error);
    throw error;
  }
};

export { generateSummary } from './summaryService';
export { extractKeywords } from './keywordService';
export { findRelatedNotes } from './relationService'; 