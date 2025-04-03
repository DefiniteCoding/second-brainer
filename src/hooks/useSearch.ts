
import { useState, useEffect, useRef } from 'react';
import { Note } from '@/contexts/NotesContext';
import { useDebounce } from '@/hooks/useDebounce';
import { searchNotes } from '@/services/search';
import { GeminiService } from '@/services/gemini';
import { useToast } from '@/components/ui/use-toast';

export const useSearch = (notes: Note[]) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const debouncedQuery = useDebounce(query, 300);
  const searchInProgressRef = useRef(false);
  const lastSearchQueryRef = useRef('');

  // Check if API key exists on component mount
  useEffect(() => {
    const checkApiKey = async () => {
      const keyExists = !!GeminiService.getApiKey();
      setHasApiKey(keyExists);
    };
    checkApiKey();
  }, []);

  // Handle debounced search
  useEffect(() => {
    // Skip if already searching, query is empty, or the query hasn't changed
    if (
      searchInProgressRef.current || 
      !debouncedQuery.trim() || 
      debouncedQuery === lastSearchQueryRef.current
    ) {
      if (!debouncedQuery.trim()) {
        setSearchResults([]);
      }
      return;
    }
    
    const performSearch = async () => {
      if (isAIEnabled && !hasApiKey) {
        setIsApiKeyDialogOpen(true);
        return;
      }

      searchInProgressRef.current = true;
      setIsSearching(true);
      try {
        const results = await searchNotes(notes, debouncedQuery, {}, isAIEnabled && hasApiKey);
        setSearchResults(results);
        lastSearchQueryRef.current = debouncedQuery;
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Search failed",
          description: "There was an error processing your search. Please try again.",
          variant: "destructive"
        });
        setSearchResults([]);
      } finally {
        setIsSearching(false);
        searchInProgressRef.current = false;
      }
    };

    performSearch();
  }, [debouncedQuery, notes, isAIEnabled, hasApiKey, toast]);

  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
  };

  const toggleAISearch = () => {
    if (!hasApiKey && !isAIEnabled) {
      setIsApiKeyDialogOpen(true);
      return;
    }
    setIsAIEnabled(!isAIEnabled);
  };

  const handleApiKeyValidated = () => {
    setHasApiKey(true);
    setIsAIEnabled(true);
  };

  return {
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
  };
};
