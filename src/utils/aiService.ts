
import { Note } from '@/contexts/NotesContext';

interface AIResponse {
  summary?: string;
  keywords?: string[];
  suggestedConnections?: string[];
  error?: string;
}

interface SummaryOptions {
  length?: 'short' | 'medium' | 'long';
  focus?: 'general' | 'technical' | 'creative';
}

// AI API Key from environment or storage
let geminiApiKey = localStorage.getItem('gemini-api-key') || '';

export const setApiKey = (key: string): void => {
  geminiApiKey = key;
  localStorage.setItem('gemini-api-key', key);
};

export const getApiKey = (): string => {
  return geminiApiKey;
};

export const hasApiKey = (): boolean => {
  return !!geminiApiKey;
};

export const generateSummary = async (
  content: string, 
  options: SummaryOptions = { length: 'medium', focus: 'general' }
): Promise<AIResponse> => {
  if (!geminiApiKey) {
    return { error: 'No API key found. Please set your Gemini API key in Settings.' };
  }

  try {
    const prompt = `
      Summarize the following text ${options.length === 'short' ? 'very briefly' : 
      options.length === 'long' ? 'comprehensively' : 'concisely'}.
      Focus on ${options.focus === 'technical' ? 'technical details' : 
      options.focus === 'creative' ? 'creative aspects' : 'key points'}.
      
      Text to summarize:
      ${content}
    `;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      return { error: data.error?.message || 'Failed to generate summary' };
    }

    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!summary) {
      return { error: 'No summary generated' };
    }

    return { summary };

  } catch (error) {
    console.error('Error generating summary:', error);
    return { error: 'An error occurred while generating the summary' };
  }
};

export const extractKeywords = async (content: string): Promise<AIResponse> => {
  if (!geminiApiKey) {
    return { error: 'No API key found. Please set your Gemini API key in Settings.' };
  }

  try {
    const prompt = `
      Extract the most important keywords from the following text.
      Return only a JSON array of strings with no additional text.
      
      Text to analyze:
      ${content}
    `;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      return { error: data.error?.message || 'Failed to extract keywords' };
    }

    const keywordsText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!keywordsText) {
      return { error: 'No keywords extracted' };
    }

    // Parse the JSON array from the response
    try {
      const cleanedText = keywordsText.replace(/```json|```/g, '').trim();
      const keywords = JSON.parse(cleanedText);
      return { keywords };
    } catch (parseError) {
      console.error('Error parsing keywords:', parseError, keywordsText);
      
      // Fallback: Try to extract keywords even if not valid JSON
      const extractedKeywords = keywordsText
        .replace(/["'\[\]\{\}]/g, '')
        .split(/,|\n/)
        .map(k => k.trim())
        .filter(k => k && k.length > 1);
      
      return { keywords: extractedKeywords };
    }

  } catch (error) {
    console.error('Error extracting keywords:', error);
    return { error: 'An error occurred while extracting keywords' };
  }
};

export const findRelatedNotes = async (
  currentNote: Note,
  allNotes: Note[]
): Promise<AIResponse> => {
  if (!geminiApiKey) {
    return { error: 'No API key found. Please set your Gemini API key in Settings.' };
  }

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

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      return { error: data.error?.message || 'Failed to find related notes' };
    }

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
    return { error: 'An error occurred while finding related notes' };
  }
};

export const naturalLanguageSearch = async (
  query: string,
  notes: Note[]
): Promise<Note[]> => {
  if (!geminiApiKey) {
    throw new Error('No API key found. Please set your Gemini API key in Settings.');
  }

  try {
    // Create a compact representation of notes
    const notesData = notes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content.substring(0, 300) + (note.content.length > 300 ? '...' : ''),
      tags: note.tags.map(tag => tag.name)
    }));

    const prompt = `
      I have a collection of notes and I want to search them with this query: "${query}"
      
      Here are my notes (as JSON):
      ${JSON.stringify(notesData)}
      
      Return only a JSON array of note IDs that best match my search query, with no additional text.
      Consider semantic meaning, not just keyword matching.
    `;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      throw new Error(data.error?.message || 'Failed to search notes');
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      return [];
    }

    // Parse the JSON array from the response
    try {
      const cleanedText = resultText.replace(/```json|```/g, '').trim();
      const matchingIds = JSON.parse(cleanedText);
      
      // Return the actual note objects
      return notes.filter(note => matchingIds.includes(note.id));
    } catch (parseError) {
      console.error('Error parsing search results:', parseError, resultText);
      
      // Fallback: Try to extract note IDs even if not valid JSON
      const extractedIds = resultText
        .match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g) || [];
      
      return notes.filter(note => extractedIds.includes(note.id));
    }

  } catch (error) {
    console.error('Error performing natural language search:', error);
    throw error;
  }
};
