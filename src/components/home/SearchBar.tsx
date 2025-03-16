import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Settings, Network, Tags, Upload, Sparkles, Brain, X, Plus } from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideUp } from '@/lib/animations';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  advancedSearchActive: boolean;
  setAdvancedSearchActive: (value: boolean) => void;
  onNoteSelected: (note: Note) => void;
  onAddNote: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  advancedSearchActive, 
  setAdvancedSearchActive,
  onNoteSelected,
  onAddNote
}) => {
  const navigate = useNavigate();
  const [showAISettings, setShowAISettings] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [showDataManager, setShowDataManager] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleModalClose = (setter: (open: boolean) => void) => {
    setter(false);
    setDropdownOpen(false);
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className={`sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b ${
        isScrolled ? 'shadow-md' : ''
      } transition-all duration-200`}
    >
      <div className="container mx-auto py-3 px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Second Brainer
            </h1>
          </div>

          <div className="flex-1 max-w-2xl mx-4">
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
                  onClick={() => setAdvancedSearchActive(!advancedSearchActive)}
                  className={`h-7 w-7 rounded-full transition-colors ${
                    advancedSearchActive ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'hover:bg-muted/80'
                  }`}
                  title={advancedSearchActive ? 'Disable AI Search' : 'Enable AI Search'}
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
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
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={onAddNote}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Note
            </Button>

            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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
              size="sm"
              onClick={() => navigate('/graph')}
              className="flex items-center gap-2"
            >
              <Network className="h-4 w-4 text-indigo-500" />
              Graph
            </Button>
          </div>
        </div>
      </div>

      {advancedSearchActive && (
        <Card className="mx-auto max-w-3xl mt-2 mb-4 animate-in fade-in-50 shadow-lg">
          <CardContent className="pt-4">
            <SearchWrapper onNoteSelected={onNoteSelected} />
          </CardContent>
        </Card>
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
    </motion.div>
  );
};

export default SearchBar;
