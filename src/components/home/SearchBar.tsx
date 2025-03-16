import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Settings, Network, Tags, Upload, Sparkles, Brain } from 'lucide-react';
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
  const [showAISettings, setShowAISettings] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [showDataManager, setShowDataManager] = useState(false);

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 border-b">
      <div className="relative px-4">
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-500" />
              <span className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                SecondBrainer
              </span>
            </div>
            <div className="flex flex-1 items-center gap-2">
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
                    <DropdownMenuItem onClick={() => setShowAISettings(true)}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowTagManager(true)}>
                      <Tags className="h-4 w-4 mr-2" />
                      Tag Manager
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowDataManager(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Import/Export
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
          </div>
        )}

        {showAISettings && (
          <AISettings open={showAISettings} onOpenChange={setShowAISettings} />
        )}
        
        {showTagManager && (
          <TagManager open={showTagManager} onOpenChange={setShowTagManager} />
        )}
        
        {showDataManager && (
          <DataExportImport open={showDataManager} onOpenChange={setShowDataManager} />
        )}
      </div>
    </div>
  );
};

export default SearchBar;
