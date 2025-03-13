
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

interface QuickCaptureButtonProps {
  onCaptureClick: () => void;
}

const QuickCaptureButton: React.FC<QuickCaptureButtonProps> = ({ onCaptureClick }) => {
  return (
    <Button
      onClick={onCaptureClick}
      className="fixed bottom-6 right-6 shadow-lg bg-primary hover:bg-primary/90 transition-all duration-200 animate-fade-in"
      aria-label="Add new note"
    >
      <PlusIcon className="h-5 w-5 mr-2" />
      Add Note
    </Button>
  );
};

export default QuickCaptureButton;
