import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Note, useNotes } from '@/contexts/NotesContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import SearchBar from '@/components/home/SearchBar';
import NotesTabs from '@/components/home/NotesTabs';
import NoteDetailView from '@/components/home/NoteDetailView';
import { useAppState } from '@/hooks/useAppState';
import { Book } from 'lucide-react';

const Index = () => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [advancedSearchActive, setAdvancedSearchActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchResults, setSearchResults] = useState<Note[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const { notes, deleteNote, getNoteById, getRecentlyViewedNotes, addToRecentViews } = useNotes();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { saveState, loadState } = useAppState();

  // Load initial state from cookies
  useEffect(() => {
    const savedState = loadState();
    if (savedState) {
      if (savedState.view === 'landing') {
        setSelectedNote(null);
        setIsEditing(false);
        setIsCreating(false);
      } else if (savedState.noteId) {
        const note = getNoteById(savedState.noteId);
        if (note) {
          setSelectedNote(note);
          setIsEditing(savedState.view === 'editing');
          setIsCreating(false);
          addToRecentViews(savedState.noteId);
        }
      } else if (savedState.view === 'creating') {
        setSelectedNote(null);
        setIsEditing(false);
        setIsCreating(true);
      }
    }
    setIsLoading(false);
  }, []);

  // Save state changes to cookies
  useEffect(() => {
    let currentState = {
      view: 'landing' as const,
      noteId: null as string | null,
    };

    if (isCreating) {
      currentState.view = 'creating';
    } else if (selectedNote) {
      currentState.view = isEditing ? 'editing' : 'viewing';
      currentState.noteId = selectedNote.id;
    }

    saveState(currentState);
  }, [selectedNote, isEditing, isCreating]);

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
    setIsEditing(false);
    setIsCreating(false);
    addToRecentViews(note.id);
    navigate(`/?noteId=${note.id}`, { replace: true });
  };

  const handleBackFromNote = () => {
    setSelectedNote(null);
    setIsEditing(false);
    setIsCreating(false);
    navigate('/', { replace: true });
  };

  const handleAddNote = () => {
    setSelectedNote(null);
    setIsEditing(false);
    setIsCreating(true);
    navigate('/', { replace: true });
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleSearchResults = (results: Note[] | null, searching: boolean) => {
    setSearchResults(results);
    setIsSearching(searching);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <SearchBar 
        onNoteSelected={handleNoteSelected}
        onAddNote={handleAddNote}
        onSearchResults={handleSearchResults}
      />

      <div className="flex-1 flex overflow-hidden relative">
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
                filteredNotes={searchResults || filteredNotes}
                recentlyViewedNotes={recentlyViewedNotes}
                selectedNoteId={selectedNote?.id}
                onNoteClick={handleNoteSelected}
                isLoading={isLoading || isSearching}
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
              {!selectedNote && !isCreating ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <Book className="h-16 w-16 text-primary/20 mb-4" />
                  <h2 className="text-2xl font-semibold text-muted-foreground mb-4">
                    Start writing a new note
                  </h2>
                  <button
                    onClick={handleAddNote}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    Quick Note
                  </button>
                </div>
              ) : (
                <NoteDetailView
                  selectedNote={selectedNote}
                  isLoading={isLoading}
                  onBack={handleBackFromNote}
                  onDelete={handleOpenDeleteDialog}
                  isEditing={isEditing}
                  onEdit={handleEditNote}
                  isCreating={isCreating}
                />
              )}
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
