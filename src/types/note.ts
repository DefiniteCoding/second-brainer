
export interface Note {
  id: string;
  title?: string;
  content: string;
  contentType: 'text' | 'image' | 'link' | 'audio' | 'video';
  createdAt: Date;
  updatedAt: Date;
  tags: Tag[];
  source?: string;
  location?: { latitude: number; longitude: number };
  mediaUrl?: string;
  connections?: string[]; // IDs of explicitly connected notes
  mentions?: string[]; // IDs of mentioned notes
  concepts?: string[]; // AI-generated concepts for the note
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

// File System Access API types
declare global {
  interface Window {
    showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
  }
}

export interface FileSystemDirectoryHandle {
  kind: 'directory';
  name: string;
  getFileHandle: (name: string, options?: { create?: boolean }) => Promise<FileSystemFileHandle>;
  values: () => AsyncIterable<FileSystemHandle>;
}

export interface FileSystemFileHandle {
  kind: 'file';
  name: string;
  getFile: () => Promise<File>;
  createWritable: () => Promise<FileSystemWritableFileStream>;
}

export interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
}

export interface FileSystemWritableFileStream extends WritableStream {
  write: (data: any) => Promise<void>;
  close: () => Promise<void>;
}

export interface AppState {
  notes: Note[];
  activeNoteId: string | null;
  route?: string;
  graphPosition?: {
    x: number;
    y: number;
    zoom: number;
  };
  currentRoute?: string;
  uiState?: {
    sidebarOpen: boolean;
    theme: string;
  };
}
