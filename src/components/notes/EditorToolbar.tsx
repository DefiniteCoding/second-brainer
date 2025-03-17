
import React from 'react';
import { ChevronLeft, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EditorToolbarProps {
  title: string;
  setTitle: (title: string) => void;
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  isUpdateMode: boolean;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  title,
  setTitle,
  onBack,
  onSave,
  isSaving,
  isUpdateMode
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full hover:bg-muted/80 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title (optional)..."
          className="text-xl font-medium bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-[300px] placeholder:text-muted-foreground/50"
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full hover:bg-red-50 text-red-500 transition-colors"
        >
          <X className="h-4 w-4" />
        </Button>
        <Button
          onClick={onSave}
          className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:scale-105 transition-transform"
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          {isUpdateMode ? 'Update' : 'Save'}
        </Button>
      </div>
    </div>
  );
};

export default EditorToolbar;
