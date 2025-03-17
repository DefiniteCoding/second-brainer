
import React, { createContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveNotesToLocalStorage, loadNotesFromLocalStorage, downloadNotesAsMarkdown, metadataDB } from '@/utils/markdownStorage';
import { Note, Tag } from '@/types/notes.types';
import { generateDefaultTitle, parseNoteContent, getSuggestedConnections } from '@/utils/noteUtils';
import { format } from 'date-fns';

// Re-export the types for backward compatibility
export type { Note, Tag } from '@/types/notes.types';

interface NotesContextType {
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
}

export const NotesContext = createContext<NotesContextType | undefined>(undefined);

const STORAGE_KEY = 'second-brain-notes';
const TAGS_STORAGE_KEY = 'second-brain-tags';
const RECENT_VIEWS_KEY = 'second-brain-recent-views';

const DEFAULT_TAGS: Tag[] = [
  { id: uuidv4(), name: 'Important', color: '#EF4444' },
  { id: uuidv4(), name: 'Work', color: '#3B82F6' },
  { id: uuidv4(), name: 'Personal', color: '#10B981' },
  { id: uuidv4(), name: 'Idea', color: '#8B5CF6' },
];

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>(DEFAULT_TAGS);
  const [recentViews, setRecentViews] = useState<string[]>([]);
  const [dbInitialized, setDbInitialized] = useState(false);

  // Initialize the metadata database
  useEffect(() => {
    console.log('Initializing metadataDB...');
    try {
      metadataDB.init();
      setDbInitialized(true);
      console.log('metadataDB initialized successfully');
    } catch (error) {
      console.error('Failed to initialize metadataDB:', error);
    }
  }, []);

  // Load initial data from localStorage
  useEffect(() => {
    console.log('Loading initial data...');
    try {
      const savedTags = localStorage.getItem(TAGS_STORAGE_KEY);
      if (savedTags) {
        try {
          const parsedTags = JSON.parse(savedTags);
          console.log('Loaded tags:', parsedTags);
          setTags(parsedTags);
        } catch (error) {
          console.error('Failed to parse tags from localStorage:', error);
          setTags(DEFAULT_TAGS);
        }
      } else {
        console.log('No saved tags found, using default tags');
        setTags(DEFAULT_TAGS);
      }
      
      const loadedNotes = loadNotesFromLocalStorage(tags);
      console.log('Loaded notes:', loadedNotes);
      setNotes(loadedNotes);
      
      const savedRecentViews = localStorage.getItem(RECENT_VIEWS_KEY);
      if (savedRecentViews) {
        try {
          const parsedRecentViews = JSON.parse(savedRecentViews);
          console.log('Loaded recent views:', parsedRecentViews);
          setRecentViews(parsedRecentViews);
        } catch (error) {
          console.error('Failed to parse recent views from localStorage:', error);
        }
      }
    } catch (error) {
      console.error('Error during initial data load:', error);
    }
  }, []);

  // Save notes to localStorage when they change
  useEffect(() => {
    if (notes.length > 0) {
      console.log('Saving notes to localStorage...');
      try {
        saveNotesToLocalStorage(notes, tags);
        console.log('Notes saved successfully');
        
        if (dbInitialized) {
          console.log('Storing metadata...');
          metadataDB.storeMetadata(notes);
          console.log('Metadata stored successfully');
        }
      } catch (error) {
        console.error('Error saving notes:', error);
      }
    }
  }, [notes, tags, dbInitialized]);
  
  // Save tags to localStorage when they change
  useEffect(() => {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
  }, [tags]);
  
  // Save recent views to localStorage when they change
  useEffect(() => {
    localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(recentViews));
  }, [recentViews]);

  // Add a new note
  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    
    const { mentionedNoteIds } = parseNoteContent(note.content, notes);
    
    const newNote: Note = {
      ...note,
      id: uuidv4(),
      title: note.title || generateDefaultTitle(now),
      createdAt: now,
      updatedAt: now,
      connections: [],
      mentions: mentionedNoteIds,
    };
    setNotes((prevNotes) => [newNote, ...prevNotes]);
    return newNote.id;
  };

  const createNote = addNote;

  // Update an existing note
  const updateNote = (id: string, noteUpdate: Partial<Note>) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => {
        if (note.id === id) {
          let updatedMentions = note.mentions || [];
          if (noteUpdate.content) {
            const { mentionedNoteIds } = parseNoteContent(noteUpdate.content, notes);
            updatedMentions = mentionedNoteIds;
          }
          
          return { 
            ...note, 
            ...noteUpdate, 
            mentions: updatedMentions,
            updatedAt: new Date() 
          };
        }
        return note;
      })
    );
  };

  // Delete a note
  const deleteNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    
    setNotes((prevNotes) =>
      prevNotes.map((note) => ({
        ...note,
        connections: note.connections?.filter(connId => connId !== id) || [],
        mentions: note.mentions?.filter(mentionId => mentionId !== id) || []
      }))
    );
  };

  // Get a note by its ID
  const getNoteById = (id: string) => {
    return notes.find((note) => note.id === id);
  };

  // Add a new tag
  const addTag = (tag: Omit<Tag, 'id'>) => {
    const newTag = { ...tag, id: uuidv4() };
    setTags((prevTags) => [...prevTags, newTag]);
    return newTag.id;
  };

  // Delete a tag
  const deleteTag = (id: string) => {
    setTags((prevTags) => prevTags.filter((tag) => tag.id !== id));
    
    setNotes((prevNotes) =>
      prevNotes.map((note) => ({
        ...note,
        tags: note.tags.filter((tag) => tag.id !== id),
        updatedAt: new Date(),
      }))
    );
  };

  // Connect two notes
  const connectNotes = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    setNotes((prevNotes) =>
      prevNotes.map((note) => {
        if (note.id === sourceId) {
          const connections = note.connections || [];
          if (!connections.includes(targetId)) {
            return {
              ...note,
              connections: [...connections, targetId],
              updatedAt: new Date(),
            };
          }
        }
        return note;
      })
    );
  };

  // Disconnect two notes
  const disconnectNotes = (sourceId: string, targetId: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => {
        if (note.id === sourceId) {
          return {
            ...note,
            connections: (note.connections || []).filter(id => id !== targetId),
            updatedAt: new Date(),
          };
        }
        return note;
      })
    );
  };

  // Find notes that link to the given note
  const findBacklinks = (noteId: string): Note[] => {
    return notes.filter(note => 
      (note.connections && note.connections.includes(noteId)) || 
      (note.mentions && note.mentions.includes(noteId))
    );
  };

  // Wrapper for the imported getSuggestedConnections function
  const getSuggestedConnectionsWrapper = (noteId: string): Note[] => {
    const currentNote = getNoteById(noteId);
    if (!currentNote) return [];
    return getSuggestedConnections(noteId, currentNote, notes);
  };

  // Wrapper for the imported parseNoteContent function
  const parseNoteContentWrapper = (content: string): { parsedContent: React.ReactNode, mentionedNoteIds: string[] } => {
    return parseNoteContent(content, notes);
  };

  // Track recently viewed notes
  const addToRecentViews = (noteId: string) => {
    setRecentViews(prevViews => {
      const filteredViews = prevViews.filter(id => id !== noteId);
      return [noteId, ...filteredViews].slice(0, 10);
    });
  };

  // Get recently viewed notes
  const getRecentlyViewedNotes = (): Note[] => {
    return recentViews
      .map(id => getNoteById(id))
      .filter((note): note is Note => note !== undefined);
  };

  // Export notes as markdown files
  const exportNotes = () => {
    downloadNotesAsMarkdown(notes, tags);
  };

  // Import notes from files
  const importNotes = async (files: FileList): Promise<void> => {
    if (files.length === 0) return;
    
    console.log(`Would import ${files.length} files`);
    
    Array.from(files).forEach(file => {
      console.log(`Would import: ${file.name}`);
    });
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        addNote,
        createNote,
        updateNote,
        deleteNote,
        getNoteById,
        tags,
        addTag,
        deleteTag,
        connectNotes,
        disconnectNotes,
        findBacklinks,
        getSuggestedConnections: getSuggestedConnectionsWrapper,
        parseNoteContent: parseNoteContentWrapper,
        getRecentlyViewedNotes,
        addToRecentViews,
        exportNotes,
        importNotes
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

// Export the hook from the local file for backward compatibility
export { useNotes } from '@/hooks/useNotesContext';
