
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, X } from 'lucide-react';
import { searchNotes } from '@/services/search';
import { useNotes } from '@/contexts/NotesContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Note } from '@/contexts/NotesContext';
import { useToast } from '@/components/ui/use-toast';
import { GeminiService } from '@/services/gemini';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface UnifiedSearchProps {
  onSearchResults: (results: Note[] | null, isSearching: boolean) => void;
}

export const UnifiedSearch: React.FC<UnifiedSearchProps> = ({ onSearchResults }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isAISearch, setIsAISearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const { notes } = useNotes();
  const navigate = useNavigate();
  const { toast } = useToast();
  const searchInProgressRef = useRef(false);
  const lastSearchTermRef = useRef('');
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if API key exists on component mount
  useEffect(() => {
    const storedKey = GeminiService.getApiKey();
    setHasApiKey(!!storedKey);
  }, []);

  // Handle search when searchTerm changes
  useEffect(() => {
    // Clear any existing timers
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // If search term is empty, clear results
    if (!searchTerm.trim()) {
      setSearchResults([]);
      onSearchResults(null, false);
      return;
    }

    // Skip if already searching same term
    if (searchInProgressRef.current && searchTerm === lastSearchTermRef.current) {
      return;
    }

    // Debounce search
    searchTimerRef.current = setTimeout(async () => {
      if (!searchTerm.trim()) return;

      // Check if AI search is enabled but no API key
      if (isAISearch && !hasApiKey) {
        setApiKeyDialogOpen(true);
        return;
      }

      setIsSearching(true);
      searchInProgressRef.current = true;
      lastSearchTermRef.current = searchTerm;
      onSearchResults(null, true);

      try {
        const results = await searchNotes(notes, searchTerm, {}, isAISearch);
        setSearchResults(results);
        onSearchResults(results, false);
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Search failed",
          description: "There was an error performing the search",
          variant: "destructive"
        });
        onSearchResults(null, false);
      } finally {
        setIsSearching(false);
        searchInProgressRef.current = false;
      }
    }, 500);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [searchTerm, notes, isAISearch, hasApiKey, onSearchResults, toast]);

  const handleNoteSelect = (noteId: string) => {
    navigate(`/?noteId=${noteId}`);
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid Gemini API key",
        variant: "destructive"
      });
      return;
    }

    try {
      const isValid = await GeminiService.validateApiKey(apiKey);
      if (isValid) {
        GeminiService.saveApiKey(apiKey);
        setHasApiKey(true);
        setApiKeyDialogOpen(false);
        toast({
          title: "Success",
          description: "API key saved successfully"
        });
      } else {
        toast({
          title: "Invalid API Key",
          description: "The provided API key is invalid",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate API key",
        variant: "destructive"
      });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full relative">
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
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 rounded-full ${isAISearch ? 'bg-primary/10 text-primary' : ''}`}
            onClick={() => {
              if (!hasApiKey && !isAISearch) {
                setApiKeyDialogOpen(true);
              } else {
                setIsAISearch(!isAISearch);
              }
            }}
            title={isAISearch ? "Disable AI search" : "Enable AI search"}
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-center text-muted-foreground"
          >
            {isAISearch ? "Searching with AI..." : "Searching..."}
          </motion.div>
        )}
        
        {searchResults.length > 0 && !isSearching && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute z-50 left-0 right-0 mt-2 bg-background shadow-lg rounded-lg border border-border overflow-hidden"
            style={{ zIndex: 1000 }} // Ensure high z-index to appear above other elements
          >
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              {searchResults.map((note) => (
                <div 
                  key={note.id} 
                  onClick={() => handleNoteSelect(note.id)}
                  className="p-2 hover:bg-muted cursor-pointer rounded"
                >
                  <h4 className="font-medium">{note.title}</h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {note.content.substring(0, 100)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Gemini API Key</DialogTitle>
            <DialogDescription>
              AI search requires a Google Gemini API key to work. 
              You can get one for free from the Google AI Studio.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Enter your Gemini API key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApiKeyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveApiKey}>
              Save API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnifiedSearch;
