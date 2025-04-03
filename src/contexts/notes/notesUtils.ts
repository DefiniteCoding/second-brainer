
import { Note } from '@/types/note';
import React from 'react';

// Helper function to merge notes from different sources
export const mergeNotes = (indexedDBNotes: Note[], fileSystemNotes: Note[]): Note[] => {
  const merged = new Map<string, Note>();
  
  // Add IndexedDB notes first
  indexedDBNotes.forEach(note => {
    merged.set(note.id, note);
  });
  
  // Override with File System notes
  fileSystemNotes.forEach(note => {
    merged.set(note.id, note);
  });
  
  return Array.from(merged.values());
};

export const parseNoteContent = (content: string, notes: Record<string, Note>): { 
  parsedContent: React.ReactNode, 
  mentionedNoteIds: string[] 
} => {
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
    
    const mentionedNote = Object.values(notes)
      .find(n => n.title?.toLowerCase() === mentionTitle.toLowerCase());
    
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
  
  if (segments.length === 0) {
    return {
      parsedContent: content,
      mentionedNoteIds
    };
  }
  
  return {
    parsedContent: segments.join(''),
    mentionedNoteIds
  };
};

export const getSuggestedConnections = (noteId: string, notes: Record<string, Note>): Note[] => {
  const currentNote = notes[noteId]?.note;
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
  
  return Object.values(notes)
    .map(entry => entry.note)
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
