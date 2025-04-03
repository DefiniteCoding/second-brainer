
import { Note } from '@/types/note';
import { searchWithGemini } from './gemini';

interface SearchFilters {
  date?: Date;
  dateRange?: { from: Date; to: Date };
  contentTypes: string[];
  tags: string[];
}

export const searchNotes = async (
  notes: Note[],
  searchTerm: string,
  filters: SearchFilters,
  isAISearch: boolean
): Promise<Note[]> => {
  let results: Note[] = [];
  
  if (isAISearch) {
    // Use Gemini for AI-powered search
    results = await searchWithGemini(searchTerm, notes);
  } else {
    // Basic search implementation
    const searchTermLower = searchTerm.toLowerCase();
    results = notes.filter(note => {
      const titleMatch = note.title.toLowerCase().includes(searchTermLower);
      const contentMatch = note.content.toLowerCase().includes(searchTermLower);
      return titleMatch || contentMatch;
    });
  }

  return applyFilters(results, filters);
};

const applyFilters = (notes: Note[], filters: SearchFilters): Note[] => {
  return notes.filter(note => {
    // Date filter
    if (filters.dateRange?.from && filters.dateRange?.to) {
      const noteDate = new Date(note.updatedAt || note.createdAt);
      const fromDate = new Date(filters.dateRange.from);
      const toDate = new Date(filters.dateRange.to);
      
      // Set time to start and end of day for accurate comparison
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);
      
      if (noteDate < fromDate || noteDate > toDate) {
        return false;
      }
    } else if (filters.date) {
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
      if (!note.tags || !filters.tags.some(tagId => note.tags.some(tag => tag.id === tagId))) {
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
