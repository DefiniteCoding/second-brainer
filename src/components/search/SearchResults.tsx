
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Note } from '@/contexts/NotesContext';
import { useNavigate } from 'react-router-dom';

interface SearchResultsProps {
  results: Note[];
  isSearching: boolean;
  query: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, isSearching, query }) => {
  const navigate = useNavigate();

  const handleNoteClick = (noteId: string) => {
    navigate(`/?noteId=${noteId}`);
  };

  if (isSearching) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="py-4 text-center text-muted-foreground"
      >
        Searching with AI...
      </motion.div>
    );
  }

  if (!query) {
    return null;
  }

  if (results.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="py-4 text-center text-muted-foreground"
      >
        No results found
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-2"
      style={{ position: 'relative', zIndex: 50 }}
    >
      <Card className="p-4 shadow-sm overflow-hidden">
        <h3 className="text-sm font-medium mb-2">Search Results ({results.length})</h3>
        <ul className="space-y-2">
          {results.map((note) => (
            <motion.li
              key={note.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="p-2 hover:bg-secondary rounded cursor-pointer"
              onClick={() => handleNoteClick(note.id)}
            >
              <h4 className="font-medium">{note.title}</h4>
              <p className="text-sm text-muted-foreground truncate">
                {note.content.substring(0, 100)}
                {note.content.length > 100 ? '...' : ''}
              </p>
            </motion.li>
          ))}
        </ul>
      </Card>
    </motion.div>
  );
};

export default SearchResults;
