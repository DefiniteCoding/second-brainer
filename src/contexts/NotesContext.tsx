import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveNotesToLocalStorage, loadNotesFromLocalStorage, downloadNotesAsMarkdown, metadataDB } from '@/utils/markdownStorage';
import { format } from 'date-fns';

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

// Helper function to generate default title
const generateDefaultTitle = (date: Date = new Date()): string => {
  return `Note ${format(date, "MMM d, yyyy 'at' h:mm a")}`;
};

interface NotesContextType {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string;
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string;
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
  getRecentlyViewedNotes: () => Note[];
  addToRecentViews: (noteId: string) => void;
  exportNotes: () => void;
  importNotes: (files: FileList) => Promise<void>;
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
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    console.log('Initializing metadataDB...');
    try {
      metadataDB.init();
      setDbInitialized(true);
      console.log('metadataDB initialized successfully');
    } catch (error) {
      console.error('Failed to initialize metadataDB:', error);
    }
  }, []);

  useEffect(() => {
    console.log('Loading initial data...');
    try {
      const savedTags = localStorage.getItem(TAGS_STORAGE_KEY);
      if (savedTags) {
        try {
          const parsedTags = JSON.parse(savedTags);
          console.log('Loaded tags:', parsedTags);
          setTags(parsedTags);
        } catch (error) {
          console.error('Failed to parse tags from localStorage:', error);
          setTags(DEFAULT_TAGS);
        }
      } else {
        console.log('No saved tags found, using default tags');
        setTags(DEFAULT_TAGS);
      }
      
      const loadedNotes = loadNotesFromLocalStorage(tags);
      console.log('Loaded notes:', loadedNotes);
      setNotes(loadedNotes);
      
      const savedRecentViews = localStorage.getItem(RECENT_VIEWS_KEY);
      if (savedRecentViews) {
        try {
          const parsedRecentViews = JSON.parse(savedRecentViews);
          console.log('Loaded recent views:', parsedRecentViews);
          setRecentViews(parsedRecentViews);
        } catch (error) {
          console.error('Failed to parse recent views from localStorage:', error);
        }
      }
    } catch (error) {
      console.error('Error during initial data load:', error);
    }
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      console.log('Saving notes to localStorage...');
      try {
        saveNotesToLocalStorage(notes, tags);
        console.log('Notes saved successfully');
        
        if (dbInitialized) {
          console.log('Storing metadata...');
          metadataDB.storeMetadata(notes);
          console.log('Metadata stored successfully');
        }
      } catch (error) {
        console.error('Error saving notes:', error);
      }
    }
  }, [notes, tags, dbInitialized]);
  
  useEffect(() => {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
  }, [tags]);
  
  useEffect(() => {
    localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(recentViews));
  }, [recentViews]);

  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    
    const { mentionedNoteIds } = parseNoteContent(note.content);
    
    const newNote: Note = {
      ...note,
      id: uuidv4(),
      title: note.title || generateDefaultTitle(now),
      createdAt: now,
      updatedAt: now,
      connections: [],
      mentions: mentionedNoteIds,
    };
    setNotes((prevNotes) => [newNote, ...prevNotes]);
    return newNote.id;
  };

  const createNote = addNote;

  const updateNote = (id: string, noteUpdate: Partial<Note>) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => {
        if (note.id === id) {
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
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    
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
    
    setNotes((prevNotes) =>
      prevNotes.map((note) => ({
        ...note,
        tags: note.tags.filter((tag) => tag.id !== id),
        updatedAt: new Date(),
      }))
    );
  };

  const connectNotes = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

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

    const noteText = (currentNote.title + ' ' + currentNote.content).toLowerCase();
    
    const commonWords = new Set([
      'the', 'and', 'of', 'to', 'a', 'in', 'that', 'is', 'was', 'for', 
      'on', 'with', 'as', 'by', 'at', 'from', 'be', 'have', 'or', 
      'this', 'are', 'it', 'an', 'but', 'not', 'what', 'all', 'were', 
      'when', 'we', 'there', 'can', 'been', 'has', 'more', 'who'
    ]);
    
    const words = noteText.split(/\W+/).filter(word => 
      word.length > 2 && !commonWords.has(word)
    );
    
    const wordFrequency: Record<string, number> = {};
    words.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    
    const keyTerms = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([term]) => term);
    
    const bigramSeparator = ' ';
    const bigrams: Record<string, number> = {};
    
    for (let i = 0; i < words.length - 1; i++) {
      if (!commonWords.has(words[i]) && !commonWords.has(words[i+1])) {
        const bigram = words[i] + bigramSeparator + words[i+1];
        bigrams[bigram] = (bigrams[bigram] || 0) + 1;
      }
    }
    
    const keyPhrases = Object.entries(bigrams)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([phrase]) => phrase);
    
    const significantTerms = [...keyTerms, ...keyPhrases];
    
    return notes
      .filter(note => note.id !== noteId)
      .map(note => {
        const otherNoteText = (note.title + ' ' + note.content).toLowerCase();
        
        const termMatches = significantTerms.filter(term => 
          otherNoteText.includes(term)
        ).length;
        
        const termScore = termMatches / significantTerms.length;
        
        const titleMatches = significantTerms.filter(term => 
          note.title.toLowerCase().includes(term)
        ).length;
        
        const titleBoost = titleMatches > 0 ? 0.2 : 0;
        
        const tagOverlap = currentNote.tags.filter(tag => 
          note.tags.some(otherTag => otherTag.id === tag.id)
        ).length;
        
        const tagScore = tagOverlap > 0 ? 0.1 * tagOverlap : 0;
        
        const daysDifference = Math.abs(
          (note.createdAt.getTime() - currentNote.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        const recencyBoost = daysDifference < 7 ? 0.1 : 0;
        
        const matchScore = termScore * 0.7 + titleBoost + tagScore + recencyBoost;
        
        return { note, score: matchScore };
      })
      .filter(item => item.score > 0.15)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.note);
  };

  const parseNoteContent = (content: string): { parsedContent: React.ReactNode, mentionedNoteIds: string[] } => {
    if (!content) return { parsedContent: '', mentionedNoteIds: [] };
    
    const mentionedNoteIds: string[] = [];
    const segments: React.ReactNode[] = [];
    
    const regex = /\[\[(.*?)\]\]/g;
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const mentionTitle = match[1].trim();
      const matchStart = match.index;
      const matchEnd = regex.lastIndex;
      
      if (matchStart > lastIndex) {
        segments.push(content.substring(lastIndex, matchStart));
      }
      
      const mentionedNote = notes.find(n => n.title.toLowerCase() === mentionTitle.toLowerCase());
      
      if (mentionedNote) {
        mentionedNoteIds.push(mentionedNote.id);
        segments.push(
          <span key={`mention-${segments.length}`} className="text-primary font-medium cursor-pointer hover:underline">
            {mentionTitle}
          </span>
        );
      } else {
        segments.push(`[[${mentionTitle}]]`);
      }
      
      lastIndex = matchEnd;
    }
    
    if (lastIndex < content.length) {
      segments.push(content.substring(lastIndex));
    }
    
    // If there are no mentions, return the raw content for markdown processing
    if (segments.length === 0) {
      return {
        parsedContent: content,
        mentionedNoteIds
      };
    }
    
    // If there are mentions, join the segments with proper spacing
    return {
      parsedContent: segments.join(''),
      mentionedNoteIds
    };
  };

  const addToRecentViews = (noteId: string) => {
    setRecentViews(prevViews => {
      const filteredViews = prevViews.filter(id => id !== noteId);
      return [noteId, ...filteredViews].slice(0, 10);
    });
  };

  const getRecentlyViewedNotes = (): Note[] => {
    return recentViews
      .map(id => getNoteById(id))
      .filter((note): note is Note => note !== undefined);
  };

  const exportNotes = () => {
    downloadNotesAsMarkdown(notes, tags);
  };

  const importNotes = async (files: FileList): Promise<void> => {
    if (files.length === 0) return;
    
    console.log(`Would import ${files.length} files`);
    
    Array.from(files).forEach(file => {
      console.log(`Would import: ${file.name}`);
    });
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        addNote,
        createNote,
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
        getRecentlyViewedNotes,
        addToRecentViews,
        exportNotes,
        importNotes
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
