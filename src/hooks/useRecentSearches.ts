
import { useState, useEffect } from 'react';

const MAX_RECENT_SEARCHES = 8;
const STORAGE_KEY = 'recentSearches';

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSearches));
  }, [recentSearches]);

  const addSearch = (query: string) => {
    if (!query.trim()) return;
    
    setRecentSearches(prev => {
      // Remove the query if it already exists
      const filtered = prev.filter(item => item.toLowerCase() !== query.toLowerCase());
      // Add the new query at the beginning
      const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const removeSearch = (query: string) => {
    setRecentSearches(prev => 
      prev.filter(item => item !== query)
    );
  };

  return {
    recentSearches,
    addSearch,
    clearRecentSearches,
    removeSearch
  };
}
