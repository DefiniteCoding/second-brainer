
import { v4 as uuidv4 } from 'uuid';
import { Note, Tag } from '@/types/note';

// Interface for Markdown file info
export interface MarkdownFile {
  id: string;
  filename: string;
  content: string;
  frontMatter: {
    title: string;
    tags: string[];
    contentType: 'text' | 'image' | 'link' | 'audio' | 'video';
    createdAt: string;
    updatedAt: string;
    mediaUrl?: string;
    source?: string;
    location?: { latitude: number; longitude: number };
    connections?: string[];
    mentions?: string[];
  };
}

// Convert a Note object to Markdown format with YAML frontmatter
export const noteToMarkdown = (note: Note, tags: Tag[]): MarkdownFile => {
  const tagNames = note.tags.map(tag => tag.name);
  
  const frontMatter = {
    title: note.title,
    tags: tagNames,
    contentType: note.contentType,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
    mediaUrl: note.mediaUrl,
    source: note.source,
    location: note.location,
    connections: note.connections,
    mentions: note.mentions
  };
  
  // Generate a filename based on the title
  const filename = `${note.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${note.id.slice(0, 8)}.md`;
  
  return {
    id: note.id,
    filename,
    content: note.content,
    frontMatter
  };
};

// Convert Markdown with frontmatter back to a Note object
export const markdownToNote = (markdown: MarkdownFile, allTags: Tag[]): Note => {
  const { frontMatter, content, id } = markdown;
  
  // Find tag objects by name
  const noteTags = frontMatter.tags.map(tagName => {
    const foundTag = allTags.find(t => t.name === tagName);
    return foundTag || { id: uuidv4(), name: tagName, color: '#cccccc' };
  });
  
  return {
    id: id,
    title: frontMatter.title,
    content: content,
    contentType: frontMatter.contentType,
    createdAt: new Date(frontMatter.createdAt),
    updatedAt: new Date(frontMatter.updatedAt),
    tags: noteTags,
    mediaUrl: frontMatter.mediaUrl,
    source: frontMatter.source,
    location: frontMatter.location,
    connections: frontMatter.connections || [],
    mentions: frontMatter.mentions || []
  };
};

// Export/import functions for the entire notes collection
export const exportNotesToMarkdown = (notes: Note[], tags: Tag[]): MarkdownFile[] => {
  return notes.map(note => noteToMarkdown(note, tags));
};

export const importNotesFromMarkdown = (markdownFiles: MarkdownFile[], allTags: Tag[]): Note[] => {
  return markdownFiles.map(file => markdownToNote(file, allTags));
};

// LocalStorage wrapper functions with Markdown conversion
export const saveNotesToLocalStorage = async (notes: Note[], tags: Tag[]): Promise<void> => {
  try {
    // Create backup of current storage state
    const currentData = localStorage.getItem('second-brain-notes');
    if (currentData) {
      localStorage.setItem('second-brain-notes-backup', currentData);
    }

    // Store the full note objects for app usage
    localStorage.setItem('second-brain-notes', JSON.stringify(notes));
    
    // Also store as Markdown for portability
    const markdownFiles = exportNotesToMarkdown(notes, tags);
    localStorage.setItem('second-brain-markdown', JSON.stringify(markdownFiles));
    
    // Store last save timestamp
    localStorage.setItem('second-brain-last-save', new Date().toISOString());

    // Clear backup after successful save
    console.log('Notes saved successfully at', new Date().toLocaleTimeString());
  } catch (error) {
    console.error('Failed to save notes:', error);
    // Attempt to restore from backup
    const backup = localStorage.getItem('second-brain-notes-backup');
    if (backup) {
      localStorage.setItem('second-brain-notes', backup);
      throw new Error('Save failed, restored from backup');
    }
    throw error;
  }
};

export const loadNotesFromLocalStorage = (tags: Tag[]): Note[] => {
  const savedNotes = localStorage.getItem('second-brain-notes');
  
  if (savedNotes) {
    try {
      const parsedNotes = JSON.parse(savedNotes);
      // Convert string dates back to Date objects
      return parsedNotes.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to parse notes from localStorage:', error);
      return [];
    }
  }
  
  // If no notes in regular storage, try to load from Markdown
  const savedMarkdown = localStorage.getItem('second-brain-markdown');
  if (savedMarkdown) {
    try {
      const markdownFiles = JSON.parse(savedMarkdown);
      return importNotesFromMarkdown(markdownFiles, tags);
    } catch (error) {
      console.error('Failed to parse markdown from localStorage:', error);
      return [];
    }
  }
  
  return [];
};

// Download all notes as a ZIP of Markdown files
export const downloadNotesAsMarkdown = async (notes: Note[], tags: Tag[]): Promise<void> => {
  // This function would normally use a library like JSZip
  // Since we can't install new dependencies, we'll just download the first note as an example
  if (notes.length === 0) return;
  
  const markdown = noteToMarkdown(notes[0], tags);
  const frontMatterYaml = Object.entries(markdown.frontMatter)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n');
    
  const fileContent = `---\n${frontMatterYaml}\n---\n\n${markdown.content}`;
  
  // Create a download link
  const blob = new Blob([fileContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = markdown.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// A simplified SQLite-like interface using IndexedDB for metadata
// Since we can't use actual SQLite in the browser, this simulates the concept
export const metadataDB = {
  // Initialize the database
  init: () => {
    console.log('Metadata DB initialized (simulated)');
    // In a real implementation, this would open/create an IndexedDB database
  },
  
  // Store metadata for all notes
  storeMetadata: (notes: Note[]) => {
    console.log(`Storing metadata for ${notes.length} notes (simulated)`);
    // This would actually store the metadata in IndexedDB
    
    // For now, we'll just use localStorage as a simple simulation
    const metadata = notes.map(note => ({
      id: note.id,
      title: note.title,
      contentType: note.contentType,
      tagIds: note.tags.map(t => t.id),
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      connections: note.connections,
      mentions: note.mentions
    }));
    
    localStorage.setItem('second-brain-metadata', JSON.stringify(metadata));
  },
  
  // Query notes by various criteria (simplified version)
  queryNotes: (criteria: {
    tagIds?: string[],
    contentType?: string[],
    fromDate?: string,
    toDate?: string,
    searchText?: string
  }): string[] => {
    // This would perform a proper query in IndexedDB
    console.log('Querying notes with criteria:', criteria);
    
    // For our simple simulation, we'll load from localStorage and filter
    const metadataStr = localStorage.getItem('second-brain-metadata');
    if (!metadataStr) return [];
    
    try {
      const metadata = JSON.parse(metadataStr);
      // Filter based on criteria
      const filteredIds = metadata
        .filter((meta: any) => {
          // Tag filter
          if (criteria.tagIds && criteria.tagIds.length > 0) {
            if (!criteria.tagIds.some(tagId => meta.tagIds.includes(tagId))) {
              return false;
            }
          }
          
          // Content type filter
          if (criteria.contentType && criteria.contentType.length > 0) {
            if (!criteria.contentType.includes(meta.contentType)) {
              return false;
            }
          }
          
          // Date filters
          if (criteria.fromDate && new Date(meta.createdAt) < new Date(criteria.fromDate)) {
            return false;
          }
          if (criteria.toDate && new Date(meta.createdAt) > new Date(criteria.toDate)) {
            return false;
          }
          
          // Full text is simulated here - in a real DB this would be more sophisticated
          if (criteria.searchText && !meta.title.toLowerCase().includes(criteria.searchText.toLowerCase())) {
            return false;
          }
          
          return true;
        })
        .map((meta: any) => meta.id);
        
      return filteredIds;
    } catch (error) {
      console.error('Error querying metadata:', error);
      return [];
    }
  }
};
