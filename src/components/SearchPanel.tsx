
import React, { useState, useEffect } from 'react';
import { useNotes, SearchFilter, Note } from '@/contexts/NotesContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Calendar, 
  Tag, 
  FileText, 
  FileImage, 
  Link, 
  Mic, 
  Video,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { hasApiKey, naturalLanguageSearch } from '@/utils/aiService';

interface SearchPanelProps {
  onNoteSelected: (note: Note) => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ onNoteSelected }) => {
  const { searchNotes, parseNaturalLanguageQuery, tags, notes } = useNotes();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'basic' | 'filters' | 'ai'>('basic');
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Advanced filters
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<('text' | 'image' | 'link' | 'audio' | 'video')[]>([]);
  
  const handleSearch = async () => {
    if (!searchQuery && searchMode !== 'filters') {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      if (searchMode === 'ai') {
        if (!hasApiKey()) {
          toast({
            title: "API Key Required",
            description: "Please set your Gemini API key in AI Settings to use semantic search.",
            variant: "destructive"
          });
          setSearchMode('basic');
          return;
        }
        
        const results = await naturalLanguageSearch(searchQuery, notes);
        setSearchResults(results);
      } else {
        let filters: SearchFilter = {};
        
        if (searchMode === 'basic') {
          filters.query = searchQuery;
        } else {
          // Use manual filters
          if (searchQuery) {
            filters.query = searchQuery;
          }
          
          if (dateRange.from) {
            filters.startDate = dateRange.from;
          }
          
          if (dateRange.to) {
            filters.endDate = dateRange.to;
          }
          
          if (selectedTags.length > 0) {
            filters.tagIds = selectedTags;
          }
          
          if (selectedTypes.length > 0) {
            filters.contentTypes = selectedTypes;
          }
        }
        
        const results = searchNotes(filters);
        setSearchResults(results);
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive"
      });
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Perform search when mode changes or on explicit search
  useEffect(() => {
    if (searchMode !== 'filters') {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, searchMode]);
  
  const toggleContentType = (type: 'text' | 'image' | 'link' | 'audio' | 'video') => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };
  
  const resetFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    setSelectedTags([]);
    setSelectedTypes([]);
  };
  
  const getTypeIcon = (type: 'text' | 'image' | 'link' | 'audio' | 'video') => {
    switch (type) {
      case 'text': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'image': return <FileImage className="h-4 w-4 text-green-500" />;
      case 'link': return <Link className="h-4 w-4 text-purple-500" />;
      case 'audio': return <Mic className="h-4 w-4 text-amber-500" />;
      case 'video': return <Video className="h-4 w-4 text-red-500" />;
    }
  };
  
  return (
    <div className="w-full space-y-4">
      <Tabs defaultValue="basic" onValueChange={(value) => setSearchMode(value as 'basic' | 'filters' | 'ai')}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={searchMode === 'ai' ? "Ask a question about your notes..." : "Search your notes..."}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <TabsList className="h-10">
            <TabsTrigger value="basic" className="h-8 px-3">Basic</TabsTrigger>
            <TabsTrigger value="ai" className="h-8 px-3 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI</span>
            </TabsTrigger>
            <TabsTrigger value="filters" className="h-8 px-3 flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              <span>Filters</span>
            </TabsTrigger>
          </TabsList>
          
          {searchMode === 'filters' && (
            <Button 
              variant="default"
              size="sm"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          )}
        </div>
        
        <TabsContent value="basic" className="mt-0"></TabsContent>
        
        <TabsContent value="ai" className="mt-2">
          <div className="bg-primary/5 rounded-md p-3 text-sm">
            <p className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <span>AI-powered semantic search understands the meaning behind your query.</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Try asking questions like "notes about project planning" or "ideas related to marketing"</p>
          </div>
        </TabsContent>
        
        <TabsContent value="filters" className="mt-2">
          <div className="rounded-md border p-4 space-y-4">
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Date Range</h4>
              <div className="flex flex-col gap-2">
                <CalendarComponent
                  mode="range"
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to,
                  }}
                  onSelect={(range) => setDateRange({
                    from: range?.from,
                    to: range?.to
                  })}
                  className="rounded-md border"
                />
                {(dateRange.from || dateRange.to) && (
                  <div className="flex text-xs text-muted-foreground justify-between items-center">
                    <span>
                      {dateRange.from ? format(dateRange.from, 'PP') : 'Any start date'}
                    </span>
                    <span>to</span>
                    <span>
                      {dateRange.to ? format(dateRange.to, 'PP') : 'Any end date'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Content Type</h4>
              <div className="grid grid-cols-5 gap-2">
                {(['text', 'image', 'link', 'audio', 'video'] as const).map(type => (
                  <div 
                    key={type}
                    className={`flex flex-col items-center gap-1 p-2 border rounded-md cursor-pointer ${
                      selectedTypes.includes(type) ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
                    }`}
                    onClick={() => toggleContentType(type)}
                  >
                    {getTypeIcon(type)}
                    <span className="text-xs capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Tags</h4>
              <ScrollArea className="h-24">
                <div className="space-y-2">
                  {tags.map(tag => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`tag-${tag.id}`} 
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={() => toggleTag(tag.id)}
                      />
                      <label 
                        htmlFor={`tag-${tag.id}`}
                        className="text-sm flex items-center gap-2 cursor-pointer"
                      >
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: tag.color }}></div>
                        {tag.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              className="w-full"
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      {isSearching && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {!isSearching && searchResults.length > 0 && (
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {searchResults.map(note => (
              <Card 
                key={note.id}
                className="cursor-pointer hover:bg-note-hover border-l-4"
                style={{ borderLeftColor: note.tags[0]?.color || 'transparent' }}
                onClick={() => onNoteSelected(note)}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{note.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{note.content}</p>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      {format(new Date(note.createdAt), 'PP')}
                    </div>
                  </div>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.map(tag => (
                        <Badge 
                          key={tag.id} 
                          style={{ backgroundColor: tag.color }}
                          className="text-white text-xs px-2 py-0"
                          variant="outline"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
      
      {!isSearching && searchQuery && searchResults.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>No notes match your search</p>
          <p className="text-sm mt-2">Try adjusting your search terms or filters</p>
        </div>
      )}
    </div>
  );
};

export default SearchPanel;
