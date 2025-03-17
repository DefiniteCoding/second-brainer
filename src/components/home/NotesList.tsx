
import React from 'react';
import { Note } from '@/contexts/NotesContext';
import { useNotes } from '@/contexts/NotesContext';
import { Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NotesListProps {
  searchResults: Note[] | null;
  isSearching: boolean;
  onNoteSelected: (note: Note) => void;
}

const NotesList: React.FC<NotesListProps> = ({
  searchResults,
  isSearching,
  onNoteSelected,
}) => {
  const { notes } = useNotes();
  const displayedNotes = searchResults || notes;
  const isFiltered = searchResults !== null;

  if (isSearching) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isFiltered && (
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          <span>Showing search results ({displayedNotes.length} {displayedNotes.length === 1 ? 'note' : 'notes'})</span>
        </div>
      )}

      <AnimatePresence mode="sync">
        <div className="grid grid-cols-1 gap-4">
          {displayedNotes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <button
                onClick={() => onNoteSelected(note)}
                className={cn(
                  "w-full text-left p-4 rounded-lg",
                  "bg-card hover:bg-accent/50 border border-border",
                  "transition-colors duration-200"
                )}
              >
                <h3 className="font-medium text-lg mb-1">{note.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {note.tags.map(tag => (
                      <span
                        key={tag.id} // Fix the key issue
                        className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs"
                      >
                        {tag.name} {/* Fix the tag display */}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {displayedNotes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {isFiltered ? 'No notes match your search criteria' : 'No notes yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotesList;
