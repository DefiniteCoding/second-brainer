
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Sparkles, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TagManager from '@/components/TagManager';
import AISettings from '@/components/AISettings';
import DataExportImport from '@/components/DataExportImport';
import SearchWrapper from '@/components/home/SearchWrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Note } from '@/contexts/NotesContext';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  advancedSearchActive: boolean;
  setAdvancedSearchActive: (value: boolean) => void;
  onNoteSelected: (note: Note) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  advancedSearchActive, 
  setAdvancedSearchActive,
  onNoteSelected
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative mb-6">
      {advancedSearchActive ? (
        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Advanced Search</h3>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setAdvancedSearchActive(false)}
              >
                <span className="sr-only">Close</span>
                &times;
              </Button>
            </div>
            <SearchWrapper onNoteSelected={onNoteSelected} />
          </CardContent>
        </Card>
      ) : (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search your notes..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setAdvancedSearchActive(true)}
              title="Advanced Search"
            >
              <Sparkles className="h-4 w-4 text-amber-500" /> 
              <span className="hidden sm:inline">Advanced</span>
            </Button>
            <TagManager />
            <AISettings />
            <DataExportImport />
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => navigate('/graph')}
              title="Knowledge Graph"
            >
              <Network className="h-4 w-4 text-indigo-500" /> 
              <span className="hidden sm:inline">Graph</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
