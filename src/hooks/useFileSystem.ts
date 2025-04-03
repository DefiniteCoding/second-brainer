import { useState, useCallback, useEffect } from 'react';
import { Note } from '@/types/note';

/**
 * Hook for interacting with the file system.
 * Note: This functionality is limited in certain environments like iframes.
 */
export const useFileSystem = () => {
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [isInIframe, setIsInIframe] = useState(false);

  // Check if running in an iframe on mount
  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      // If accessing window.top throws an error, we're definitely in an iframe
      setIsInIframe(true);
    }
  }, []);

  /**
   * Loads files from the selected directory.
   */
  const loadFiles = useCallback(async (): Promise<Note[]> => {
    console.info('Loading files from file system...');
    
    if (isInIframe) {
      console.info('Running in iframe environment, file system access is restricted');
      return [];
    }
    
    try {
      // Try to get an existing directory handle or request a new one
      let dirHandle = directoryHandle;
      
      if (!dirHandle) {
        // This line will throw a SecurityError in iframes
        dirHandle = await window.showDirectoryPicker();
        setDirectoryHandle(dirHandle);
      }
      
      const files: Note[] = [];
      // Process files if we have a valid directory handle
      if (dirHandle) {
        // Implementation to read files would go here
        // For now, just return an empty array
      }
      
      return files;
    } catch (error) {
      // Check specifically for SecurityError (iframe restriction)
      if (error instanceof DOMException && error.name === 'SecurityError') {
        console.info('File system access is not available in this environment');
        return [];
      }
      
      console.error('Failed to load files:', error);
      throw error;
    }
  }, [directoryHandle, isInIframe]);

  // Save files to the selected directory
  const saveFiles = useCallback(async (notes: Note[]): Promise<void> => {
    if (isInIframe || !directoryHandle) {
      return;
    }
    
    try {
      // Implementation to save files would go here
    } catch (error) {
      console.error('Failed to save files:', error);
      throw error;
    }
  }, [directoryHandle, isInIframe]);

  return {
    loadFiles,
    saveFiles,
    hasDirectoryAccess: !!directoryHandle && !isInIframe
  };
};
