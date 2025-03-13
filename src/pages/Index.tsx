
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuickCaptureButton from '@/components/QuickCaptureButton';
import CaptureDialog from '@/components/CaptureDialog';
import NotesList from '@/components/NotesList';
import NoteView from '@/components/NoteView';
import { Note, useNotes } from '@/contexts/NotesContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Brain, Search, Network } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [captureDialogOpen, setCaptureDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { notes, deleteNote, getNoteById } = useNotes();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Load note from URL parameter if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const noteId = params.get('noteId');
    
    if (noteId) {
      const note = getNoteById(noteId);
      if (note) {
        setSelectedNote(note);
      }
    }
  }, [location.search, getNoteById]);

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
    // Update URL with note ID for shareable links
    navigate(`/?noteId=${note.id}`, { replace: true });
  };

  const handleBackFromNote = () => {
    setSelectedNote(null);
    // Remove note ID from URL
    navigate('/', { replace: true });
  };

  // Handle keyboard shortcut for quick capture
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open capture dialog
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

      <div className="relative mb-6 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search your notes..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => navigate('/graph')}
        >
          <Network className="h-4 w-4" /> 
          <span className="hidden sm:inline">Knowledge Graph</span>
        </Button>
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
        <NotesList onNoteClick={handleNoteSelected} />
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
