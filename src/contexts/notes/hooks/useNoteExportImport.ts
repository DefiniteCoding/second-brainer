
import { useCallback } from 'react';
import { Note, Tag } from '@/types/note';
import { downloadNotesAsMarkdown } from '@/utils/markdownStorage';

export function useNoteExportImport(
  getNotes: () => Note[], 
  tags: Tag[]
) {
  const exportNotes = useCallback(() => {
    const notes = getNotes();
    downloadNotesAsMarkdown(notes, tags);
  }, [getNotes, tags]);

  const importNotes = useCallback(async (files: FileList): Promise<void> => {
    if (files.length === 0) return;
    
    console.log(`Would import ${files.length} files`);
    
    Array.from(files).forEach(file => {
      console.log(`Would import: ${file.name}`);
    });
  }, []);

  return {
    exportNotes,
    importNotes
  };
}
