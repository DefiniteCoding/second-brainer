
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { NetworkIcon, Plus, Cog, Tag, ExternalLink, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import TagManager from '@/components/TagManager';
import AISettings from '@/components/AISettings';
import { useToast } from '@/components/ui/use-toast';
import { useNotes } from '@/contexts/NotesContext';

interface HeaderActionsProps {
  onAddNote: () => void;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({ onAddNote }) => {
  const [showTagManager, setShowTagManager] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const { exportNotes } = useNotes();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleExport = () => {
    try {
      exportNotes();
      toast({
        title: "Export successful",
        description: "Your notes have been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was a problem exporting your notes. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => navigate('/graph')}
          className="gap-1.5"
          title="View Knowledge Graph"
        >
          <NetworkIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Graph</span>
        </Button>
        
        <Button
          variant="default"
          onClick={onAddNote}
          className="gap-1 bg-primary hover:bg-primary/90"
          title="Create new note"
        >
          <Plus className="h-4 w-4" />
          <span>Add Note</span>
        </Button>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-full"
            title="Settings"
          >
            <Cog className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowTagManager(true)}>
            <Tag className="mr-2 h-4 w-4" />
            <span>Manage Tags</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExport}>
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>Export Notes</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowAISettings(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>AI Settings</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {showTagManager && (
        <TagManager 
          open={showTagManager} 
          onOpenChange={setShowTagManager} 
        />
      )}
      
      {showAISettings && (
        <AISettings
          open={showAISettings}
          onOpenChange={setShowAISettings}
        />
      )}
    </>
  );
};

export default HeaderActions;
