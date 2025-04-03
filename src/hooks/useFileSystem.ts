
import { useCallback } from 'react';
import { Note } from '@/types/note';

export const useFileSystem = () => {
  const loadFiles = useCallback(async (): Promise<Note[]> => {
    try {
      console.log('Loading files from file system...');
      // Request permission to access the file system
      const dirHandle = await window.showDirectoryPicker();
      
      // Store the directory handle for future use
      localStorage.setItem('lastDirectoryHandle', JSON.stringify(dirHandle));
      console.log('Directory handle stored');
      
      // Read all markdown files in the directory
      const notes: Note[] = [];
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.md')) {
          console.log('Reading file:', entry.name);
          const fileHandle = entry as FileSystemFileHandle;
          const file = await fileHandle.getFile();
          const content = await file.text();
          
          // Parse frontmatter if present
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
          let metadata: any = {};
          let noteContent = content;
          
          if (frontmatterMatch) {
            try {
              metadata = JSON.parse(frontmatterMatch[1]);
              noteContent = frontmatterMatch[2];
              console.log('Parsed frontmatter for:', entry.name);
            } catch (error) {
              console.error('Failed to parse frontmatter:', error);
            }
          }
          
          notes.push({
            id: entry.name.replace('.md', ''),
            title: metadata.title || entry.name.replace('.md', ''),
            content: noteContent,
            tags: metadata.tags || [],
            connections: metadata.connections || [],
            mentions: metadata.mentions || [],
            createdAt: new Date(metadata.createdAt || file.lastModified),
            updatedAt: new Date(metadata.updatedAt || file.lastModified),
            contentType: 'text',
          });
        }
      }
      
      console.log(`Loaded ${notes.length} notes from file system`);
      return notes;
    } catch (error) {
      console.error('Failed to load files:', error);
      return [];
    }
  }, []);

  const saveFile = useCallback(async (note: Note): Promise<void> => {
    try {
      console.log('Saving file:', note.id);
      // Get the last used directory handle
      const lastHandle = localStorage.getItem('lastDirectoryHandle');
      if (!lastHandle) {
        throw new Error('No directory handle found');
      }
      
      const dirHandle = await window.showDirectoryPicker();
      
      // Create or get the file handle
      const fileHandle = await dirHandle.getFileHandle(`${note.id}.md`, { create: true });
      
      // Create backup before saving
      try {
        const backupFileHandle = await dirHandle.getFileHandle(`${note.id}.md.backup`, { create: true });
        const originalFile = await fileHandle.getFile();
        const originalContent = await originalFile.text();
        
        const backupWritable = await backupFileHandle.createWritable();
        await backupWritable.write(originalContent);
        await backupWritable.close();
        console.log('Backup created successfully');
      } catch (error) {
        console.warn('Failed to create backup:', error);
      }
      
      // Prepare the content with frontmatter
      const frontmatter = {
        title: note.title,
        tags: note.tags,
        connections: note.connections,
        mentions: note.mentions,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      };
      
      const content = `---\n${JSON.stringify(frontmatter, null, 2)}\n---\n${note.content}`;
      
      // Create a File object and write it
      const file = new File([content], `${note.id}.md`, { type: 'text/markdown' });
      const writable = await fileHandle.createWritable();
      await writable.write(file);
      await writable.close();
      
      // Update the last modified time
      await fileHandle.getFile();
      console.log('File saved successfully:', note.id);
    } catch (error) {
      console.error('Failed to save file:', error);
      throw error;
    }
  }, []);

  return {
    loadFiles,
    saveFile,
  };
};
