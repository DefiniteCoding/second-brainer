
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings, Search, Plus, Sparkles, ExternalLink, Tag, Bookmark, Cog, NetworkIcon } from 'lucide-react';
import { Note, useNotes } from '@/contexts/NotesContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import TagManager from '@/components/TagManager';
import { useToast } from '@/components/ui/use-toast';
import AISettings from '@/components/AISettings';
import { searchNotes } from '@/services/search';
import { useDebounce } from '@/hooks/useDebounce';
import HeaderSection from './HeaderSection';

interface SearchBarProps {
  onNoteSelected: (note: Note) => void;
  onAddNote: () => void;
  onSearchResults: (results: Note[] | null, isSearching: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onNoteSelected, onAddNote, onSearchResults }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTagManager, setShowTagManager] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const [isAISearch, setIsAISearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { notes, exportNotes } = useNotes();
  const navigate = useNavigate();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 600);

  // Apply search filter, potentially using AI if enabled
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm.trim()) {
        onSearchResults(null, false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchNotes(
          notes,
          debouncedSearchTerm,
          { contentTypes: [], tags: [] },
          isAISearch
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
  }, [debouncedSearchTerm, isAISearch, notes]);

  // Focus the input field when search is opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  // Clear search when closed
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
    }
  }, [open]);

  const handleExport = () => {
    try {
      exportNotes();
      toast({
        title: "Export successful",
        description: "Your notes have been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was a problem exporting your notes. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="border-b">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4">
        <div className="mr-4 flex">
          <HeaderSection />
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  aria-label="Search notes"
                  className="w-full justify-between md:w-[400px] lg:w-[600px]" // Increased width
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
              <PopoverContent className="w-[300px] p-0 md:w-[400px] lg:w-[600px]"> {/* Increased width */}
                <Command>
                  <CommandInput 
                    placeholder="Search notes..." 
                    ref={inputRef}
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                  />
                  <CommandList>
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
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/graph')}
              className="gap-1.5"
              title="View Knowledge Graph"
            >
              <NetworkIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Graph</span>
            </Button>
            
            <Button
              variant="default"
              onClick={onAddNote}
              className="gap-1 bg-primary hover:bg-primary/90"
              title="Create new note"
            >
              <Plus className="h-4 w-4" />
              <span>Add Note</span>
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                className="rounded-full"
                title="Settings"
              >
                <Cog className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowTagManager(true)}>
                <Tag className="mr-2 h-4 w-4" />
                <span>Manage Tags</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExport}>
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>Export Notes</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowAISettings(true)}>
                <Sparkles className="mr-2 h-4 w-4" />
                <span>AI Settings</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {showTagManager && (
        <TagManager 
          open={showTagManager} 
          onOpenChange={setShowTagManager} 
        />
      )}
      
      {showAISettings && (
        <AISettings
          open={showAISettings}
          onOpenChange={setShowAISettings}
        />
      )}
    </div>
  );
};

export default SearchBar;
