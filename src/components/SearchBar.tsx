
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, Sparkles, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { searchWithGemini, checkGeminiApiKey, saveGeminiApiKey } from '@/services/gemini';
import { useNotes } from '@/contexts/NotesContext';
import { Note } from '@/types/note';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const { notes } = useNotes();
  const { toast } = useToast();
  const debouncedQuery = useDebounce(query, 300);

  // Check if API key exists on component mount
  useEffect(() => {
    const checkApiKey = async () => {
      const keyExists = await checkGeminiApiKey();
      setHasApiKey(keyExists);
      if (!keyExists) {
        setIsApiKeyDialogOpen(true);
      }
    };
    checkApiKey();
  }, []);

  // Handle debounced search
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim() || !hasApiKey) return;
      
      setIsSearching(true);
      try {
        const results = await searchWithGemini(debouncedQuery, notes);
        setSearchResults(results);
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
      }
    };

    performSearch();
  }, [debouncedQuery, notes, hasApiKey, toast]);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid Gemini API key",
        variant: "destructive"
      });
      return;
    }

    saveGeminiApiKey(apiKey);
    const isValid = await checkGeminiApiKey();
    
    if (isValid) {
      setHasApiKey(true);
      setIsApiKeyDialogOpen(false);
      toast({
        title: "Success",
        description: "Gemini API key saved successfully!",
      });
    } else {
      toast({
        title: "Invalid API Key",
        description: "The provided API key is invalid. Please check and try again.",
        variant: "destructive"
      });
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
  };

  return (
    <>
      <div className="w-full mb-6">
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search your notes with AI..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10 py-6 bg-background border-border"
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
          
          {!hasApiKey && (
            <Button 
              variant="outline" 
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2"
              onClick={() => setIsApiKeyDialogOpen(true)}
            >
              <Sparkles className="h-4 w-4" />
              <span>Set API Key</span>
            </Button>
          )}
        </div>

        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-4 text-center text-muted-foreground"
            >
              Searching with AI...
            </motion.div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2"
            >
              <Card className="p-4 shadow-sm overflow-hidden">
                <h3 className="text-sm font-medium mb-2">Search Results ({searchResults.length})</h3>
                <ul className="space-y-2">
                  {searchResults.map((note) => (
                    <motion.li
                      key={note.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-2 hover:bg-secondary rounded cursor-pointer"
                      onClick={() => {
                        // Here you can implement note selection functionality
                        toast({
                          title: "Note Selected",
                          description: `You selected: ${note.title}`,
                        });
                      }}
                    >
                      <h4 className="font-medium">{note.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {note.content.substring(0, 100)}
                        {note.content.length > 100 ? '...' : ''}
                      </p>
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          )}

          {!isSearching && query && searchResults.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-4 text-center text-muted-foreground"
            >
              No results found
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Gemini API Key</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm mb-4">
              Please enter your Google Gemini API key to enable AI search functionality. 
              You can get an API key from the Google AI Studio.
            </p>
            <Input
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mb-2"
              type="password"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApiKeyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveApiKey}>
              Save API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SearchBar;
