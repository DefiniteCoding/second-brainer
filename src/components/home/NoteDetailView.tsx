
import React, { useState, useEffect } from 'react';
import { Note, useNotes } from '@/contexts/NotesContext';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import NoteView from '@/components/NoteView';
import NoteEditor from '@/components/NoteEditor';
import { Loader2 } from 'lucide-react';

interface NoteDetailViewProps {
  selectedNote: Note | null;
  isLoading: boolean;
  onBack: () => void;
  onDelete: (noteId: string) => void;
  isEditing: boolean;
  onEdit: (note: Note) => void;
  isCreating: boolean;
}

const NoteDetailView: React.FC<NoteDetailViewProps> = ({
  selectedNote,
  isLoading,
  onBack,
  onDelete,
  isEditing,
  onEdit,
  isCreating
}) => {
  if (isLoading) {
    return (
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="h-full flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </motion.div>
    );
  }

  if (isCreating || isEditing) {
    return (
      <NoteEditor
        note={selectedNote}
        onBack={onBack}
        isCreating={isCreating}
      />
    );
  }

  if (!selectedNote) {
    return null;
  }

  return (
    <NoteView
      note={selectedNote}
      onBack={onBack}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default NoteDetailView;
