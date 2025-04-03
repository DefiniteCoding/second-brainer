
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Note } from '@/types/note';

// Initialize the Google Generative AI with API key
const getGenerativeAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('geminiApiKey');
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set up your API key first.');
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Performs a natural language search over the notes using the Gemini AI model
 */
export const searchWithGemini = async (query: string, notes: Note[]): Promise<Note[]> => {
  try {
    // Return early if no query or notes
    if (!query.trim() || notes.length === 0) {
      return [];
    }

    const genAI = getGenerativeAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create context for the AI by summarizing the notes
    const notesContext = notes.map(note => ({
      id: note.id,
      title: note.title,
      summary: note.content.substring(0, 100) + (note.content.length > 100 ? '...' : ''),
      tags: note.tags.map(tag => tag.name).join(', ')
    }));

    // Create the prompt for the AI
    const prompt = `
    Search query: "${query}"
    
    I have the following notes in my collection. Please identify the notes most relevant to my search query. 
    Return ONLY the IDs of the relevant notes separated by commas, nothing else.
    
    Notes:
    ${JSON.stringify(notesContext, null, 2)}
    `;

    // Get response from Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Parse the response to get note IDs
    const relevantIds = text.split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);
    
    // Filter notes based on the IDs returned by Gemini
    return notes.filter(note => relevantIds.includes(note.id));
  } catch (error) {
    console.error('Error searching with Gemini:', error);
    throw error;
  }
};

// Function to check if API key exists and is valid
export const checkGeminiApiKey = async (): Promise<boolean> => {
  try {
    const genAI = getGenerativeAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    await model.generateContent("Test");
    return true;
  } catch (error) {
    console.error('Invalid Gemini API key:', error);
    return false;
  }
};

// Function to save API key to localStorage
export const saveGeminiApiKey = (apiKey: string): void => {
  localStorage.setItem('geminiApiKey', apiKey);
};
