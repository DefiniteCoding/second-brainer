import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Note, useNotes } from '@/contexts/NotesContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import SearchBar from '@/components/home/SearchBar';
import NotesTabs from '@/components/home/NotesTabs';
import NoteDetailView from '@/components/home/NoteDetailView';

const Index = () => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [advancedSearchActive, setAdvancedSearchActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { notes, deleteNote, getNoteById, getRecentlyViewedNotes, addToRecentViews } = useNotes();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle URL parameters for direct note access
  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams(location.search);
    const noteId = params.get('noteId');
    
    if (noteId) {
      const note = getNoteById(noteId);
      if (note) {
        setSelectedNote(note);
        addToRecentViews(noteId);
      } else {
        toast({
          title: "Note not found",
          description: `Could not find a note with ID: ${noteId}`,
          variant: "destructive"
        });
        navigate('/', { replace: true });
      }
    }
    setIsLoading(false);
  }, [location.search, getNoteById, addToRecentViews, navigate, toast]);

  // Filter notes based on search term
  const filteredNotes = searchTerm
    ? notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : notes;

  const recentlyViewedNotes = getRecentlyViewedNotes();

  const handleDeleteNote = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete);
      if (selectedNote && selectedNote.id === noteToDelete) {
        setSelectedNote(null);
        navigate('/', { replace: true });
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

  const handleAddNote = () => {
    setSelectedNote(null);
    navigate('/', { replace: true });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <SearchBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        advancedSearchActive={advancedSearchActive}
        setAdvancedSearchActive={setAdvancedSearchActive}
        onNoteSelected={handleNoteSelected}
        onAddNote={handleAddNote}
      />

      <div className="flex-1 flex overflow-hidden relative pt-[3.5rem]">
        <ResizablePanelGroup 
          direction="horizontal" 
          className="h-full w-full"
        >
          <ResizablePanel 
            defaultSize={30} 
            minSize={25} 
            maxSize={45}
            className="min-w-[350px]"
          >
            <div className="h-full overflow-hidden">
              <NotesTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                filteredNotes={filteredNotes}
                recentlyViewedNotes={recentlyViewedNotes}
                selectedNoteId={selectedNote?.id}
                onNoteClick={handleNoteSelected}
                isLoading={isLoading}
                onAddNote={handleAddNote}
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle className="w-1.5 bg-muted/80 hover:bg-muted transition-colors" />
          
          <ResizablePanel 
            defaultSize={70} 
            minSize={30}
          >
            <div className="h-full overflow-hidden">
              <NoteDetailView
                selectedNote={selectedNote}
                isLoading={isLoading}
                onBack={handleBackFromNote}
                onDelete={handleOpenDeleteDialog}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

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
            <AlertDialogAction 
              onClick={handleDeleteNote}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
