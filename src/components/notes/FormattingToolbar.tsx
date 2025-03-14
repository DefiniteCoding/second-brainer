
import React from 'react';
import { Bold, Italic, Highlighter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormattingToolbarProps {
  onBoldClick: () => void;
  onItalicClick: () => void;
  onHighlightClick: () => void;
}

const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  onBoldClick,
  onItalicClick,
  onHighlightClick
}) => {
  return (
    <div className="flex gap-1">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={onBoldClick}
        title="Bold important points"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={onItalicClick}
        title="Italicize supporting details"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={onHighlightClick}
        title="Highlight key insights"
      >
        <Highlighter className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default FormattingToolbar;
