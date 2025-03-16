import React, { useState, useEffect } from 'react';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleModalClose = (setter: (open: boolean) => void) => {
    setter(false);
    setDropdownOpen(false);
  };

  return (
    <div className={`sticky top-0 z-10 transition-all duration-200
      before:absolute before:inset-0 before:backdrop-blur-[12px] before:bg-background/75 before:z-[-1]
      after:absolute after:inset-0 after:z-[-1] after:opacity-20 after:bg-[url('/noise.svg')] after:bg-repeat
      ${isScrolled ? 'shadow-lg before:bg-background/85' : 'border-b border-slate-200/20'}
    `}>
      <div className="relative w-full px-4 py-2">
        {advancedSearchActive ? (
          <Card className="animate-fade-in shadow-md backdrop-blur-sm bg-background/50">
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
            <div className="hidden sm:flex items-center gap-2 min-w-[140px]">
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
                  className="pl-10 bg-background/40 backdrop-blur-sm border-muted/50 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all hover:bg-background/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 h-10 shadow-sm hover:bg-background/60 dark:hover:bg-background/20 backdrop-blur-sm transition-all border-muted/50"
                  onClick={() => setAdvancedSearchActive(true)}
                  title="Advanced Search"
                >
                  <Search className="h-4 w-4 text-indigo-500" /> 
                  <span className="hidden lg:inline">Advanced</span>
                </Button>
                
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 h-10 shadow-sm hover:bg-background/60 dark:hover:bg-background/20 backdrop-blur-sm transition-all border-muted/50"
                      title="Settings"
                    >
                      <Settings className="h-4 w-4 text-slate-600" />
                      <span className="hidden lg:inline">Settings</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background/80 backdrop-blur-md">
                    <DropdownMenuItem onClick={() => {
                      setShowAISettings(true);
                      setDropdownOpen(false);
                    }}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setShowTagManager(true);
                      setDropdownOpen(false);
                    }}>
                      <Tags className="h-4 w-4 mr-2" />
                      Tag Manager
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setShowDataManager(true);
                      setDropdownOpen(false);
                    }}>
                      <Upload className="h-4 w-4 mr-2" />
                      Import/Export
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 h-10 shadow-sm hover:bg-background/60 dark:hover:bg-background/20 backdrop-blur-sm transition-all border-muted/50"
                  onClick={() => navigate('/graph')}
                  title="Knowledge Graph"
                >
                  <Network className="h-4 w-4 text-indigo-500" /> 
                  <span className="hidden lg:inline">Graph</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {showAISettings && (
          <AISettings 
            open={showAISettings} 
            onOpenChange={(open) => handleModalClose(setShowAISettings)} 
          />
        )}
        
        {showTagManager && (
          <TagManager 
            open={showTagManager} 
            onOpenChange={(open) => handleModalClose(setShowTagManager)} 
          />
        )}
        
        {showDataManager && (
          <DataExportImport 
            open={showDataManager} 
            onOpenChange={(open) => handleModalClose(setShowDataManager)} 
          />
        )}
      </div>
    </div>
  );
};

export default SearchBar;
