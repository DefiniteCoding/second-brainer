import { Note } from '@/contexts/NotesContext';
import * as aiService from './ai';

interface SearchFilters {
  date?: Date;
  contentTypes: string[];
  tags: string[];
}

export const searchNotes = async (
  notes: Note[],
  searchTerm: string,
  filters: SearchFilters,
  isAISearch: boolean
): Promise<Note[]> => {
  if (isAISearch) {
    const results = await aiService.semanticSearch(searchTerm);
    if (results.error || !results.notes) {
      throw new Error(results.error || 'Failed to perform AI search');
    }
    return applyFilters(results.notes, filters);
  }

  // Basic search implementation
  const searchTermLower = searchTerm.toLowerCase();
  let results = notes.filter(note => {
    const titleMatch = note.title.toLowerCase().includes(searchTermLower);
    const contentMatch = note.content.toLowerCase().includes(searchTermLower);
    return titleMatch || contentMatch;
  });

  return applyFilters(results, filters);
};

const applyFilters = (notes: Note[], filters: SearchFilters): Note[] => {
  return notes.filter(note => {
    // Date filter
    if (filters.date) {
      const noteDate = new Date(note.updatedAt || note.createdAt);
      const filterDate = new Date(filters.date);
      
      if (
        noteDate.getFullYear() !== filterDate.getFullYear() ||
        noteDate.getMonth() !== filterDate.getMonth() ||
        noteDate.getDate() !== filterDate.getDate()
      ) {
        return false;
      }
    }

    // Content type filter
    if (filters.contentTypes.length > 0) {
      const noteTypes = determineNoteTypes(note);
      if (!filters.contentTypes.some(type => noteTypes.includes(type))) {
        return false;
      }
    }

    // Tags filter
    if (filters.tags.length > 0) {
      if (!note.tags || !filters.tags.some(tag => note.tags?.includes(tag))) {
        return false;
      }
    }

    return true;
  });
};

const determineNoteTypes = (note: Note): string[] => {
  const types: string[] = ['text']; // All notes have text by default

  // Check for images (assuming markdown image syntax or base64)
  if (note.content.match(/!\[.*?\]\(.*?\)/) || note.content.includes('data:image')) {
    types.push('image');
  }

  // Check for links
  if (note.content.match(/\[.*?\]\(.*?\)/) || note.content.match(/https?:\/\/\S+/)) {
    types.push('link');
  }

  // Check for audio attachments (you may need to adjust this based on your data structure)
  if (note.content.includes('data:audio') || note.content.match(/\.(mp3|wav|ogg)\b/)) {
    types.push('audio');
  }

  // Check for video attachments
  if (note.content.includes('data:video') || note.content.match(/\.(mp4|webm|mov)\b/)) {
    types.push('video');
  }

  return types;
}; 