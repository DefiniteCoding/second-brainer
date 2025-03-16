import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Tags, Sparkles, X, FileText, Image, Link2, Mic, Video } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Note } from '@/contexts/NotesContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hasApiKey, getApiKey } from '@/services/ai';
import { useToast } from '@/components/ui/use-toast';
import { useNotes } from '@/contexts/NotesContext';
import { searchNotes } from '@/services/search';
import { DateRange } from 'react-day-picker';
import { FilterPanel } from './FilterPanel';

interface UnifiedSearchProps {
  onSearchResults: (results: Note[] | null, isSearching: boolean) => void;
}

interface SearchFilters {
  dateRange?: DateRange;
  contentTypes: string[];
  tags: string[];
}

export const UnifiedSearch: React.FC<UnifiedSearchProps> = ({ onSearchResults }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAISearch, setIsAISearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    contentTypes: [],
    tags: []
  });

  const { toast } = useToast();
  const { notes } = useNotes();

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      onSearchResults(null, false);
      return;
    }

    setIsSearching(true);
    onSearchResults(null, true);

    try {
      if (isAISearch) {
        const apiKey = await getApiKey();
        if (!apiKey) {
          toast({
            title: "API Key Required",
            description: "Please set your Gemini API key in AI Settings first.",
            variant: "destructive"
          });
          return;
        }
      }

      const searchFilters = {
        date: filters.dateRange?.from,
        contentTypes: filters.contentTypes,
        tags: filters.tags
      };

      const results = await searchNotes(notes, searchTerm, searchFilters, isAISearch);
      onSearchResults(results, false);
    } catch (error) {
      toast({
        title: "Search Error",
        description: error instanceof Error ? error.message : "Failed to perform search. Please try again.",
        variant: "destructive"
      });
      onSearchResults(null, false);
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, isAISearch, filters, notes, onSearchResults, toast]);

  // Debounced search effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      onSearchResults(null, false);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch();
    }, 600);

    return () => clearTimeout(timer);
  }, [searchTerm, handleSearch]);

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    if (searchTerm.trim()) {
      handleSearch();
    }
  };

  const resetFilters = () => {
    setFilters({
      contentTypes: [],
      tags: []
    });
    if (searchTerm.trim()) {
      handleSearch();
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search notes..."
          className="w-full pl-10 pr-24 h-10 bg-muted/50 border-muted-foreground/20 rounded-lg"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsAISearch(!isAISearch);
              if (searchTerm.trim()) {
                handleSearch();
              }
            }}
            className={`h-7 w-7 rounded-full transition-colors ${
              isAISearch ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'hover:bg-muted/80'
            }`}
            title={isAISearch ? 'Switch to Basic Search' : 'Switch to AI Search'}
          >
            <Sparkles className="h-4 w-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-muted/80"
              >
                <Tags className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[800px] p-0" align="end">
              <FilterPanel
                onChange={handleFilterChange}
                onReset={resetFilters}
              />
            </PopoverContent>
          </Popover>
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground/50 hover:text-foreground rounded-full"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {isAISearch && !searchTerm && (
        <div className="mt-2 rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="font-medium">AI-powered semantic search understands the meaning behind your query.</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground/80">
            Try asking questions like "notes about project planning" or "ideas related to marketing"
          </p>
        </div>
      )}
    </div>
  );
};

// Subcomponents
interface SearchResultsProps {
  results: Note[];
  onNoteSelected: (note: Note) => void;
  isLoading: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onNoteSelected, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {results.map(note => (
        <button
          key={note.id}
          onClick={() => onNoteSelected(note)}
          className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <h3 className="font-medium">{note.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
        </button>
      ))}
    </div>
  );
};

export default UnifiedSearch; 