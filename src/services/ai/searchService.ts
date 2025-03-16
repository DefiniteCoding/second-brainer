import { Note } from '@/contexts/NotesContext';
import { callGeminiApi } from '../api/geminiApi';

export const naturalLanguageSearch = async (
  query: string,
  notes: Note[]
): Promise<Note[]> => {
  try {
    // Create a compact representation of notes
    const notesData = notes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content.substring(0, 500) + (note.content.length > 500 ? '...' : '')
    }));

    const prompt = `
      Given the following search query and list of notes, return the IDs of notes that best match the query.
      Return only a JSON array of note IDs, with no additional text.
      Order them by relevance (most relevant first).

      Search query: "${query}"

      Notes:
      ${notesData.map((note, i) => 
        `${i+1}. ID: ${note.id}
        Title: ${note.title}
        Content: ${note.content}`
      ).join('\n\n')}
    `;

    const data = await callGeminiApi(prompt, { temperature: 0.1 });
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      return [];
    }

    try {
      const cleanedText = resultText.replace(/```json|```/g, '').trim();
      const matchingIds = JSON.parse(cleanedText);
      
      // Return notes in the order of relevance from the AI response
      return matchingIds
        .map(id => notes.find(note => note.id === id))
        .filter((note): note is Note => note !== undefined);
    } catch (parseError) {
      console.error('Error parsing search results:', parseError, resultText);
      
      // Fallback: Try to extract note IDs even if not valid JSON
      const extractedIds = resultText
        .match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g) || [];
      
      return extractedIds
        .map(id => notes.find(note => note.id === id))
        .filter((note): note is Note => note !== undefined);
    }

  } catch (error) {
    console.error('Error in natural language search:', error);
    return [];
  }
}; 