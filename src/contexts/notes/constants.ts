
import { v4 as uuidv4 } from 'uuid';
import { Tag } from '@/types/note';

export const STORAGE_KEY = 'second-brain-notes';
export const TAGS_STORAGE_KEY = 'second-brain-tags';
export const RECENT_VIEWS_KEY = 'second-brain-recent-views';

export const DEFAULT_TAGS: Tag[] = [
  { id: uuidv4(), name: 'Important', color: '#EF4444' },
  { id: uuidv4(), name: 'Work', color: '#3B82F6' },
  { id: uuidv4(), name: 'Personal', color: '#10B981' },
  { id: uuidv4(), name: 'Idea', color: '#8B5CF6' },
];

export const generateDefaultTitle = (date: Date = new Date()): string => {
  return `Note ${format(date, "MMM d, yyyy 'at' h:mm a")}`;
};

// Import the format function
import { format } from 'date-fns';
