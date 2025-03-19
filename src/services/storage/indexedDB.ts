import { openDB, IDBPDatabase } from 'idb';
import { Note } from '@/contexts/NotesContext';

interface AppState {
  notes: Note[];
  activeNoteId: string | null;
  graphPosition: {
    x: number;
    y: number;
    zoom: number;
  };
  currentRoute: string;
  uiState: {
    sidebarOpen: boolean;
    theme: 'light' | 'dark' | 'system';
    // Add other UI state properties as needed
  };
}

const DB_NAME = 'SecondBrainerDB';
const DB_VERSION = 1;

class IndexedDBService {
  private db: IDBPDatabase | null = null;
  private storeName = 'app-state';

  async init() {
    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Store for UI state
          if (!db.objectStoreNames.contains('uiState')) {
            db.createObjectStore('uiState');
          }
          // Store for note metadata
          if (!db.objectStoreNames.contains('noteMetadata')) {
            db.createObjectStore('noteMetadata', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName, { keyPath: 'id' });
          }
        },
      });
      console.log('IndexedDB initialized');
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
    }
  }

  async saveUIState(state: Partial<AppState>) {
    if (!this.db) return;
    try {
      const tx = this.db.transaction('uiState', 'readwrite');
      const store = tx.objectStore('uiState');
      await store.put(state, 'currentState');
      await tx.done;
    } catch (error) {
      console.error('Failed to save UI state:', error);
    }
  }

  async loadUIState(): Promise<AppState | null> {
    if (!this.db) return null;
    try {
      const state = await this.db.get('uiState', 'currentState');
      return state || null;
    } catch (error) {
      console.error('Failed to load UI state:', error);
      return null;
    }
  }

  async saveNoteMetadata(note: Note) {
    if (!this.db) return;
    try {
      const tx = this.db.transaction('noteMetadata', 'readwrite');
      const store = tx.objectStore('noteMetadata');
      await store.put({
        id: note.id,
        title: note.title,
        updatedAt: note.updatedAt,
        tags: note.tags,
        connections: note.connections,
      });
      await tx.done;
    } catch (error) {
      console.error('Failed to save note metadata:', error);
    }
  }

  async saveState(state: AppState): Promise<void> {
    if (!this.db) return;
    try {
      const tx = this.db.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);
      await store.put({ id: 'app-state', ...state });
      await tx.done;
    } catch (error) {
      console.error('Failed to save app state:', error);
    }
  }

  async loadState(): Promise<AppState | null> {
    if (!this.db) return null;
    try {
      const state = await this.db.get(this.storeName, 'app-state');
      return state || null;
    } catch (error) {
      console.error('Failed to load app state:', error);
      return null;
    }
  }

  async clearState(): Promise<void> {
    if (!this.db) return;
    try {
      const tx = this.db.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);
      await store.delete('app-state');
      await tx.done;
    } catch (error) {
      console.error('Failed to clear app state:', error);
    }
  }
}

export const indexedDBService = new IndexedDBService();
