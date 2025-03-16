import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CaptureDialog from '@/components/CaptureDialog';
import { Note, useNotes } from '@/contexts/NotesContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import HeaderSection from '@/components/home/HeaderSection';
import SearchBar from '@/components/home/SearchBar';
import NotesTabs from '@/components/home/NotesTabs';
import NoteDetailView from '@/components/home/NoteDetailView';

const Index = () => {
  const [captureDialogOpen, setCaptureDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);
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
        // Handle case when note is not found
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

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Quick capture shortcut
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openCaptureDialog();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Filter notes based on search term
  const filteredNotes = searchTerm
    ? notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : notes;

  const recentlyViewedNotes = getRecentlyViewedNotes();

  // Centralized dialog opening logic with proper state management
  const openCaptureDialog = (noteToEdit?: Note) => {
    if (noteToEdit) {
      setNoteToEdit(noteToEdit);
    } else {
      setNoteToEdit(null);
    }
    setCaptureDialogOpen(true);
  };

  const handleCaptureDialogClose = () => {
    setNoteToEdit(null);
    setCaptureDialogOpen(false);
  };

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

  return (
    <div className="animate-fade-in container mx-auto max-w-7xl h-screen flex flex-col">
      <div className="px-4 py-2 border-b bg-background">
        <HeaderSection />
      </div>

      <div className="px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SearchBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          advancedSearchActive={advancedSearchActive}
          setAdvancedSearchActive={setAdvancedSearchActive}
          onNoteSelected={handleNoteSelected}
        />
      </div>

      <ResizablePanelGroup 
        direction="horizontal" 
        className="flex-1 min-h-0 rounded-lg border my-4"
      >
        <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
          <div className="h-full">
            <NotesTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              filteredNotes={filteredNotes}
              recentlyViewedNotes={recentlyViewedNotes}
              selectedNoteId={selectedNote?.id}
              onNoteClick={handleNoteSelected}
              isLoading={isLoading}
              onAddNote={() => openCaptureDialog()}
            />
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle className="w-1.5 bg-muted/80 hover:bg-muted transition-colors" />
        
        <ResizablePanel defaultSize={75} minSize={30}>
          <div className="h-full">
            <NoteDetailView
              selectedNote={selectedNote}
              isLoading={isLoading}
              onBack={handleBackFromNote}
              onEdit={() => selectedNote && openCaptureDialog(selectedNote)}
              onDelete={handleOpenDeleteDialog}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <CaptureDialog
        open={captureDialogOpen}
        onOpenChange={handleCaptureDialogClose}
        noteToEdit={noteToEdit}
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
