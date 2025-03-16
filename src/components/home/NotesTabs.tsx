
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotesList from '@/components/NotesList';
import Collections from '@/components/Collections';
import { Note } from '@/contexts/NotesContext';
import { FileText, Bookmark, Clock } from 'lucide-react';

interface NotesTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  filteredNotes: Note[];
  recentlyViewedNotes: Note[];
  selectedNoteId: string | undefined;
  onNoteClick: (note: Note) => void;
  isLoading: boolean;
}

const NotesTabs: React.FC<NotesTabsProps> = ({
  activeTab,
  setActiveTab,
  filteredNotes,
  recentlyViewedNotes,
  selectedNoteId,
  onNoteClick,
  isLoading
}) => {
  const renderActiveTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      );
    }

    if (activeTab === 'collections') {
      return <Collections onNoteClick={onNoteClick} />;
    } else if (activeTab === 'recent') {
      return recentlyViewedNotes.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Recently Viewed</h3>
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

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4 bg-muted/50 p-1">
        <TabsTrigger value="all" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
          <FileText className="h-4 w-4 text-blue-500" />
          <span>All Notes</span>
        </TabsTrigger>
        <TabsTrigger value="collections" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
          <Bookmark className="h-4 w-4 text-green-500" />
          <span>Collections</span>
        </TabsTrigger>
        <TabsTrigger value="recent" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
          <Clock className="h-4 w-4 text-amber-500" />
          <span>Recent</span>
        </TabsTrigger>
      </TabsList>
      
      <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
        {renderActiveTabContent()}
      </div>
    </Tabs>
  );
};

export default NotesTabs;
