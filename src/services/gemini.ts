
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Note } from '@/types/note';

// Initialize the Google Generative AI with the API key
const initializeGeminiApi = (apiKey: string) => {
  return new GoogleGenerativeAI(apiKey);
};

// Function to check if we have a valid API key stored
export const checkGeminiApiKey = async (): Promise<boolean> => {
  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey) {
    return false;
  }

  try {
    const genAI = initializeGeminiApi(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    await model.generateContent("test");
    return true;
  } catch (error) {
    console.error("API key validation error:", error);
    return false;
  }
};

// Function to save the API key to localStorage
export const saveGeminiApiKey = (apiKey: string): void => {
  localStorage.setItem('gemini_api_key', apiKey);
};

// Function to get the stored API key
export const getGeminiApiKey = (): string | null => {
  return localStorage.getItem('gemini_api_key');
};

// Function to search notes using Gemini AI
export const searchWithGemini = async (query: string, notes: Note[]): Promise<Note[]> => {
  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey) {
    throw new Error('API key not found. Please set your Gemini API key first.');
  }

  try {
    const genAI = initializeGeminiApi(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.0-pro",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    // Prepare notes content for semantic search
    const notesContent = notes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content,
      snippet: note.content.substring(0, 100) // Short preview
    }));

    // Create a prompt that includes the user query and all notes data
    const prompt = `
    I want you to act as a semantic search engine for the following notes:
    ${JSON.stringify(notesContent)}
    
    For the query: "${query}"
    
    Find the most relevant notes and return ONLY a JSON array of note IDs, sorted by relevance.
    Do not include any explanation or other text, just return a valid JSON array of strings.
    Example response format: ["id1", "id2", "id3"]
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract the JSON array from the response
    const jsonMatch = text.match(/\[.*?\]/s);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI model');
    }

    const relevantNoteIds = JSON.parse(jsonMatch[0]) as string[];
    
    // Filter and sort notes based on the returned IDs
    const matchedNotes = notes.filter(note => relevantNoteIds.includes(note.id));
    const sortedNotes = relevantNoteIds
      .map(id => matchedNotes.find(note => note.id === id))
      .filter((note): note is Note => !!note);

    return sortedNotes;
  } catch (error) {
    console.error('Error searching with Gemini:', error);
    throw new Error('Failed to search with Gemini API');
  }
};
