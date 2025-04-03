
import React from 'react';
import { 
  Bold, 
  Italic, 
  Heading1 as Heading, 
  Strikethrough, 
  Quote, 
  Code, 
  Link, 
  List, 
  ListOrdered,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

interface FormattingToolbarProps {
  onBoldClick?: () => void;
  onItalicClick?: () => void;
  onStrikethroughClick?: () => void;
  onHighlightClick?: () => void;
  onHeadingClick?: (level: 1 | 2 | 3) => void;
  onQuoteClick?: () => void;
  onCodeClick?: () => void;
  onLinkClick?: () => void;
  onBulletListClick?: () => void;
  onNumberedListClick?: () => void;
  onFormat?: (type: string, meta?: any) => void;
  variant?: 'default' | 'floating' | 'minimal';
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  onBoldClick,
  onItalicClick,
  onStrikethroughClick,
  onHighlightClick,
  onHeadingClick,
  onQuoteClick,
  onCodeClick,
  onLinkClick,
  onBulletListClick,
  onNumberedListClick,
  onFormat,
  variant = 'default'
}) => {
  // If onFormat is provided, use it instead of individual handlers
  const handleClick = (type: string, handler?: () => void, meta?: any) => {
    if (onFormat) {
      return () => onFormat(type, meta);
    }
    return handler;
  };

  const handleHeadingClick = (level: 1 | 2 | 3) => {
    if (onFormat) {
      return () => onFormat('heading', level);
    } else if (onHeadingClick) {
      return () => onHeadingClick(level);
    }
    return undefined;
  };

  const renderToolButton = (
    type: string, 
    icon: React.ReactNode, 
    title: string, 
    handler?: () => void,
    meta?: any
  ) => {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-md hover:bg-muted transition-colors"
        onClick={handleClick(type, handler, meta)}
        title={title}
      >
        {icon}
      </Button>
    );
  };

  // Render a compact toolbar for floating variant
  if (variant === 'floating') {
    return (
      <div className="flex gap-1 p-1 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg">
        {renderToolButton('bold', <Bold className="h-4 w-4" />, 'Bold', onBoldClick)}
        {renderToolButton('italic', <Italic className="h-4 w-4" />, 'Italic', onItalicClick)}
        {renderToolButton('strikethrough', <Strikethrough className="h-4 w-4" />, 'Strikethrough', onStrikethroughClick)}
        
        <div className="w-px h-6 bg-border/50 self-center mx-1" />
        
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md hover:bg-muted transition-colors"
              title="Heading"
            >
              <Heading className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1">
            <div className="flex flex-col gap-1">
              <Button 
                variant="ghost" 
                className="h-8 justify-start"
                onClick={handleHeadingClick(1)}
              >
                <Heading1 className="h-4 w-4 mr-2" /> Heading 1
              </Button>
              <Button 
                variant="ghost" 
                className="h-8 justify-start"
                onClick={handleHeadingClick(2)}
              >
                <Heading2 className="h-4 w-4 mr-2" /> Heading 2
              </Button>
              <Button 
                variant="ghost" 
                className="h-8 justify-start"
                onClick={handleHeadingClick(3)}
              >
                <Heading3 className="h-4 w-4 mr-2" /> Heading 3
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        {renderToolButton('quote', <Quote className="h-4 w-4" />, 'Quote', onQuoteClick)}
        {renderToolButton('code', <Code className="h-4 w-4" />, 'Code', onCodeClick)}
      </div>
    );
  }

  // Render a minimal toolbar
  if (variant === 'minimal') {
    return (
      <div className="flex gap-1 p-1 border-b">
        <ToggleGroup type="multiple" className="justify-start">
          {renderToolButton('bold', <Bold className="h-4 w-4" />, 'Bold', onBoldClick)}
          {renderToolButton('italic', <Italic className="h-4 w-4" />, 'Italic', onItalicClick)}
          {renderToolButton('code', <Code className="h-4 w-4" />, 'Code', onCodeClick)}
        </ToggleGroup>
      </div>
    );
  }

  // Default full toolbar
  return (
    <div className="flex flex-wrap gap-1 p-1 bg-background rounded-md shadow-sm border">
      <div className="flex items-center gap-1 px-1 rounded-md bg-muted/50">
        {renderToolButton('bold', <Bold className="h-4 w-4" />, 'Bold', onBoldClick)}
        {renderToolButton('italic', <Italic className="h-4 w-4" />, 'Italic', onItalicClick)}
        {renderToolButton('strikethrough', <Strikethrough className="h-4 w-4" />, 'Strikethrough', onStrikethroughClick)}
        {onHighlightClick && renderToolButton('highlight', <Heading className="h-4 w-4" />, 'Highlight', onHighlightClick)}
      </div>
      
      <div className="w-px h-6 bg-border self-center mx-1" />
      
      <div className="flex items-center gap-1 px-1 rounded-md bg-muted/50">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md hover:bg-muted transition-colors"
              title="Heading"
            >
              <Heading className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1">
            <div className="flex flex-col gap-1">
              <Button 
                variant="ghost" 
                className="h-8 justify-start"
                onClick={handleHeadingClick(1)}
              >
                <Heading1 className="h-4 w-4 mr-2" /> Heading 1
              </Button>
              <Button 
                variant="ghost" 
                className="h-8 justify-start"
                onClick={handleHeadingClick(2)}
              >
                <Heading2 className="h-4 w-4 mr-2" /> Heading 2
              </Button>
              <Button 
                variant="ghost" 
                className="h-8 justify-start"
                onClick={handleHeadingClick(3)}
              >
                <Heading3 className="h-4 w-4 mr-2" /> Heading 3
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        {renderToolButton('quote', <Quote className="h-4 w-4" />, 'Quote', onQuoteClick)}
        {onBulletListClick && renderToolButton('ul', <List className="h-4 w-4" />, 'Bullet List', onBulletListClick)}
        {onNumberedListClick && renderToolButton('ol', <ListOrdered className="h-4 w-4" />, 'Numbered List', onNumberedListClick)}
      </div>
      
      <div className="w-px h-6 bg-border self-center mx-1" />
      
      <div className="flex items-center gap-1 px-1 rounded-md bg-muted/50">
        {renderToolButton('code', <Code className="h-4 w-4" />, 'Code', onCodeClick)}
        {renderToolButton('link', <Link className="h-4 w-4" />, 'Link', onLinkClick)}
      </div>
    </div>
  );
};

// Also export as default for backward compatibility
export default FormattingToolbar;
