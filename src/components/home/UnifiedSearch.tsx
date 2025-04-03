
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, X } from 'lucide-react';
import { searchNotes } from '@/services/search';
import { useNotes } from '@/contexts/NotesContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const UnifiedSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { notes } = useNotes();
  const navigate = useNavigate();

  useEffect(() => {
    const results = searchTerm 
      ? searchNotes(notes, searchTerm) 
      : [];
    setSearchResults(results);
  }, [searchTerm, notes]);

  const handleNoteSelect = (noteId: string) => {
    navigate(`/?noteId=${noteId}`);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search notes..."
          className="w-full pl-10 pr-24 h-10 bg-muted/50 border-muted-foreground/20 rounded-lg"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => setSearchTerm('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 bg-muted/50 rounded-lg"
          >
            <div className="p-2">
              {searchResults.map((note) => (
                <div 
                  key={note.id} 
                  onClick={() => handleNoteSelect(note.id)}
                  className="p-2 hover:bg-muted/80 cursor-pointer"
                >
                  <h4 className="font-medium">{note.title}</h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {note.content.substring(0, 100)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UnifiedSearch;
