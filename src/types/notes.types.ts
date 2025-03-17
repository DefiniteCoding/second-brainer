
export interface Tag {
  id: string;
  name: string;
  color: string;
}

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
