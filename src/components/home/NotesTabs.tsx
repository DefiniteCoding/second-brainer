import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotesList from '@/components/NotesList';
import Collections from '@/components/Collections';
import { Note } from '@/contexts/NotesContext';
import { FileText, Bookmark, Clock, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface NotesTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  filteredNotes: Note[];
  recentlyViewedNotes: Note[];
  selectedNoteId: string | undefined;
  onNoteClick: (note: Note) => void;
  isLoading: boolean;
  onAddNote: () => void;
}

const NotesTabsContent: React.FC<{
  activeTab: string;
  filteredNotes: Note[];
  recentlyViewedNotes: Note[];
  selectedNoteId: string | undefined;
  onNoteClick: (note: Note) => void;
  isLoading: boolean;
}> = ({ activeTab, filteredNotes, recentlyViewedNotes, selectedNoteId, onNoteClick, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-24 bg-muted rounded mb-4"></div>
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'collections') {
    return <Collections onNoteClick={onNoteClick} />;
  } else if (activeTab === 'recent') {
    return recentlyViewedNotes.length > 0 ? (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Recently Viewed</h3>
        <NotesList 
          notes={recentlyViewedNotes} 
          onNoteClick={onNoteClick} 
          selectedNoteId={selectedNoteId}
        />
      </div>
    ) : (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-16 w-16 mx-auto mb-4 opacity-20" />
        <p>No recently viewed notes</p>
        <p className="text-sm mt-2">View some notes to see them here</p>
      </div>
    );
  } else {
    return filteredNotes.length > 0 ? (
      <NotesList 
        notes={filteredNotes} 
        onNoteClick={onNoteClick} 
        selectedNoteId={selectedNoteId} 
      />
    ) : (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
        <p>No notes found</p>
        {activeTab === 'all' && (
          <p className="text-sm mt-2">Try a different search term</p>
        )}
      </div>
    );
  }
};

const NotesTabs: React.FC<NotesTabsProps> = (props) => {
  const { activeTab, setActiveTab, onAddNote } = props;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
      <div className="space-y-4 px-4 pt-4">
        <Button 
          onClick={onAddNote}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Note
        </Button>

        <TabsList className="bg-muted/50 p-1 rounded-lg w-full">
          <TabsTrigger 
            value="all" 
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm transition-all"
          >
            <FileText className="h-4 w-4 text-indigo-500" />
            <span>All Notes</span>
          </TabsTrigger>
          <TabsTrigger 
            value="collections" 
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm transition-all"
          >
            <Bookmark className="h-4 w-4 text-purple-500" />
            <span>Collections</span>
          </TabsTrigger>
          <TabsTrigger 
            value="recent" 
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm transition-all"
          >
            <Clock className="h-4 w-4 text-pink-500" />
            <span>Recent</span>
          </TabsTrigger>
        </TabsList>
      </div>
      
      <div className="flex-1 min-h-0 px-4">
        <ScrollArea className="h-[calc(100vh-340px)]">
          <div className="pr-4">
            <NotesTabsContent {...props} />
          </div>
        </ScrollArea>
      </div>
    </Tabs>
  );
};

export default NotesTabs;
