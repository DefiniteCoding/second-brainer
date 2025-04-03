
import React, { useRef } from 'react';
import { Note } from '@/contexts/NotesContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GradientLoader from '@/components/search/GradientLoader';

interface SearchResultsDropdownProps {
  searchResults: Note[];
  isSearching: boolean;
  isAISearch: boolean;
  searchTerm: string;
}

const SearchResultsDropdown: React.FC<SearchResultsDropdownProps> = ({
  searchResults,
  isSearching,
  isAISearch,
  searchTerm
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleNoteSelect = (noteId: string) => {
    navigate(`/?noteId=${noteId}`);
  };

  // Highlight matching text in search results
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const keywords = query.trim().split(/\s+/).filter(keyword => keyword.length > 2);
    if (keywords.length === 0) return text;
    
    let result = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      result = result.replace(regex, '<mark class="bg-yellow-100 dark:bg-yellow-900/40 px-0.5 rounded-sm">$1</mark>');
    });
    
    return result;
  };

  if (!searchTerm) {
    return null;
  }

  if (isSearching) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute z-50 left-0 right-0 mt-2 bg-background shadow-lg rounded-lg border border-border overflow-hidden p-4 flex items-center justify-center"
      >
        <GradientLoader variant="apple" size="md" className="mx-auto" />
      </motion.div>
    );
  }

  if (searchResults.length === 0 && searchTerm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute z-50 left-0 right-0 mt-2 bg-background shadow-lg rounded-lg border border-border p-4 text-center"
      >
        <p className="text-muted-foreground">No results found</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="absolute z-50 left-0 right-0 mt-2 bg-background shadow-lg rounded-lg border border-border overflow-hidden"
      style={{ zIndex: 1000 }}
    >
      <div className="p-2 max-h-[60vh] overflow-y-auto">
        {searchResults.map((note) => (
          <div 
            key={note.id} 
            onClick={() => handleNoteSelect(note.id)}
            className="p-2 hover:bg-muted cursor-pointer rounded"
          >
            <h4 className="font-medium" 
              dangerouslySetInnerHTML={{ __html: highlightText(note.title || 'Untitled', searchTerm) }} 
            />
            <p className="text-sm text-muted-foreground truncate"
              dangerouslySetInnerHTML={{ 
                __html: highlightText(note.content.substring(0, 100), searchTerm) 
              }} 
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SearchResultsDropdown;
