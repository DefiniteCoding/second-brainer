
import React, { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, X } from 'lucide-react';
import { useNotes } from '@/contexts/NotesContext';
import { AnimatePresence } from 'framer-motion';
import { useUnifiedSearch } from '@/hooks/useUnifiedSearch';
import SearchResultsDropdown from './SearchResultsDropdown';
import ApiKeyDialogComponent from './ApiKeyDialogComponent';
import { Note } from '@/contexts/NotesContext';

interface UnifiedSearchProps {
  onSearchResults: (results: Note[] | null, isSearching: boolean) => void;
}

export const UnifiedSearch: React.FC<UnifiedSearchProps> = ({ onSearchResults }) => {
  const { notes } = useNotes();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
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
    toggleAISearch
  } = useUnifiedSearch(notes);

  // Update parent component with search results
  useEffect(() => {
    onSearchResults(searchResults.length > 0 ? searchResults : null, isSearching);
  }, [searchResults, isSearching, onSearchResults]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        clearSearch();
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

  return (
    <div className="w-full relative" ref={dropdownRef}>
      <div className="relative">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search notes..."
          className="w-full pl-10 pr-24 h-10 bg-muted/50 border-muted-foreground/20 rounded-lg"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
        
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
