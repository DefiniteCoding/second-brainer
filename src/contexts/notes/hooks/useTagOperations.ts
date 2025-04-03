
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Note, Tag } from '@/types/note';
import { NoteState } from '../types';

export function useTagOperations(
  tags: Tag[],
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>,
  setNoteState: React.Dispatch<React.SetStateAction<NoteState>>
) {
  const addTag = useCallback((tag: Omit<Tag, 'id'>) => {
    const newTag = { ...tag, id: uuidv4() };
    setTags((prevTags) => [...prevTags, newTag]);
    return newTag.id;
  }, [setTags]);

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
  }, [setTags, setNoteState]);

  return {
    addTag,
    deleteTag
  };
}
