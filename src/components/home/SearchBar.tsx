import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Settings, Network, Tags, Upload, Sparkles, Brain, X } from 'lucide-react';
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
  const [isFocused, setIsFocused] = useState(false);
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
        <div className="flex items-center gap-4 max-w-3xl mx-auto">
          <div className={`relative flex-1 group ${isFocused ? 'ring-2 ring-primary/20 rounded-lg' : ''}`}>
            <motion.div
              initial={false}
              animate={{ scale: isFocused ? 1.02 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative"
            >
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Search notes..."
                className={`pl-10 pr-4 h-11 bg-muted/50 border-muted-foreground/20 rounded-lg transition-all duration-200 ${
                  isFocused ? 'bg-background border-primary/30 shadow-lg shadow-primary/5' : ''
                } placeholder:text-muted-foreground/50`}
              />
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                isFocused ? 'text-primary' : 'text-muted-foreground/50'
              }`} />
              <AnimatePresence>
                {searchTerm && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <Button
            variant={advancedSearchActive ? "default" : "outline"}
            size="icon"
            onClick={() => setAdvancedSearchActive(!advancedSearchActive)}
            className={`rounded-lg h-11 w-11 transition-all duration-200 ${
              advancedSearchActive 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {advancedSearchActive && (
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
      )}

      <div className="flex gap-2">
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
