
import { Note } from '@/contexts/NotesContext';
import { AIResponse } from '@/types/ai.types';
import { callGeminiApi } from '../api/geminiApi';

export const findRelatedNotes = async (content: string): Promise<AIResponse> => {
  try {
    const prompt = `
      Analyze this text and identify key concepts, themes, and topics that could be used to find related content.
      Return only a JSON array of keywords and phrases that capture the main ideas.
      Be specific and detailed in your analysis to find meaningful connections.
      
      Text to analyze:
      ${content}
    `;

    const data = await callGeminiApi(prompt, { temperature: 0.2 });
    const relatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!relatedText) {
      return { success: false, error: 'No related concepts found' };
    }

    try {
      const cleanedText = relatedText.replace(/```json|```/g, '').trim();
      const concepts = JSON.parse(cleanedText);
      return { success: true, data: { concepts } };
    } catch (parseError) {
      console.error('Error parsing concepts:', parseError, relatedText);
      
      // Fallback: Try to extract concepts even if not valid JSON
      const extractedConcepts = relatedText
        .replace(/["'\\[\\]\\{\\}]/g, '')
        .split(/,|\\n/)
        .map(k => k.trim())
        .filter(k => k && k.length > 1);
      
      return { success: true, data: { concepts: extractedConcepts } };
    }

  } catch (error) {
    console.error('Error finding related concepts:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An error occurred while finding related concepts' 
    };
  }
};

// This function searches for notes related to a specific note based on given concepts
export const findRelatedNotesByContent = async (
  sourceNote: Note,
  allNotes: Note[],
  concepts: string[]
): Promise<string[]> => {
  // Filter out the source note and create a map for efficient searching
  const otherNotes = allNotes.filter(note => note.id !== sourceNote.id);
  const relatedNoteIds: string[] = [];
  
  // If no concepts were found, return empty array
  if (!concepts || concepts.length === 0) {
    return [];
  }
  
  // Search for each concept in all notes
  const noteScores: Map<string, number> = new Map();
  
  for (const note of otherNotes) {
    const noteContent = `${note.title} ${note.content}`.toLowerCase();
    let matchScore = 0;
    
    for (const concept of concepts) {
      const conceptLower = concept.toLowerCase();
      // Exact match gets higher score
      if (noteContent.includes(conceptLower)) {
        matchScore += 5;
      }
      
      // Partial match for multi-word concepts
      const words = conceptLower.split(' ');
      if (words.length > 1) {
        const partialMatches = words.filter(word => 
          word.length > 3 && noteContent.includes(word)
        ).length;
        
        if (partialMatches > 0) {
          matchScore += partialMatches * 2;
        }
      }
    }
    
    // If the note has any match score, add it to the scores map
    if (matchScore > 0) {
      noteScores.set(note.id, matchScore);
    }
  }
  
  // Sort by score (highest first) and return top 5 matches
  const sortedNotes = [...noteScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);
  
  return sortedNotes;
};
