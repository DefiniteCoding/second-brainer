
import { Note } from '@/contexts/NotesContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiService } from './gemini';

export interface SearchOptions {
  contentTypes?: string[];
  tags?: string[];
}

// Basic search without AI
const basicTextSearch = (notes: Note[], query: string): Note[] => {
  return notes.filter(note => 
    note.title.toLowerCase().includes(query.toLowerCase()) ||
    note.content.toLowerCase().includes(query.toLowerCase()) ||
    (note.tags && note.tags.some(tag => 
      tag.name.toLowerCase().includes(query.toLowerCase())
    ))
  );
};

// AI-powered semantic search
const aiSearch = async (notes: Note[], query: string): Promise<Note[]> => {
  const apiKey = await GeminiService.getApiKey();
  if (!apiKey) {
    console.warn('No Gemini API key found for AI search');
    return basicTextSearch(notes, query);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Update to use the supported model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Prepare notes data for the AI
    const notesData = notes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content.slice(0, 1000), // Limit content length to avoid token limits
      tags: note.tags ? note.tags.map(tag => tag.name).join(', ') : ''
    }));
    
    // Create a prompt for the AI
    const prompt = `
    I have the following notes, and I need to find which ones are most relevant to the query: "${query}"
    
    Here are the notes:
    ${JSON.stringify(notesData)}
    
    Return ONLY a JSON array of note IDs ordered by relevance to the query. 
    For example: ["id1", "id2", "id3"]
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse the JSON array from the response
    const regex = /\[(.*)\]/s;
    const match = text.match(regex);
    
    if (match && match[0]) {
      try {
        const relevantIds = JSON.parse(match[0]);
        
        // Get notes by ID and maintain the relevance order
        const relevantNotes = relevantIds
          .map(id => notes.find(note => note.id === id))
          .filter(Boolean);
        
        // If AI found nothing, fall back to basic search
        if (relevantNotes.length === 0) {
          return basicTextSearch(notes, query);
        }
        
        return relevantNotes;
      } catch (error) {
        console.error('Error parsing AI response:', error);
        return basicTextSearch(notes, query);
      }
    }
    
    return basicTextSearch(notes, query);
  } catch (error) {
    console.error('AI search error:', error);
    return basicTextSearch(notes, query);
  }
};

export const searchNotes = async (
  notes: Note[], 
  query: string, 
  options: SearchOptions = {},
  useAI: boolean = false
): Promise<Note[]> => {
  if (!query.trim()) return [];

  if (useAI) {
    return await aiSearch(notes, query);
  } else {
    return basicTextSearch(notes, query);
  }
};
