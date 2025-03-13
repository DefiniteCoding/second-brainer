
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { useNotes } from '@/contexts/NotesContext';
import { useToast } from '@/components/ui/use-toast';

interface QuickCaptureButtonProps {
  onCaptureClick: () => void;
}

const QuickCaptureButton: React.FC<QuickCaptureButtonProps> = ({ onCaptureClick }) => {
  return (
    <Button
      onClick={onCaptureClick}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-200 animate-fade-in"
      size="icon"
      aria-label="Capture new note"
    >
      <PlusIcon className="h-6 w-6" />
    </Button>
  );
};

export default QuickCaptureButton;
