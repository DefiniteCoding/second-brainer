
import { debounce } from 'lodash';
import { Note } from '@/contexts/NotesContext';
import { saveNotesToLocalStorage } from '@/utils/markdownStorage';

class AutoSaveService {
  private saveTimeout: NodeJS.Timeout | null = null;
  private notes: Note[] = [];
  private tags: any[] = [];
  private debouncedSave: (() => void);

  constructor() {
    this.debouncedSave = debounce(this.performSave, 2000);
  }

  setData(notes: Note[], tags: any[]) {
    this.notes = notes;
    this.tags = tags;
  }

  triggerSave = () => {
    this.debouncedSave();
  };

  private createBackup = async (notes: Note[]) => {
    try {
      const backupData = JSON.stringify(notes);
      localStorage.setItem('second-brain-notes-backup', backupData);
      console.log('Created backup of notes');
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  };

  private performSave = async () => {
    try {
      // Create backup before saving
      await this.createBackup(this.notes);
      
      // Perform actual save
      await saveNotesToLocalStorage(this.notes, this.tags);
      console.log('Auto-saved notes to storage');
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Try to restore from backup if save fails
      const backup = localStorage.getItem('second-brain-notes-backup');
      if (backup) {
        try {
          const restoredNotes = JSON.parse(backup);
          await saveNotesToLocalStorage(restoredNotes, this.tags);
          console.log('Restored from backup after save failure');
        } catch (backupError) {
          console.error('Failed to restore from backup:', backupError);
        }
      }
    }
  };

  stop() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
  }
}

export const autoSaveService = new AutoSaveService();
