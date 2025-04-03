
import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useReactFlow } from '@xyflow/react';
import { indexedDBService } from '@/services/storage/indexedDB';
import { useNotes } from '@/contexts/NotesContext';
import { useTheme } from '@/components/ThemeProvider';

export const useStatePersistence = () => {
  const location = useLocation();
  const { getViewport, setViewport } = useReactFlow();
  const { notes, getNoteById, activeNoteId, setActiveNoteId } = useNotes();
  const { theme } = useTheme();

  // Save state to IndexedDB
  const saveState = useCallback(async () => {
    try {
      console.log('Saving state to IndexedDB:', {
        notesCount: notes.length,
        activeNoteId,
        location: location.pathname,
        theme,
      });

      const viewport = getViewport();
      await indexedDBService.saveState({
        notes,
        activeNoteId: notes.length > 0 ? notes[0].id : null,
        graphPosition: {
          x: viewport.x,
          y: viewport.y,
          zoom: viewport.zoom,
        },
        currentRoute: location.pathname,
        uiState: {
          sidebarOpen: true,
          theme,
        },
      });
      console.log('State saved successfully');
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }, [notes, getViewport, location.pathname, theme, activeNoteId]);

  // Load state from IndexedDB
  const loadState = useCallback(async () => {
    try {
      console.log('Loading state from IndexedDB...');
      const state = await indexedDBService.loadState();
      if (state) {
        console.log('Loaded state:', {
          notesCount: state.notes.length,
          activeNoteId: state.activeNoteId,
          location: state.currentRoute,
          graphPosition: state.graphPosition,
        });

        // Restore graph position
        setViewport({
          x: state.graphPosition.x,
          y: state.graphPosition.y,
          zoom: state.graphPosition.zoom,
        });

        // Restore active note
        if (state.activeNoteId) {
          const note = getNoteById(state.activeNoteId);
          if (note) {
            setActiveNoteId(note.id);
            console.log('Restored active note:', note.id);
          }
        }

        // Restore route if different from current
        if (state.currentRoute !== location.pathname) {
          console.log('Restoring route:', state.currentRoute);
          window.history.replaceState(null, '', state.currentRoute);
        }

        // Restore UI state
        // Add your UI state restoration logic here
      } else {
        console.log('No state found in IndexedDB');
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }
  }, [setViewport, setActiveNoteId, getNoteById, location.pathname]);

  // Save state on changes
  useEffect(() => {
    saveState();
  }, [saveState]);

  // Load state on mount
  useEffect(() => {
    loadState();
  }, [loadState]);

  return {
    saveState,
    loadState,
  };
};
