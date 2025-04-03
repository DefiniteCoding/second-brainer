
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Save } from 'lucide-react';

interface EditorHeaderProps {
  title: string;
  setTitle: (title: string) => void;
  onBack: () => void;
  handleSave: () => void;
  isSaving: boolean;
  isCreating: boolean;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  title,
  setTitle,
  onBack,
  handleSave,
  isSaving,
  isCreating
}) => {
  return (
    <div className="p-4 border-b flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-medium">
          {isCreating ? "Create Note" : "Edit Note"}
        </h1>
      </div>
      
      <Button onClick={handleSave} disabled={isSaving} className="gap-1.5">
        {isSaving ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save
          </>
        )}
      </Button>
    </div>
  );
};

export default EditorHeader;
