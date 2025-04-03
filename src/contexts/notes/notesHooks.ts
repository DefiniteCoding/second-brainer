
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Note, Tag } from '@/types/note';
import { NoteState } from './types';
import { DEFAULT_TAGS, TAGS_STORAGE_KEY, RECENT_VIEWS_KEY } from './constants';
import { saveNotesToLocalStorage, loadNotesFromLocalStorage, metadataDB, downloadNotesAsMarkdown } from '@/utils/markdownStorage';
import { parseNoteContent, getSuggestedConnections } from './notesUtils';
import { generateDefaultTitle } from './constants';
import { indexedDBService } from '@/services/storage/indexedDB';
import { autoSaveService } from '@/services/storage/autoSave';

export function useNotesState() {
  const [noteState, setNoteState] = useState<NoteState>({
    notes: {},
    activeNoteId: null
  });
  const [tags, setTags] = useState<Tag[]>(DEFAULT_TAGS);
  const [recentViews, setRecentViews] = useState<string[]>([]);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);

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
      
      const initialNoteState: NoteState = {
        notes: {},
        activeNoteId: null
      };
      
      loadedNotes.forEach(note => {
        initialNoteState.notes[note.id] = {
          note,
          dirty: false
        };
      });
      
      setNoteState(initialNoteState);
      
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

  useEffect(() => {
    if (Object.keys(noteState.notes).length > 0) {
      const notes = Object.values(noteState.notes).map(({ note }) => note);
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
  }, [noteState.notes, tags, dbInitialized]);
  
  useEffect(() => {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
  }, [tags]);
  
  useEffect(() => {
    localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(recentViews));
  }, [recentViews]);

  useEffect(() => {
    const initServices = async () => {
      await indexedDBService.init();
      const savedState = await indexedDBService.loadUIState();
      if (savedState?.activeNoteId) {
        const note = Object.values(noteState.notes)
          .map(({ note }) => note)
          .find(n => n.id === savedState.activeNoteId);
        
        if (note) {
          setSelectedNote(note);
        }
      }
    };
    initServices();
  }, [noteState.notes]);

  useEffect(() => {
    const dirtyNotes = Object.values(noteState.notes)
      .filter(({ dirty }) => dirty)
      .map(({ note }) => note);
    
    autoSaveService.setData(dirtyNotes, tags);
  }, [noteState.notes, tags]);

  useEffect(() => {
    const dirtyNotes = Object.values(noteState.notes)
      .filter(({ dirty }) => dirty)
      .map(({ note }) => note);
    
    if (dirtyNotes.length > 0) {
      autoSaveService.triggerSave();
    }
  }, [noteState.notes, tags]);

  useEffect(() => {
    if (selectedNote) {
      indexedDBService.saveUIState({
        activeNoteId: selectedNote.id
      });
    }
  }, [selectedNote]);

  const addNote = useCallback((noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    
    const { mentionedNoteIds } = parseNoteContent(noteData.content, noteState.notes);
    
    const newNote: Note = {
      ...noteData,
      id: uuidv4(),
      title: noteData.title || generateDefaultTitle(now),
      createdAt: now,
      updatedAt: now,
      contentType: 'text',
      tags: [],
      connections: [],
      mentions: mentionedNoteIds,
    };

    setNoteState(prev => ({
      ...prev,
      notes: {
        ...prev.notes,
        [newNote.id]: {
          note: newNote,
          dirty: true
        }
      }
    }));
    indexedDBService.saveNoteMetadata(newNote);

    return newNote.id;
  }, [noteState.notes]);

  const updateNote = useCallback((id: string, noteUpdate: Partial<Note>) => {
    setNoteState(prev => {
      const existingNoteEntry = prev.notes[id];
      if (!existingNoteEntry) return prev;
      
      const existingNote = existingNoteEntry.note;

      let updatedMentions = existingNote.mentions || [];
      if (noteUpdate.content) {
        const { mentionedNoteIds } = parseNoteContent(noteUpdate.content, prev.notes);
        updatedMentions = mentionedNoteIds;
      }
      
      const updatedNote = {
        ...existingNote,
        ...noteUpdate,
        mentions: updatedMentions,
        updatedAt: new Date()
      };

      indexedDBService.saveNoteMetadata(updatedNote);

      return {
        ...prev,
        notes: {
          ...prev.notes,
          [id]: {
            note: updatedNote,
            dirty: true
          }
        }
      };
    });
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNoteState(prev => {
      const { [id]: deleted, ...remainingNotes } = prev.notes;
      return {
        ...prev,
        notes: remainingNotes,
        activeNoteId: prev.activeNoteId === id ? null : prev.activeNoteId
      };
    });
    
    setNoteState((prev) => {
      const updatedNotes = { ...prev.notes };
      Object.keys(updatedNotes).forEach(noteId => {
        const noteEntry = updatedNotes[noteId];
        if (noteEntry) {
          const note = noteEntry.note;
          updatedNotes[noteId] = {
            ...noteEntry,
            note: {
              ...note,
              connections: note.connections?.filter(connId => connId !== id) || [],
              mentions: note.mentions?.filter(mentionId => mentionId !== id) || []
            }
          };
        }
      });
      return { ...prev, notes: updatedNotes };
    });
  }, []);

  const isDirty = useCallback((noteId: string) => {
    return noteState.notes[noteId]?.dirty || false;
  }, [noteState.notes]);

  const markClean = useCallback((noteId: string) => {
    setNoteState(prev => ({
      ...prev,
      notes: {
        ...prev.notes,
        [noteId]: {
          ...prev.notes[noteId],
          dirty: false
        }
      }
    }));
  }, []);

  const getNoteById = useCallback((id: string) => {
    return noteState.notes[id]?.note;
  }, [noteState.notes]);

  const addTag = useCallback((tag: Omit<Tag, 'id'>) => {
    const newTag = { ...tag, id: uuidv4() };
    setTags((prevTags) => [...prevTags, newTag]);
    return newTag.id;
  }, []);

  const deleteTag = useCallback((id: string) => {
    setTags((prevTags) => prevTags.filter((tag) => tag.id !== id));
    
    setNoteState((prev) => {
      const updatedNotes = { ...prev.notes };
      Object.keys(updatedNotes).forEach(noteId => {
        const noteEntry = updatedNotes[noteId];
        if (noteEntry) {
          const note = noteEntry.note;
          updatedNotes[noteId] = {
            ...noteEntry,
            note: {
              ...note,
              tags: note.tags.filter((tag) => tag.id !== id),
              updatedAt: new Date(),
            }
          };
        }
      });
      return { ...prev, notes: updatedNotes };
    });
  }, []);

  const connectNotes = useCallback((sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    setNoteState((prev) => {
      const updatedNotes = { ...prev.notes };
      const sourceNoteEntry = updatedNotes[sourceId];

      if (sourceNoteEntry) {
        const sourceNote = sourceNoteEntry.note;
        const connections = sourceNote.connections || [];
        if (!connections.includes(targetId)) {
          updatedNotes[sourceId] = {
            ...sourceNoteEntry,
            note: {
              ...sourceNote,
              connections: [...connections, targetId],
              updatedAt: new Date(),
            }
          };
        }
      }

      return { ...prev, notes: updatedNotes };
    });
  }, []);

  const disconnectNotes = useCallback((sourceId: string, targetId: string) => {
    setNoteState((prev) => {
      const updatedNotes = { ...prev.notes };
      const sourceNoteEntry = updatedNotes[sourceId];

      if (sourceNoteEntry) {
        const sourceNote = sourceNoteEntry.note;
        updatedNotes[sourceId] = {
          ...sourceNoteEntry,
          note: {
            ...sourceNote,
            connections: (sourceNote.connections || []).filter(id => id !== targetId),
            updatedAt: new Date(),
          }
        };
      }

      return { ...prev, notes: updatedNotes };
    });
  }, []);

  const findBacklinks = useCallback((noteId: string): Note[] => {
    return Object.values(noteState.notes)
      .map(({ note }) => note)
      .filter(note => 
        (note.connections && note.connections.includes(noteId)) || 
        (note.mentions && note.mentions.includes(noteId))
      );
  }, [noteState.notes]);

  const suggestConnections = useCallback((noteId: string): Note[] => {
    return getSuggestedConnections(noteId, noteState.notes);
  }, [noteState.notes]);

  const parseContent = useCallback((content: string) => {
    return parseNoteContent(content, noteState.notes);
  }, [noteState.notes]);

  const addToRecentViews = useCallback((noteId: string) => {
    setRecentViews(prevViews => {
      const filteredViews = prevViews.filter(id => id !== noteId);
      return [noteId, ...filteredViews].slice(0, 10);
    });
  }, []);

  const getRecentlyViewedNotes = useCallback((): Note[] => {
    return recentViews
      .map(id => getNoteById(id))
      .filter((note): note is Note => note !== undefined);
  }, [recentViews, getNoteById]);

  const exportNotes = useCallback(() => {
    const notes = Object.values(noteState.notes).map(({ note }) => note);
    downloadNotesAsMarkdown(notes, tags);
  }, [noteState.notes, tags]);

  const importNotes = useCallback(async (files: FileList): Promise<void> => {
    if (files.length === 0) return;
    
    console.log(`Would import ${files.length} files`);
    
    Array.from(files).forEach(file => {
      console.log(`Would import: ${file.name}`);
    });
  }, []);

  const setNotes = useCallback((newNotes: Note[]) => {
    const noteState: { [id: string]: { note: Note, dirty: boolean } } = {};
    newNotes.forEach(note => {
      noteState[note.id] = {
        note,
        dirty: false
      };
    });

    setNoteState(prev => ({
      ...prev,
      notes: noteState
    }));
  }, []);

  const setActiveNoteId = useCallback((id: string | null) => {
    setNoteState(prev => ({ ...prev, activeNoteId: id }));
  }, []);

  return {
    notes: Object.values(noteState.notes).map(({ note }) => note),
    addNote,
    createNote: addNote,
    updateNote,
    deleteNote,
    getNoteById,
    tags,
    addTag,
    deleteTag,
    connectNotes,
    disconnectNotes,
    findBacklinks,
    getSuggestedConnections: suggestConnections,
    parseNoteContent: parseContent,
    getRecentlyViewedNotes,
    addToRecentViews,
    exportNotes,
    importNotes,
    isDirty,
    markClean,
    activeNoteId: noteState.activeNoteId,
    setActiveNoteId,
    setNotes
  };
}
