import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotesList from '@/components/NotesList';
import Collections from '@/components/Collections';
import { Note } from '@/contexts/NotesContext';
import { FileText, Bookmark, Clock, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { listItemAnimation, staggerContainer } from '@/lib/animations';

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
  const renderNoteList = (notes: Note[]) => (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-2"
    >
      <AnimatePresence mode="popLayout">
        {notes.map((note) => (
          <motion.div
            key={note.id}
            variants={listItemAnimation}
            layout
            layoutId={note.id}
          >
            <Button
              variant="ghost"
              className={`w-full justify-start gap-2 rounded-lg px-4 py-6 text-left transition-all hover:bg-muted/80 ${
                selectedNoteId === note.id
                  ? 'bg-muted shadow-inner'
                  : 'hover:shadow-sm'
              }`}
              onClick={() => onNoteClick(note)}
            >
              <FileText className={`h-4 w-4 shrink-0 ${
                selectedNoteId === note.id ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium">{note.title}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {note.content.substring(0, 50)}...
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="animate-pulse"
          >
            <div className="h-20 rounded-lg bg-muted"></div>
          </motion.div>
        ))}
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
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-muted/50 p-1 h-10 rounded-lg">
            <TabsTrigger
              value="all"
              className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              All Notes
            </TabsTrigger>
            <TabsTrigger
              value="recent"
              className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Recent
            </TabsTrigger>
          </TabsList>

          <Button
            onClick={onAddNote}
            size="icon"
            className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 px-4 pb-4">
        <ScrollArea className="h-full">
          <div className="pr-4">
            <NotesTabsContent {...props} />
          </div>
        </ScrollArea>
      </div>
    </Tabs>
  );
};

export default NotesTabs;
