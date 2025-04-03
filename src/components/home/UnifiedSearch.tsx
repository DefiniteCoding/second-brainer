
import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, X, RotateCcw } from 'lucide-react';
import { useNotes } from '@/contexts/NotesContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useUnifiedSearch } from '@/hooks/useUnifiedSearch';
import SearchResultsDropdown from './SearchResultsDropdown';
import ApiKeyDialogComponent from './ApiKeyDialogComponent';
import { Note } from '@/types/note';
import GradientLoader from '@/components/search/GradientLoader';
import { useRecentSearches } from '@/hooks/useRecentSearches';

interface UnifiedSearchProps {
  onSearchResults: (results: Note[] | null, isSearching: boolean) => void;
}

export const UnifiedSearch: React.FC<UnifiedSearchProps> = ({ onSearchResults }) => {
  const { notes } = useNotes();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    isAISearch,
    isSearching,
    hasApiKey,
    apiKeyDialogOpen,
    setApiKeyDialogOpen,
    clearSearch,
    toggleAISearch,
    recentSearches,
  } = useUnifiedSearch(notes);

  const { removeSearch, clearRecentSearches } = useRecentSearches();

  // Update parent component with search results
  useEffect(() => {
    onSearchResults(searchResults.length > 0 ? searchResults : null, isSearching);
  }, [searchResults, isSearching, onSearchResults]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        clearSearch();
        setShowRecentSearches(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [clearSearch]);

  const handleApiKeySuccess = () => {
    setApiKeyDialogOpen(false);
    toggleAISearch();
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchTerm(query);
    setShowRecentSearches(false);
  };

  return (
    <div className="w-full relative" ref={dropdownRef}>
      <div className="relative">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (!searchTerm && recentSearches.length > 0) {
              setShowRecentSearches(true);
            }
          }}
          placeholder="Search notes..."
          className="w-full pl-10 pr-24 h-10 bg-muted/50 border-muted-foreground/20 rounded-lg"
        />
        
        {isSearching ? (
          <GradientLoader className="absolute left-3 top-1/2 -translate-y-1/2" />
        ) : (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
        )}
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 rounded-full ${isAISearch ? 'bg-primary/10 text-primary' : ''}`}
            onClick={toggleAISearch}
            title={isAISearch ? "Disable AI search" : "Enable AI search"}
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showRecentSearches && recentSearches.length > 0 && !searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute w-full mt-1 p-2 bg-card rounded-md border shadow-md z-50"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Recent Searches</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={clearRecentSearches}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>

            <div className="max-h-[200px] overflow-y-auto">
              {recentSearches.map((search, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-1.5 hover:bg-muted rounded-sm cursor-pointer"
                  onClick={() => handleRecentSearchClick(search)}
                >
                  <div className="flex items-center">
                    <span className="text-sm">{search}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSearch(search);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <SearchResultsDropdown 
          searchResults={searchResults} 
          isSearching={isSearching}
          isAISearch={isAISearch}
          searchTerm={searchTerm}
        />
      </AnimatePresence>

      <ApiKeyDialogComponent 
        open={apiKeyDialogOpen} 
        onOpenChange={setApiKeyDialogOpen} 
        onSuccess={handleApiKeySuccess}
      />
    </div>
  );
};

export default UnifiedSearch;
