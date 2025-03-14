import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  title: string;
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
}

export type SearchFilter = {
  tagIds?: string[];
  startDate?: Date;
  endDate?: Date;
  contentTypes?: ('text' | 'image' | 'link' | 'audio' | 'video')[];
  query?: string;
}

interface NotesContextType {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getNoteById: (id: string) => Note | undefined;
  tags: Tag[];
  addTag: (tag: Omit<Tag, 'id'>) => string;
  deleteTag: (id: string) => void;
  connectNotes: (sourceId: string, targetId: string) => void;
  disconnectNotes: (sourceId: string, targetId: string) => void;
  findBacklinks: (noteId: string) => Note[];
  getSuggestedConnections: (noteId: string) => Note[];
  parseNoteContent: (content: string) => { parsedContent: React.ReactNode, mentionedNoteIds: string[] };
  searchNotes: (filters: SearchFilter) => Note[];
  parseNaturalLanguageQuery: (query: string) => SearchFilter;
  getRecentlyViewedNotes: () => Note[];
  addToRecentViews: (noteId: string) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

const STORAGE_KEY = 'second-brain-notes';
const TAGS_STORAGE_KEY = 'second-brain-tags';
const RECENT_VIEWS_KEY = 'second-brain-recent-views';

const DEFAULT_TAGS: Tag[] = [
  { id: uuidv4(), name: 'Important', color: '#EF4444' },
  { id: uuidv4(), name: 'Work', color: '#3B82F6' },
  { id: uuidv4(), name: 'Personal', color: '#10B981' },
  { id: uuidv4(), name: 'Idea', color: '#8B5CF6' },
];

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>(DEFAULT_TAGS);
  const [recentViews, setRecentViews] = useState<string[]>([]);

  useEffect(() => {
    const savedNotes = localStorage.getItem(STORAGE_KEY);
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        // Convert string dates back to Date objects
        const notesWithDateObjects = parsedNotes.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));
        setNotes(notesWithDateObjects);
      } catch (error) {
        console.error('Failed to parse notes from localStorage:', error);
      }
    }

    const savedTags = localStorage.getItem(TAGS_STORAGE_KEY);
    if (savedTags) {
      try {
        setTags(JSON.parse(savedTags));
      } catch (error) {
        console.error('Failed to parse tags from localStorage:', error);
        setTags(DEFAULT_TAGS);
      }
    } else {
      setTags(DEFAULT_TAGS);
    }
    
    const savedRecentViews = localStorage.getItem(RECENT_VIEWS_KEY);
    if (savedRecentViews) {
      try {
        setRecentViews(JSON.parse(savedRecentViews));
      } catch (error) {
        console.error('Failed to parse recent views from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
  }, [tags]);
  
  useEffect(() => {
    localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(recentViews));
  }, [recentViews]);

  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    
    // Parse content for mentions
    const { mentionedNoteIds } = parseNoteContent(note.content);
    
    const newNote: Note = {
      ...note,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      connections: [],
      mentions: mentionedNoteIds,
    };
    setNotes((prevNotes) => [newNote, ...prevNotes]);
    return newNote.id;
  };

  const updateNote = (id: string, noteUpdate: Partial<Note>) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => {
        if (note.id === id) {
          // If content is being updated, re-parse for mentions
          let updatedMentions = note.mentions || [];
          if (noteUpdate.content) {
            const { mentionedNoteIds } = parseNoteContent(noteUpdate.content);
            updatedMentions = mentionedNoteIds;
          }
          
          return { 
            ...note, 
            ...noteUpdate, 
            mentions: updatedMentions,
            updatedAt: new Date() 
          };
        }
        return note;
      })
    );
  };

  const deleteNote = (id: string) => {
    // Remove the note
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    
    // Remove any connections to this note
    setNotes((prevNotes) => 
      prevNotes.map((note) => ({
        ...note,
        connections: note.connections?.filter(connId => connId !== id) || [],
        mentions: note.mentions?.filter(mentionId => mentionId !== id) || []
      }))
    );
  };

  const getNoteById = (id: string) => {
    return notes.find((note) => note.id === id);
  };

  const addTag = (tag: Omit<Tag, 'id'>) => {
    const newTag = { ...tag, id: uuidv4() };
    setTags((prevTags) => [...prevTags, newTag]);
    return newTag.id;
  };

  const deleteTag = (id: string) => {
    setTags((prevTags) => prevTags.filter((tag) => tag.id !== id));
    
    // Also remove the tag from any notes that have it
    setNotes((prevNotes) =>
      prevNotes.map((note) => ({
        ...note,
        tags: note.tags.filter((tag) => tag.id !== id),
        updatedAt: new Date(),
      }))
    );
  };

  const connectNotes = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return; // Can't connect a note to itself

    setNotes((prevNotes) =>
      prevNotes.map((note) => {
        if (note.id === sourceId) {
          const connections = note.connections || [];
          if (!connections.includes(targetId)) {
            return {
              ...note,
              connections: [...connections, targetId],
              updatedAt: new Date(),
            };
          }
        }
        return note;
      })
    );
  };

  const disconnectNotes = (sourceId: string, targetId: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => {
        if (note.id === sourceId) {
          return {
            ...note,
            connections: (note.connections || []).filter(id => id !== targetId),
            updatedAt: new Date(),
          };
        }
        return note;
      })
    );
  };

  const findBacklinks = (noteId: string): Note[] => {
    return notes.filter(note => 
      (note.connections && note.connections.includes(noteId)) || 
      (note.mentions && note.mentions.includes(noteId))
    );
  };

  const getSuggestedConnections = (noteId: string): Note[] => {
    const currentNote = getNoteById(noteId);
    if (!currentNote) return [];

    // Simple content-based similarity
    const noteWords = currentNote.content.toLowerCase().split(/\s+/);
    const titleWords = currentNote.title.toLowerCase().split(/\s+/);
    const allWords = [...noteWords, ...titleWords];
    
    // Skip very common words
    const commonWords = new Set(['the', 'and', 'of', 'to', 'a', 'in', 'that', 'is', 'was', 'for', 'on', 'with', 'as']);
    const significantWords = allWords.filter(word => word.length > 2 && !commonWords.has(word));
    
    // Find other notes with similar content
    return notes
      .filter(note => note.id !== noteId) // Don't suggest the current note
      .map(note => {
        // Calculate a simple similarity score
        const noteText = (note.title + ' ' + note.content).toLowerCase();
        const matchScore = significantWords.reduce((score, word) => {
          return score + (noteText.includes(word) ? 1 : 0);
        }, 0) / significantWords.length;
        
        return { note, score: matchScore };
      })
      .filter(item => item.score > 0.2) // Only keep notes with some similarity
      .sort((a, b) => b.score - a.score) // Sort by similarity (highest first)
      .slice(0, 5) // Take top 5 suggestions
      .map(item => item.note);
  };

  const parseNoteContent = (content: string): { parsedContent: React.ReactNode, mentionedNoteIds: string[] } => {
    if (!content) return { parsedContent: '', mentionedNoteIds: [] };
    
    const mentionedNoteIds: string[] = [];
    const segments: React.ReactNode[] = [];
    
    // Look for [[Note Title]] patterns
    const regex = /\[\[(.*?)\]\]/g;
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const mentionTitle = match[1].trim();
      const matchStart = match.index;
      const matchEnd = regex.lastIndex;
      
      // Add text before the match
      if (matchStart > lastIndex) {
        segments.push(content.substring(lastIndex, matchStart));
      }
      
      // Find the mentioned note
      const mentionedNote = notes.find(n => n.title.toLowerCase() === mentionTitle.toLowerCase());
      
      if (mentionedNote) {
        // Add the linked note
        mentionedNoteIds.push(mentionedNote.id);
        segments.push(
          <span key={`mention-${segments.length}`} className="text-primary font-medium cursor-pointer hover:underline">
            {mentionTitle}
          </span>
        );
      } else {
        // If no matching note found, just show as regular text
        segments.push(`[[${mentionTitle}]]`);
      }
      
      lastIndex = matchEnd;
    }
    
    // Add the remaining text
    if (lastIndex < content.length) {
      segments.push(content.substring(lastIndex));
    }
    
    return {
      parsedContent: segments.length > 0 ? segments : content,
      mentionedNoteIds
    };
  };

  const searchNotes = (filters: SearchFilter): Note[] => {
    return notes.filter(note => {
      // Filter by tags if specified
      if (filters.tagIds && filters.tagIds.length > 0) {
        if (!note.tags.some(tag => filters.tagIds?.includes(tag.id))) {
          return false;
        }
      }
      
      // Filter by date range if specified
      if (filters.startDate && note.createdAt < filters.startDate) {
        return false;
      }
      if (filters.endDate) {
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (note.createdAt > endOfDay) {
          return false;
        }
      }
      
      // Filter by content type if specified
      if (filters.contentTypes && filters.contentTypes.length > 0) {
        if (!filters.contentTypes.includes(note.contentType)) {
          return false;
        }
      }
      
      // Filter by search query if specified
      if (filters.query && filters.query.trim() !== '') {
        const query = filters.query.toLowerCase();
        return (
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.tags.some(tag => tag.name.toLowerCase().includes(query))
        );
      }
      
      return true;
    });
  };

  const parseNaturalLanguageQuery = (query: string): SearchFilter => {
    const filters: SearchFilter = {};
    const lowerQuery = query.toLowerCase();
    
    // Extract time-related filters
    if (lowerQuery.includes('today')) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filters.startDate = today;
      filters.endDate = new Date();
    } else if (lowerQuery.includes('yesterday')) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      filters.startDate = yesterday;
      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      filters.endDate = endOfYesterday;
    } else if (lowerQuery.includes('last week')) {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      filters.startDate = lastWeek;
    } else if (lowerQuery.includes('last month')) {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      filters.startDate = lastMonth;
    }
    
    // Extract content type filters
    const contentTypes: ('text' | 'image' | 'link' | 'audio' | 'video')[] = [];
    if (lowerQuery.includes('image') || lowerQuery.includes('photo') || lowerQuery.includes('picture')) {
      contentTypes.push('image');
    }
    if (lowerQuery.includes('link') || lowerQuery.includes('url') || lowerQuery.includes('website')) {
      contentTypes.push('link');
    }
    if (lowerQuery.includes('audio') || lowerQuery.includes('sound') || lowerQuery.includes('recording')) {
      contentTypes.push('audio');
    }
    if (lowerQuery.includes('video')) {
      contentTypes.push('video');
    }
    if (lowerQuery.includes('text') || lowerQuery.includes('note')) {
      contentTypes.push('text');
    }
    
    if (contentTypes.length > 0) {
      filters.contentTypes = contentTypes;
    }
    
    // Extract tag filters
    const tagFilters: string[] = [];
    tags.forEach(tag => {
      if (lowerQuery.includes(tag.name.toLowerCase())) {
        tagFilters.push(tag.id);
      }
    });
    
    if (tagFilters.length > 0) {
      filters.tagIds = tagFilters;
    }
    
    // Use the remaining query as a general search term
    // Remove filter keywords to get cleaner search term
    let cleanQuery = lowerQuery
      .replace(/(today|yesterday|last week|last month)/g, '')
      .replace(/(image|photo|picture|link|url|website|audio|sound|recording|video|text|note)/g, '');
    
    // Remove tag names
    tags.forEach(tag => {
      cleanQuery = cleanQuery.replace(tag.name.toLowerCase(), '');
    });
    
    // Trim and remove extra spaces
    cleanQuery = cleanQuery.trim().replace(/\s+/g, ' ');
    
    if (cleanQuery) {
      filters.query = cleanQuery;
    }
    
    return filters;
  };

  const addToRecentViews = (noteId: string) => {
    setRecentViews(prevViews => {
      // Remove the note if it's already in the list
      const filteredViews = prevViews.filter(id => id !== noteId);
      // Add the note to the beginning of the list
      return [noteId, ...filteredViews].slice(0, 10); // Keep only the 10 most recent
    });
  };

  const getRecentlyViewedNotes = (): Note[] => {
    return recentViews
      .map(id => getNoteById(id))
      .filter((note): note is Note => note !== undefined);
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        addNote,
        updateNote,
        deleteNote,
        getNoteById,
        tags,
        addTag,
        deleteTag,
        connectNotes,
        disconnectNotes,
        findBacklinks,
        getSuggestedConnections,
        parseNoteContent,
        searchNotes,
        parseNaturalLanguageQuery,
        getRecentlyViewedNotes,
        addToRecentViews
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
