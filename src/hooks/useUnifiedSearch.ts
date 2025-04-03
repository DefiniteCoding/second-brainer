
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
  const lastSearchAIStateRef = useRef(false);
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
    // If search term is empty, clear results and exit
    if (!debouncedSearchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      searchInProgressRef.current = false;
      return;
    }

    // Skip if already searching the same term with the same AI state
    if (
      searchInProgressRef.current && 
      debouncedSearchTerm === lastSearchTermRef.current && 
      isAISearch === lastSearchAIStateRef.current
    ) {
      return;
    }
    
    const performSearch = async () => {
      if (isAISearch && !hasApiKey) {
        setApiKeyDialogOpen(true);
        return;
      }

      // Mark search as in progress and save terms
      setIsSearching(true);
      searchInProgressRef.current = true;
      lastSearchTermRef.current = debouncedSearchTerm;
      lastSearchAIStateRef.current = isAISearch;

      try {
        const results = await searchNotes(notes, debouncedSearchTerm, {}, isAISearch);
        
        // Only update results if the search term hasn't changed during the search
        if (debouncedSearchTerm === lastSearchTermRef.current) {
          setSearchResults(results);
          
          // Only add to recent searches if we got meaningful results
          if (results.length > 0) {
            addSearch(debouncedSearchTerm);
          }
        }
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Search failed",
          description: "There was an error performing the search",
          variant: "destructive"
        });
      } finally {
        // Only mark search as complete if the search term hasn't changed
        if (debouncedSearchTerm === lastSearchTermRef.current) {
          setIsSearching(false);
          searchInProgressRef.current = false;
        }
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
