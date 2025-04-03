
import React, { useState } from 'react';
import { Note, useNotes } from '@/contexts/NotesContext';
import { motion } from 'framer-motion';
import { slideInRight } from '@/lib/animations';
import ViewHeader from './notes/ViewHeader';
import ViewContent from './notes/ViewContent';

interface NoteViewProps {
  note: Note;
  onBack: () => void;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

const NoteView: React.FC<NoteViewProps> = ({
  note,
  onBack,
  onEdit,
  onDelete
}) => {
  const { findBacklinks } = useNotes();
  const [showAIEnhance, setShowAIEnhance] = useState(false);
  const backlinks = findBacklinks(note.id);

  return (
    <motion.div
      variants={slideInRight}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex h-full flex-col overflow-hidden bg-background"
    >
      <ViewHeader 
        title={note.title || "Untitled Note"}
        onBack={onBack}
        onEdit={() => onEdit(note)}
        onDelete={() => onDelete(note.id)}
        showAIEnhance={showAIEnhance}
        setShowAIEnhance={setShowAIEnhance}
      />
      
      <ViewContent 
        note={note}
        backlinks={backlinks}
        showAIEnhance={showAIEnhance}
      />
    </motion.div>
  );
};

export default NoteView;
