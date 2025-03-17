
import React from 'react';
import { Bold, Italic, Highlighter, Heading, Quote, Code, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormattingToolbarProps {
  onBoldClick: () => void;
  onItalicClick: () => void;
  onHighlightClick?: () => void;
  onHeadingClick?: () => void;
  onQuoteClick?: () => void;
  onCodeClick?: () => void;
  onLinkClick?: () => void;
}

const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  onBoldClick,
  onItalicClick,
  onHighlightClick,
  onHeadingClick,
  onQuoteClick,
  onCodeClick,
  onLinkClick
}) => {
  return (
    <div className="flex gap-1 p-1 bg-background rounded-md shadow-sm border">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-md"
        onClick={onBoldClick}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-md"
        onClick={onItalicClick}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      {onHighlightClick && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-md"
          onClick={onHighlightClick}
          title="Highlight"
        >
          <Highlighter className="h-4 w-4" />
        </Button>
      )}
      {onHeadingClick && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-md"
          onClick={onHeadingClick}
          title="Heading"
        >
          <Heading className="h-4 w-4" />
        </Button>
      )}
      {onQuoteClick && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-md"
          onClick={onQuoteClick}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
      )}
      {onCodeClick && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-md"
          onClick={onCodeClick}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </Button>
      )}
      {onLinkClick && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-md"
          onClick={onLinkClick}
          title="Link"
        >
          <Link className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default FormattingToolbar;
