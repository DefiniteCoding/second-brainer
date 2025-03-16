
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
import AISettings from '@/components/AISettings';
import { Note, useNotes } from '@/contexts/NotesContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Brain, Search, Network, Tag, ListFilter, Clock, Sparkles, BookOpen, Palette, Bookmark, PenTool, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

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

  // Render note list or collections based on active tab
  const renderActiveTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      );
    }

    if (activeTab === 'collections') {
      return <Collections onNoteClick={handleNoteSelected} />;
    } else if (activeTab === 'recent') {
      return recentlyViewedNotes.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Recently Viewed</h3>
          <NotesList 
            notes={recentlyViewedNotes} 
            onNoteClick={handleNoteSelected} 
            selectedNoteId={selectedNote?.id}
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
          onNoteClick={handleNoteSelected} 
          selectedNoteId={selectedNote?.id} 
        />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p>No notes found</p>
          {searchTerm && (
            <p className="text-sm mt-2">Try a different search term</p>
          )}
        </div>
      );
    }
  };

  return (
    <>
      <div className="mb-8 flex flex-col items-center justify-center text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-primary bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1 text-white" />
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Second Brain</h1>
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
                <Sparkles className="h-4 w-4 text-amber-500" /> 
                <span className="hidden sm:inline">Advanced</span>
              </Button>
              <TagManager />
              <AISettings />
              <DataExportImport />
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => navigate('/graph')}
                title="Knowledge Graph"
              >
                <Network className="h-4 w-4 text-indigo-500" /> 
                <span className="hidden sm:inline">Graph</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      <ResizablePanelGroup 
        direction="horizontal" 
        className="min-h-[600px] rounded-lg border"
      >
        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="h-full p-4 bg-card">
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
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={70}>
          <div className="h-full p-4 bg-card">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading note...</p>
              </div>
            ) : selectedNote ? (
              <NoteView 
                note={selectedNote}
                onBack={handleBackFromNote}
                onEdit={() => openCaptureDialog(selectedNote)}
                onDelete={handleOpenDeleteDialog}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground">
                <BookOpen className="h-16 w-16 mb-4 text-pink-400 opacity-70" />
                <h2 className="text-xl font-medium mb-2">Select a note to view</h2>
                <p className="max-w-md">Click on a note from the list on the left to view its contents, or create a new note using the button in the bottom right.</p>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <QuickCaptureButton onCaptureClick={() => openCaptureDialog()} />
      
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
            <AlertDialogAction onClick={handleDeleteNote}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Index;
