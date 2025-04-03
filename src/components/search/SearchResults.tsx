
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Note } from '@/types/note';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GradientLoader from './GradientLoader';

interface SearchResultsProps {
  results: Note[];
  isSearching: boolean;
  query: string;
  onUseAISearch?: () => void;
  isAIEnabled?: boolean;
}

// Highlight matching text in content
const HighlightedText = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <span>{text}</span>;
  
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  
  return (
    <span>
      {parts.map((part, index) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <mark key={index} className="bg-yellow-100 dark:bg-yellow-900/40 px-0.5 rounded-sm">{part}</mark>
          : <span key={index}>{part}</span>
      )}
    </span>
  );
};

// For multi-word queries
const MultiWordHighlight = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <span>{text}</span>;
  
  const keywords = query.trim().split(/\s+/).filter(Boolean);
  let highlightedText = text;
  
  keywords.forEach(keyword => {
    if (keyword.length > 2) { // Only highlight meaningful words (3+ chars)
      const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      highlightedText = highlightedText.replace(regex, '**$1**');
    }
  });
  
  // Convert markdown-style highlights to JSX
  const parts = highlightedText.split(/(\*\*.*?\*\*)/g);
  
  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const content = part.slice(2, -2);
          return <mark key={index} className="bg-yellow-100 dark:bg-yellow-900/40 px-0.5 rounded-sm">{content}</mark>;
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  isSearching, 
  query,
  onUseAISearch,
  isAIEnabled = false
}) => {
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
        className="py-4 text-center text-muted-foreground flex items-center justify-center"
      >
        <GradientLoader size="sm" className="mr-2" />
        <span>Searching results...</span>
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
        className="p-4 text-center"
      >
        <p className="text-muted-foreground mb-2">No results found</p>
        
        {onUseAISearch && !isAIEnabled && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-2"
          >
            <p className="text-sm text-muted-foreground mb-2">
              Try AI-powered search for better, context-aware results!
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1.5"
              onClick={onUseAISearch}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Use AI Search
            </Button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-2 max-h-[60vh] overflow-auto"
      style={{ position: 'relative', zIndex: 50 }}
    >
      <Card className="p-4 shadow-sm overflow-hidden">
        <h3 className="text-sm font-medium mb-2">Search Results ({results.length})</h3>
        
        {!isAIEnabled && onUseAISearch && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-3 p-2 bg-secondary/50 rounded-md text-sm flex justify-between items-center"
          >
            <span>Try AI-powered search for better, context-aware results!</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1.5 ml-2"
              onClick={onUseAISearch}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Use AI Search
            </Button>
          </motion.div>
        )}
        
        <ul className="space-y-2">
          {results.map((note) => (
            <motion.li
              key={note.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="p-2 hover:bg-secondary rounded cursor-pointer group"
              onClick={() => handleNoteClick(note.id)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNoteClick(note.id);
              }}
            >
              <h4 className="font-medium">
                <MultiWordHighlight text={note.title || 'Untitled'} query={query} />
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2 group-hover:line-clamp-3 transition-all duration-200">
                <MultiWordHighlight 
                  text={note.content.substring(0, 150)}
                  query={query} 
                />
                {note.content.length > 150 ? '...' : ''}
              </p>
            </motion.li>
          ))}
        </ul>
      </Card>
    </motion.div>
  );
};

export default SearchResults;
