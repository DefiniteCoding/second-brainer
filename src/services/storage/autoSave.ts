
import { debounce } from 'lodash';
import { Note } from '@/contexts/NotesContext';
import { saveNotesToLocalStorage } from '@/utils/markdownStorage';

class AutoSaveService {
  private saveTimeout: NodeJS.Timeout | null = null;
  private notes: Note[] = [];
  private tags: any[] = [];
  private debouncedSave: () => void;

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

  private performSave = async () => {
    try {
      await saveNotesToLocalStorage(this.notes, this.tags);
      console.log('Auto-saved notes to storage');
    } catch (error) {
      console.error('Auto-save failed:', error);
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

