
import { useCallback } from 'react';
import { Note } from '@/types/note';
import { NoteState } from '../types';
import { getSuggestedConnections } from '../notesUtils';

export function useNoteConnections(
  noteState: NoteState,
  setNoteState: React.Dispatch<React.SetStateAction<NoteState>>
) {
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
  }, [setNoteState]);

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
  }, [setNoteState]);

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

  return {
    connectNotes,
    disconnectNotes,
    findBacklinks,
    suggestConnections
  };
}
