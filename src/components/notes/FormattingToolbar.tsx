
import React from 'react';
import { Bold, Italic, Highlighter, Heading, Quote, Code, Link, List, ListOrdered } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormattingToolbarProps {
  onBoldClick: () => void;
  onItalicClick: () => void;
  onHighlightClick?: () => void;
  onHeadingClick?: () => void;
  onQuoteClick?: () => void;
  onCodeClick?: () => void;
  onLinkClick?: () => void;
  onBulletListClick?: () => void;
  onNumberedListClick?: () => void;
  onFormat?: (type: string) => void;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  onBoldClick,
  onItalicClick,
  onHighlightClick,
  onHeadingClick,
  onQuoteClick,
  onCodeClick,
  onLinkClick,
  onBulletListClick,
  onNumberedListClick,
  onFormat
}) => {
  // If onFormat is provided, use it instead of individual handlers
  const handleClick = (type: string, handler?: () => void) => {
    if (onFormat) {
      return () => onFormat(type);
    }
    return handler;
  };

  return (
    <div className="flex flex-wrap gap-1 p-1 bg-background rounded-md shadow-sm border">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-md hover:bg-muted transition-colors"
        onClick={handleClick('bold', onBoldClick)}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-md hover:bg-muted transition-colors"
        onClick={handleClick('italic', onItalicClick)}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      
      {onHighlightClick && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-md hover:bg-muted transition-colors"
          onClick={handleClick('highlight', onHighlightClick)}
          title="Highlight"
        >
          <Highlighter className="h-4 w-4" />
        </Button>
      )}
      
      <div className="w-px h-6 bg-border self-center mx-1" />
      
      {onHeadingClick && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-md hover:bg-muted transition-colors"
          onClick={handleClick('h1', onHeadingClick)}
          title="Heading"
        >
          <Heading className="h-4 w-4" />
        </Button>
      )}
      
      {onQuoteClick && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-md hover:bg-muted transition-colors"
          onClick={handleClick('quote', onQuoteClick)}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
      )}
      
      {onBulletListClick && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-md hover:bg-muted transition-colors"
          onClick={handleClick('ul', onBulletListClick)}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
      )}
      
      {onNumberedListClick && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-md hover:bg-muted transition-colors"
          onClick={handleClick('ol', onNumberedListClick)}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      )}
      
      <div className="w-px h-6 bg-border self-center mx-1" />
      
      {onCodeClick && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-md hover:bg-muted transition-colors"
          onClick={handleClick('code', onCodeClick)}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </Button>
      )}
      
      {onLinkClick && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-md hover:bg-muted transition-colors"
          onClick={handleClick('link', onLinkClick)}
          title="Link"
        >
          <Link className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

// Also export as default for backward compatibility
export default FormattingToolbar;
