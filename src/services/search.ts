
import { Note } from '@/types/note';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiService } from './gemini';

export interface SearchOptions {
  contentTypes?: string[];
  tags?: string[];
}

// Basic search without AI
const basicTextSearch = (notes: Note[], query: string): Note[] => {
  if (!query.trim()) return [];
  
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Prepare notes data for the AI
    const notesData = notes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content.slice(0, 1000), // Limit content length
      tags: note.tags ? note.tags.map(tag => tag.name).join(', ') : ''
    }));
    
    const prompt = `
    I have the following notes, and I need to find which ones are most relevant to the query: "${query}"
    
    Here are the notes:
    ${JSON.stringify(notesData)}
    
    Return ONLY a JSON array of note IDs ordered by relevance to the query. 
    For example: ["id1", "id2", "id3"]
    `;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
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
        
        return relevantNotes.length > 0 ? relevantNotes : basicTextSearch(notes, query);
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
  return useAI ? await aiSearch(notes, query) : basicTextSearch(notes, query);
};
