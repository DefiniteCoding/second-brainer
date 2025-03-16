import { Note } from '@/contexts/NotesContext';
import { AIResponse } from '@/types/ai.types';
import { callGeminiApi } from '../api/geminiApi';

export const findRelatedNotes = async (
  currentNote: Note,
  allNotes: Note[]
): Promise<AIResponse> => {
  try {
    // Extract a list of other note titles and snippets
    const otherNotes = allNotes
      .filter(note => note.id !== currentNote.id)
      .map(note => ({
        id: note.id,
        title: note.title,
        snippet: note.content.substring(0, 200) + (note.content.length > 200 ? '...' : '')
      }));

    const prompt = `
      I have a note with the following title and content:
      Title: ${currentNote.title}
      Content: ${currentNote.content.substring(0, 2000)}${currentNote.content.length > 2000 ? '...' : ''}
      
      And I have these other notes (id, title, and snippet):
      ${otherNotes.map((note, i) => `${i+1}. ID: ${note.id}, Title: "${note.title}", Snippet: "${note.snippet}"`).join('\n')}
      
      Which of these other notes are most semantically related to my current note?
      Return only a JSON array of IDs for the most related notes, with no additional text.
      Only include notes that have a meaningful connection.
    `;

    const data = await callGeminiApi(prompt, { temperature: 0.1 });
    const relatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!relatedText) {
      return { error: 'No related notes found' };
    }

    // Parse the JSON array from the response
    try {
      const cleanedText = relatedText.replace(/```json|```/g, '').trim();
      const suggestedConnections = JSON.parse(cleanedText);
      return { suggestedConnections };
    } catch (parseError) {
      console.error('Error parsing related notes:', parseError, relatedText);
      
      // Fallback: Try to extract note IDs even if not valid JSON
      const extractedIds = relatedText
        .match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g) || [];
      
      return { suggestedConnections: extractedIds };
    }

  } catch (error) {
    console.error('Error finding related notes:', error);
    return { error: error instanceof Error ? error.message : 'An error occurred while finding related notes' };
  }
}; 