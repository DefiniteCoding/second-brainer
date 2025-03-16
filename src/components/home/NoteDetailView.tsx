
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
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading note...</p>
      </div>
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
    <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground">
      <BookOpen className="h-16 w-16 mb-4 text-pink-400 opacity-70" />
      <h2 className="text-xl font-medium mb-2">Select a note to view</h2>
      <p className="max-w-md">Click on a note from the list on the left to view its contents, or create a new note using the button in the bottom right.</p>
    </div>
  );
};

export default NoteDetailView;
