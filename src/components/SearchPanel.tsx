
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
  Sparkles
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SearchPanelProps {
  onNoteSelected: (note: Note) => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ onNoteSelected }) => {
  const { searchNotes, parseNaturalLanguageQuery, tags } = useNotes();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isNaturalLanguage, setIsNaturalLanguage] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  
  // Advanced filters
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<('text' | 'image' | 'link' | 'audio' | 'video')[]>([]);
  
  // Handle search and filter changes
  useEffect(() => {
    if (!searchQuery && !showFilters) {
      setSearchResults([]);
      return;
    }
    
    let filters: SearchFilter = {};
    
    if (isNaturalLanguage) {
      // Use the natural language parser
      filters = parseNaturalLanguageQuery(searchQuery);
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
  }, [searchQuery, isNaturalLanguage, dateRange, selectedTags, selectedTypes, showFilters, searchNotes, parseNaturalLanguageQuery]);
  
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
      case 'text': return <FileText className="h-4 w-4" />;
      case 'image': return <FileImage className="h-4 w-4" />;
      case 'link': return <Link className="h-4 w-4" />;
      case 'audio': return <Mic className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={isNaturalLanguage ? "Ask a question (e.g., 'notes from last week about design')" : "Search your notes..."}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setIsNaturalLanguage(!isNaturalLanguage)}
          className={isNaturalLanguage ? "bg-primary text-primary-foreground" : ""}
          title={isNaturalLanguage ? "Natural language search" : "Regular search"}
        >
          <Sparkles className="h-4 w-4" />
        </Button>
        
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              className={showFilters ? "bg-primary text-primary-foreground" : ""}
            >
              <Tag className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Advanced Filters</h3>
              
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
          </PopoverContent>
        </Popover>
      </div>
      
      {searchResults.length > 0 && (
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {searchResults.map(note => (
              <Card 
                key={note.id}
                className="cursor-pointer hover:bg-note-hover"
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
      
      {searchQuery && searchResults.length === 0 && (
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
