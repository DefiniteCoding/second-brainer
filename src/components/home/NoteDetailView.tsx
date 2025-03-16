
import React from 'react';
import NoteView from '@/components/NoteView';
import { Note } from '@/contexts/NotesContext';
import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface NoteDetailViewProps {
  selectedNote: Note | null;
  isLoading: boolean;
  onBack: () => void;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

const NoteDetailView: React.FC<NoteDetailViewProps> = ({
  selectedNote,
  isLoading,
  onBack,
  onEdit,
  onDelete
}) => {
  if (isLoading) {
    return (
      <Card className="h-full border-none">
        <CardContent className="flex items-center justify-center h-full p-6">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-32 bg-muted rounded mb-4"></div>
            <div className="h-4 w-48 bg-muted rounded mb-2"></div>
            <div className="h-4 w-32 bg-muted rounded mb-4"></div>
            <div className="h-32 w-full max-w-md bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  } 
  
  if (selectedNote) {
    return (
      <NoteView 
        note={selectedNote}
        onBack={onBack}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  }

  return (
    <Card className="h-full border-none flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-background to-muted/20">
      <div className="p-6 rounded-full bg-muted/30 mb-6">
        <BookOpen className="h-16 w-16 text-indigo-400 opacity-70" />
      </div>
      <h2 className="text-xl font-medium mb-3 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Select a note to view</h2>
      <p className="max-w-md text-muted-foreground">
        Click on a note from the list on the left to view its contents, or create a new note using the button in the bottom right.
      </p>
    </Card>
  );
};

export default NoteDetailView;
