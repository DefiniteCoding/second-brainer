
import React, { useRef } from 'react';
import { Note } from '@/contexts/NotesContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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

  if (isSearching) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mt-2 text-sm text-center text-muted-foreground"
      >
        {isAISearch ? "Searching with AI..." : "Searching..."}
      </motion.div>
    );
  }

  if (searchResults.length === 0 || !searchTerm) {
    return null;
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
            <h4 className="font-medium">{note.title}</h4>
            <p className="text-sm text-muted-foreground truncate">
              {note.content.substring(0, 100)}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SearchResultsDropdown;
