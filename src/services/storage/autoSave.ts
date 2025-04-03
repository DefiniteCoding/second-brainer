
import { debounce } from 'lodash';
import { Note } from '@/contexts/NotesContext';
import { saveNotesToLocalStorage } from '@/utils/markdownStorage';
import { useToast } from '@/components/ui/use-toast';

class AutoSaveService {
  private saveTimeout: NodeJS.Timeout | null = null;
  private notes: Note[] = [];
  private tags: any[] = [];
  private debouncedSave: (() => void);
  private lastSaveTime: number = 0;
  private saveInProgress: boolean = false;
  private pendingSave: boolean = false;

  constructor() {
    this.debouncedSave = debounce(this.performSave, 2000);
  }

  setData(notes: Note[], tags: any[]) {
    this.notes = notes;
    this.tags = tags;
  }

  triggerSave = () => {
    this.debouncedSave();
    
    // Update save indicator status if needed
    const now = Date.now();
    if (now - this.lastSaveTime > 5000) {
      // Code to update save indicator would go here
      console.log('Autosave triggered');
    }
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
    if (this.saveInProgress) {
      this.pendingSave = true;
      return;
    }
    
    this.saveInProgress = true;
    
    try {
      // Create backup before saving
      await this.createBackup(this.notes);
      
      // Perform actual save
      await saveNotesToLocalStorage(this.notes, this.tags);
      this.lastSaveTime = Date.now();
      console.log('Auto-saved notes to storage at', new Date().toLocaleTimeString());
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
    } finally {
      this.saveInProgress = false;
      
      // If a save was requested while we were saving, trigger another save
      if (this.pendingSave) {
        this.pendingSave = false;
        setTimeout(this.debouncedSave, 500);
      }
    }
  };

  stop() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
  }
  
  // Get save status info
  getSaveStatus() {
    return {
      lastSaveTime: this.lastSaveTime,
      saveInProgress: this.saveInProgress
    };
  }
}

export const autoSaveService = new AutoSaveService();
