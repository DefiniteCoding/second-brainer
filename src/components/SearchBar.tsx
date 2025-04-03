
import React, { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, X } from 'lucide-react';
import { useNotes } from '@/contexts/NotesContext';
import ApiKeyDialog from '@/components/search/ApiKeyDialog';
import SearchResults from '@/components/search/SearchResults';
import { useSearch } from '@/hooks/useSearch';
import { AnimatePresence } from 'framer-motion';

const SearchBar: React.FC = () => {
  const { notes } = useNotes();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    query,
    setQuery,
    searchResults,
    isSearching,
    isAIEnabled,
    hasApiKey,
    isApiKeyDialogOpen,
    setIsApiKeyDialogOpen,
    clearSearch,
    toggleAISearch,
    handleApiKeyValidated
  } = useSearch(notes);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        clearSearch();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full mb-6 px-4 py-4" ref={searchContainerRef}>
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10 py-2 h-10 bg-background/50 border-muted dark:bg-secondary/20"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Button 
          variant={isAIEnabled ? "default" : "outline"}
          size="sm"
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2"
          onClick={toggleAISearch}
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">{isAIEnabled ? "AI Enabled" : "Enable AI"}</span>
        </Button>
      </div>

      <AnimatePresence>
        <SearchResults 
          results={searchResults} 
          isSearching={isSearching} 
          query={query} 
        />
      </AnimatePresence>

      <ApiKeyDialog 
        open={isApiKeyDialogOpen} 
        onOpenChange={setIsApiKeyDialogOpen}
        onApiKeyValidated={handleApiKeyValidated}
      />
    </div>
  );
};

export default SearchBar;
