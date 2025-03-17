
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
      id: note.id,
      content: `${note.title || ''}\n${note.content}`,
    }));

    // Create a prompt for semantic search
    const prompt = `
      I want to find the most relevant notes that match this search query: "${query}"

      Here are the notes to search through (format: note number, note ID, followed by content):
      ${notesWithIndex.map(note => `Note ${note.index + 1} (ID: ${note.id}):\n${note.content}\n---`).join('\n')}

      Return only a JSON array of objects with these properties:
      - id: the note ID
      - score: a relevance score from 0-100 (higher means more relevant)

      Example response: [{"id":"note-123","score":95},{"id":"note-456","score":80}]
      
      Be generous with relevance scores for semantic matches, not just exact keyword matches.
      Include notes that conceptually relate to the query, even if they don't contain the exact terms.
    `;

    // Call Gemini API with a moderate temperature for a good balance of relevance and flexibility
    const response = await callGeminiApi(prompt, {
      temperature: 0.3,
      topK: 10,
      topP: 0.95,
      maxOutputTokens: 1024
    });
    
    const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!responseText) {
      throw new Error('Empty response from AI');
    }

    try {
      // Extract JSON from response (handling potential text around it)
      const jsonMatch = responseText.match(/\[.*\]/s);
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in response');
      }
      
      const relevanceResults = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(relevanceResults)) {
        throw new Error('Response is not an array');
      }
      
      // Filter notes based on relevance results - requiring score > 50 for better quality matches
      const minScore = 50;
      const matchedNotes = relevanceResults
        .filter(result => result.score > minScore)
        .sort((a, b) => b.score - a.score)
        .map(result => notes.find(note => note.id === result.id))
        .filter((note): note is Note => note !== undefined);
      
      return matchedNotes;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError, responseText);
      
      // Fallback to basic text search if parsing fails
      return fallbackTextSearch(query, notes);
    }
  } catch (error) {
    console.error('Error performing natural language search:', error);
    // Fallback to basic text search
    return fallbackTextSearch(query, notes);
  }
};

// A more robust fallback text search method
const fallbackTextSearch = (query: string, notes: Note[]): Note[] => {
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
  
  // For empty query or all short terms, return empty results
  if (searchTerms.length === 0) {
    return [];
  }
  
  const noteScores = notes.map(note => {
    const content = `${note.title || ''} ${note.content}`.toLowerCase();
    let score = 0;
    
    // Check for exact phrase match (highest score)
    if (content.includes(query.toLowerCase())) {
      score += 100;
    }
    
    // Check for individual term matches
    for (const term of searchTerms) {
      if (content.includes(term)) {
        // Title matches weighted more heavily
        if (note.title.toLowerCase().includes(term)) {
          score += 20;
        } else {
          score += 10;
        }
      }
    }
    
    return { note, score };
  });
  
  // Return notes with scores above 0, sorted by score (highest first)
  return noteScores
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.note);
};

export { generateSummary, extractKeywords, findRelatedNotes };
