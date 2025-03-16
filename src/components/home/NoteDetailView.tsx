import React from 'react';
import NoteView from '@/components/NoteView';
import { Note } from '@/contexts/NotesContext';
import { BookOpen } from 'lucide-react';

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
      <div className="h-full flex items-center justify-center p-6 bg-muted/5">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-32 bg-muted rounded mb-4"></div>
          <div className="h-4 w-48 bg-muted rounded mb-2"></div>
          <div className="h-4 w-32 bg-muted rounded mb-4"></div>
          <div className="h-32 w-full max-w-md bg-muted rounded"></div>
        </div>
      </div>
    );
  } 
  
  if (selectedNote) {
    return (
      <div className="h-full bg-card">
        <div className="h-full bg-muted/5 border-l">
          <NoteView 
            note={selectedNote}
            onBack={onBack}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-muted/5">
      <div className="p-6 rounded-full bg-muted/30 mb-6">
        <BookOpen className="h-16 w-16 text-indigo-400 opacity-70" />
      </div>
      <h2 className="text-xl font-medium mb-3 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Select a note to view</h2>
      <p className="max-w-md text-muted-foreground">
        Select a note from the list to view its contents, or create a new note using the button above the list.
      </p>
    </div>
  );
};

export default NoteDetailView;
