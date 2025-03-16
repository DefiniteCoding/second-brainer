import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Network, Settings, Upload, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Note } from '@/contexts/NotesContext';
import TagManager from '@/components/TagManager';
import DataExportImport from '@/components/DataExportImport';
import AISettings from '@/components/AISettings';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import { UnifiedSearch } from './UnifiedSearch';

interface SearchBarProps {
  onNoteSelected: (note: Note) => void;
  onAddNote: () => void;
  onSearchResults: (results: Note[] | null, isSearching: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onNoteSelected, onAddNote, onSearchResults }) => {
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

          <div className="flex-1 max-w-2xl">
            <UnifiedSearch onSearchResults={onSearchResults} />
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
                  <Brain className="h-4 w-4 mr-2" />
                  AI Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setShowTagManager(true);
                  setDropdownOpen(false);
                }}>
                  <Settings className="h-4 w-4 mr-2" />
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
