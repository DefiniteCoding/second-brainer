import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Settings, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import SearchWrapper from '@/components/home/SearchWrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Note } from '@/contexts/NotesContext';
import TagManager from '@/components/TagManager';
import DataExportImport from '@/components/DataExportImport';
import AISettings from '@/components/AISettings';

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
    <div className="relative">
      {advancedSearchActive ? (
        <Card className="animate-fade-in shadow-md">
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
              className="pl-10 bg-background border-muted focus-visible:ring-2 focus-visible:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-10 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-950"
              onClick={() => setAdvancedSearchActive(true)}
              title="Advanced Search"
            >
              <Search className="h-4 w-4 text-indigo-500" /> 
              <span className="hidden sm:inline">Advanced</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 h-10 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-950"
                  title="Settings"
                >
                  <Settings className="h-4 w-4 text-slate-600" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <div className="w-full">
                    <AISettings />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <div className="w-full">
                    <TagManager />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <div className="w-full">
                    <DataExportImport />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-10 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-950"
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
