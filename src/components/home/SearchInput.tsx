import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles } from 'lucide-react';
import { Note } from '@/contexts/NotesContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useToast } from '@/components/ui/use-toast';
import { searchNotes } from '@/services/search';
import { useDebounce } from '@/hooks/useDebounce';
import { GeminiService } from '@/services/gemini';

interface SearchInputProps {
  notes: Note[];
  onSearchResults: (results: Note[] | null, isSearching: boolean) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ notes, onSearchResults }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAISearch, setIsAISearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 600);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      setHasApiKey(GeminiService.hasApiKey());
    };
    
    checkApiKey();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm.trim()) {
        onSearchResults(null, false);
        return;
      }

      setIsSearching(true);
      try {
        if (isAISearch && !hasApiKey) {
          toast({
            title: "API Key Required",
            description: "Please set up your Gemini API key in settings to use AI search.",
            variant: "warning"
          });
          setIsAISearch(false);
        }

        const results = await searchNotes(
          notes,
          debouncedSearchTerm,
          { contentTypes: [], tags: [] },
          isAISearch && hasApiKey
        );
        
        onSearchResults(results, false);
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Search error",
          description: "There was a problem with your search. Please try again.",
          variant: "destructive"
        });
        onSearchResults(null, false);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, isAISearch, hasApiKey, notes, onSearchResults, toast]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Search notes"
          className="w-full justify-between md:w-[400px] lg:w-[600px]"
        >
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <span className="text-muted-foreground">{searchTerm || "Search notes..."}</span>
          <div className="flex items-center ml-auto gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 rounded-full ${isAISearch ? "text-primary bg-primary/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsAISearch(!isAISearch);
              }}
              title={isAISearch ? "Disable AI search" : "Enable AI search"}
            >
              <Sparkles className="h-3.5 w-3.5" />
            </Button>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[300px] p-0 md:w-[400px] lg:w-[600px] z-50" 
        ref={popoverRef}
        align="start"
        side="bottom"
        sideOffset={5}
      >
        <Command>
          <CommandInput 
            placeholder="Search notes..." 
            ref={inputRef}
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>
              {isSearching ? "Searching..." : "No results found."}
            </CommandEmpty>
            <CommandGroup heading="Smart Search">
              <CommandItem 
                onSelect={() => setIsAISearch(!isAISearch)}
                className="flex items-center"
              >
                <div className={`mr-2 h-4 w-4 ${isAISearch ? 'text-primary' : 'text-muted-foreground'}`}>
                  <Sparkles className="h-4 w-4" />
                </div>
                <span>Use AI for natural language search</span>
                {isAISearch && <span className="ml-auto text-xs text-primary">Active</span>}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchInput;
