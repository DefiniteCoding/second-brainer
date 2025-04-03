
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Note } from '@/types/note';
import { NoteState } from '../types';
import { parseNoteContent } from '../notesUtils';
import { generateDefaultTitle } from '../constants';
import { indexedDBService } from '@/services/storage/indexedDB';

export function useNoteOperations(
  noteState: NoteState,
  setNoteState: React.Dispatch<React.SetStateAction<NoteState>>
) {
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
  }, [noteState.notes, setNoteState]);

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
  }, [setNoteState]);

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
  }, [setNoteState]);

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
  }, [setNoteState]);

  const getNoteById = useCallback((id: string) => {
    return noteState.notes[id]?.note;
  }, [noteState.notes]);

  const setNotes = useCallback((newNotes: Note[]) => {
    const noteEntries: { [id: string]: { note: Note, dirty: boolean } } = {};
    newNotes.forEach(note => {
      noteEntries[note.id] = {
        note,
        dirty: false
      };
    });

    setNoteState(prev => ({
      ...prev,
      notes: noteEntries
    }));
  }, [setNoteState]);

  const setActiveNoteId = useCallback((id: string | null) => {
    setNoteState(prev => ({ ...prev, activeNoteId: id }));
  }, [setNoteState]);

  return {
    addNote,
    updateNote,
    deleteNote,
    isDirty,
    markClean,
    getNoteById,
    setNotes,
    setActiveNoteId
  };
}
