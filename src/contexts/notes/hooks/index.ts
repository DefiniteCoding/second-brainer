
import { useState } from 'react';
import { NotesContextType } from '../types';
import { useNotesCore } from './useNotesCore';
import { useNoteOperations } from './useNoteOperations';
import { useTagOperations } from './useTagOperations';
import { useNoteConnections } from './useNoteConnections';
import { useRecentViews } from './useRecentViews';
import { useNoteContent } from './useNoteContent';
import { useNoteExportImport } from './useNoteExportImport';
import { indexedDBService } from '@/services/storage/indexedDB';

export function useNotesState(): NotesContextType {
  const {
    noteState,
    setNoteState,
    tags,
    setTags,
    recentViews,
    setRecentViews,
    dbInitialized,
    selectedNote,
    setSelectedNote
  } = useNotesCore();

  const {
    addNote,
    updateNote,
    deleteNote,
    isDirty,
    markClean,
    getNoteById,
    setNotes,
    setActiveNoteId
  } = useNoteOperations(noteState, setNoteState);

  const {
    addTag,
    deleteTag
  } = useTagOperations(tags, setTags, setNoteState);

  const {
    connectNotes,
    disconnectNotes,
    findBacklinks,
    suggestConnections
  } = useNoteConnections(noteState, setNoteState);

  const {
    addToRecentViews,
    getRecentlyViewedNotes
  } = useRecentViews(recentViews, setRecentViews, getNoteById);

  const {
    parseNoteContent
  } = useNoteContent(noteState);

  const getNotes = () => Object.values(noteState.notes).map(({ note }) => note);

  const {
    exportNotes,
    importNotes
  } = useNoteExportImport(getNotes, tags);

  // Initialize UI state
  useState(() => {
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
  });

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
    parseNoteContent,
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
