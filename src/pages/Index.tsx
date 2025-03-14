import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuickCaptureButton from '@/components/QuickCaptureButton';
import CaptureDialog from '@/components/CaptureDialog';
import NotesList from '@/components/NotesList';
import Collections from '@/components/Collections';
import TagManager from '@/components/TagManager';
import DataExportImport from '@/components/DataExportImport';
import NoteView from '@/components/NoteView';
import SearchPanel from '@/components/SearchPanel';
import { Note, useNotes } from '@/contexts/NotesContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Brain, Search, Network, Tag, ListFilter, Clock, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const [captureDialogOpen, setCaptureDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [advancedSearchActive, setAdvancedSearchActive] = useState(false);

  const { notes, deleteNote, getNoteById, getRecentlyViewedNotes, addToRecentViews } = useNotes();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const noteId = params.get('noteId');
    
    if (noteId) {
      const note = getNoteById(noteId);
      if (note) {
        setSelectedNote(note);
        addToRecentViews(noteId);
      }
    }
  }, [location.search, getNoteById, addToRecentViews]);

  const filteredNotes = searchTerm
    ? notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : notes;

  const handleDeleteNote = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete);
      if (selectedNote && selectedNote.id === noteToDelete) {
        setSelectedNote(null);
      }
      toast({
        title: "Note deleted",
        description: "Your note has been permanently deleted.",
      });
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  const handleOpenDeleteDialog = (noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteDialogOpen(true);
  };

  const handleNoteSelected = (note: Note) => {
    setSelectedNote(note);
    addToRecentViews(note.id);
    navigate(`/?noteId=${note.id}`, { replace: true });
  };

  const handleBackFromNote = () => {
    setSelectedNote(null);
    navigate('/', { replace: true });
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCaptureDialogOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const recentlyViewedNotes = getRecentlyViewedNotes();

  return (
    <>
      <div className="mb-8 flex flex-col items-center justify-center text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Second Brain</h1>
        </div>
        <p className="text-muted-foreground max-w-lg">
          Capture your thoughts, ideas, and inspiration in one place with minimal friction.
        </p>
      </div>

      <div className="relative mb-6">
        {advancedSearchActive ? (
          <Card>
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
              <SearchPanel onNoteSelected={handleNoteSelected} />
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search your notes..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setAdvancedSearchActive(true)}
                title="Advanced Search"
              >
                <Sparkles className="h-4 w-4" /> 
                <span className="hidden sm:inline">Advanced</span>
              </Button>
              <TagManager />
              <DataExportImport />
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => navigate('/graph')}
                title="Knowledge Graph"
              >
                <Network className="h-4 w-4" /> 
                <span className="hidden sm:inline">Graph</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedNote ? (
        <NoteView 
          note={selectedNote}
          onBack={handleBackFromNote}
          onEdit={(note) => {
            setIsEditingNote(true);
            setCaptureDialogOpen(true);
          }}
          onDelete={handleOpenDeleteDialog}
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <ListFilter className="h-4 w-4" />
              <span>All Notes</span>
            </TabsTrigger>
            <TabsTrigger value="collections" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>Collections</span>
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Recent</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <NotesList notes={filteredNotes} onNoteClick={handleNoteSelected} />
          </TabsContent>
          
          <TabsContent value="collections" className="mt-0">
            <Collections onNoteClick={handleNoteSelected} />
          </TabsContent>
          
          <TabsContent value="recent" className="mt-0">
            {recentlyViewedNotes.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Recently Viewed</h3>
                <NotesList notes={recentlyViewedNotes} onNoteClick={handleNoteSelected} />
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>No recently viewed notes</p>
                <p className="text-sm mt-2">View some notes to see them here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <QuickCaptureButton onCaptureClick={() => setCaptureDialogOpen(true)} />
      
      <CaptureDialog
        open={captureDialogOpen}
        onOpenChange={setCaptureDialogOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the note and remove it from your collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Index;
