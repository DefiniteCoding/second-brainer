
import { Tag, Note, AppState } from '@/types/note';

export interface NoteState {
  notes: {
    [id: string]: {
      note: Note;
      dirty: boolean;
    };
  };
  activeNoteId: string | null;
}

export interface NotesContextType {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string;
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getNoteById: (id: string) => Note | undefined;
  tags: Tag[];
  addTag: (tag: Omit<Tag, 'id'>) => string;
  deleteTag: (id: string) => void;
  connectNotes: (sourceId: string, targetId: string) => void;
  disconnectNotes: (sourceId: string, targetId: string) => void;
  findBacklinks: (noteId: string) => Note[];
  getSuggestedConnections: (noteId: string) => Note[];
  parseNoteContent: (content: string) => { parsedContent: React.ReactNode, mentionedNoteIds: string[] };
  getRecentlyViewedNotes: () => Note[];
  addToRecentViews: (noteId: string) => void;
  exportNotes: () => void;
  importNotes: (files: FileList) => Promise<void>;
  isDirty: (noteId: string) => boolean;
  markClean: (noteId: string) => void;
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
  setNotes: (notes: Note[]) => void;
}
