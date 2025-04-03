
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Note } from '@/types/note';
import { NoteState } from '../types';
import { loadNotesFromLocalStorage, saveNotesToLocalStorage, metadataDB } from '@/utils/markdownStorage';
import { parseNoteContent } from '../notesUtils';
import { DEFAULT_TAGS, TAGS_STORAGE_KEY, RECENT_VIEWS_KEY } from '../constants';
import { autoSaveService } from '@/services/storage/autoSave';

export function useNotesCore() {
  const [noteState, setNoteState] = useState<NoteState>({
    notes: {},
    activeNoteId: null
  });
  const [tags, setTags] = useState<Note['tags']>(DEFAULT_TAGS);
  const [recentViews, setRecentViews] = useState<string[]>([]);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);

  // Initialize database
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

  // Load initial data
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

  // Save notes to localStorage
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
  
  // Update tags in localStorage
  useEffect(() => {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
  }, [tags]);
  
  // Update recent views in localStorage
  useEffect(() => {
    localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(recentViews));
  }, [recentViews]);

  // Setup autosave for dirty notes
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

  // Update UI state with selected note
  useEffect(() => {
    if (selectedNote) {
      // We depend on indexedDBService implementation elsewhere
    }
  }, [selectedNote]);

  return {
    noteState,
    setNoteState,
    tags,
    setTags,
    recentViews,
    setRecentViews,
    dbInitialized,
    selectedNote,
    setSelectedNote
  };
}
