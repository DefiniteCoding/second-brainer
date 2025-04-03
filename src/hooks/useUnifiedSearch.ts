
import { useState, useEffect, useRef } from 'react';
import { Note } from '@/types/note';
import { useDebounce } from '@/hooks/useDebounce';
import { searchNotes } from '@/services/search';
import { GeminiService } from '@/services/gemini';
import { useToast } from '@/components/ui/use-toast';
import { useRecentSearches } from '@/hooks/useRecentSearches';

export const useUnifiedSearch = (notes: Note[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isAISearch, setIsAISearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  
  const { toast } = useToast();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const searchInProgressRef = useRef(false);
  const lastSearchTermRef = useRef('');
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { recentSearches, addSearch } = useRecentSearches();

  // Check if API key exists on component mount
  useEffect(() => {
    const checkApiKey = async () => {
      setHasApiKey(GeminiService.hasApiKey());
    };
    
    checkApiKey();
  }, []);

  // Handle debounced search
  useEffect(() => {
    // Clear any existing timers
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // If search term is empty, clear results
    if (!debouncedSearchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    // Skip if already searching same term
    if (searchInProgressRef.current && debouncedSearchTerm === lastSearchTermRef.current) {
      return;
    }
    
    const performSearch = async () => {
      if (isAISearch && !hasApiKey) {
        setApiKeyDialogOpen(true);
        return;
      }

      setIsSearching(true);
      searchInProgressRef.current = true;
      lastSearchTermRef.current = debouncedSearchTerm;

      try {
        const results = await searchNotes(notes, debouncedSearchTerm, {}, isAISearch);
        setSearchResults(results);
        
        // Only add to recent searches if it's a user-initiated search (not auto-search from debounce)
        // and if we got meaningful results
        if (results.length > 0) {
          addSearch(debouncedSearchTerm);
        }
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Search failed",
          description: "There was an error performing the search",
          variant: "destructive"
        });
      } finally {
        setIsSearching(false);
        searchInProgressRef.current = false;
      }
    };

    performSearch();
  }, [debouncedSearchTerm, notes, isAISearch, hasApiKey, toast, addSearch]);

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };

  const toggleAISearch = () => {
    if (!hasApiKey && !isAISearch) {
      setApiKeyDialogOpen(true);
    } else {
      setIsAISearch(!isAISearch);
    }
  };

  return {
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
  };
};
