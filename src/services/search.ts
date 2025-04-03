
import { Note } from '@/contexts/NotesContext';
import { GeminiService } from './gemini';

export const searchNotes = (
  notes: Note[], 
  query: string, 
  useAI: boolean = false
): Note[] => {
  if (!query.trim()) return [];

  // Basic text search logic
  return notes.filter(note => 
    note.title.toLowerCase().includes(query.toLowerCase()) ||
    note.content.toLowerCase().includes(query.toLowerCase())
  );
};
