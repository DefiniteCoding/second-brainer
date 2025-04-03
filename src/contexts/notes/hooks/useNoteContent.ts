
import { useCallback } from 'react';
import { NoteState } from '../types';
import { parseNoteContent } from '../notesUtils';

export function useNoteContent(noteState: NoteState) {
  const parseContent = useCallback((content: string) => {
    return parseNoteContent(content, noteState.notes);
  }, [noteState.notes]);

  return {
    parseNoteContent: parseContent
  };
}
