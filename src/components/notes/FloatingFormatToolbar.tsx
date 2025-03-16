import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Code, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingFormatToolbarProps {
  onFormat: (type: string, selection: string) => void;
}

export const FloatingFormatToolbar: React.FC<FloatingFormatToolbarProps> = ({ onFormat }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Ensure the toolbar stays within viewport bounds
        const viewportWidth = window.innerWidth;
        const toolbarWidth = 200; // Approximate width of the toolbar
        
        let left = rect.left + (rect.width / 2);
        // Adjust if too close to edges
        if (left - toolbarWidth/2 < 20) left = toolbarWidth/2 + 20;
        if (left + toolbarWidth/2 > viewportWidth - 20) left = viewportWidth - toolbarWidth/2 - 20;
        
        setPosition({
          top: Math.max(rect.top - 50 + window.scrollY, 70), // Ensure it doesn't go above the top bar
          left
        });
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const handleFormat = (type: string) => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      setActiveButton(type);
      onFormat(type, selection.toString());
      // Reset active button after animation
      setTimeout(() => setActiveButton(null), 500);
    }
  };

  const formatButton = (type: string, icon: React.ReactNode, title: string) => (
    <Button
      variant="ghost"
      size="icon"
      className={`h-8 w-8 rounded-md transition-all duration-200 hover:scale-110 ${
        activeButton === type ? 'bg-primary text-primary-foreground' : ''
      }`}
      onClick={() => handleFormat(type)}
      title={title}
    >
      {icon}
    </Button>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed z-50 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-1.5 flex gap-1"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="flex items-center gap-1 px-1 rounded-md bg-muted/50">
            {formatButton('bold', <Bold className="h-4 w-4" />, 'Bold (⌘B)')}
            {formatButton('italic', <Italic className="h-4 w-4" />, 'Italic (⌘I)')}
          </div>

          <div className="w-px h-8 bg-border/50" />

          <div className="flex items-center gap-1 px-1 rounded-md bg-muted/50">
            {formatButton('h1', <Heading1 className="h-4 w-4" />, 'Heading 1 (⌘1)')}
            {formatButton('h2', <Heading2 className="h-4 w-4" />, 'Heading 2 (⌘2)')}
          </div>

          <div className="w-px h-8 bg-border/50" />

          <div className="flex items-center gap-1 px-1 rounded-md bg-muted/50">
            {formatButton('ul', <List className="h-4 w-4" />, 'Bullet List (⌘⇧8)')}
            {formatButton('ol', <ListOrdered className="h-4 w-4" />, 'Numbered List (⌘⇧7)')}
          </div>

          <div className="w-px h-8 bg-border/50" />

          <div className="flex items-center gap-1 px-1 rounded-md bg-muted/50">
            {formatButton('quote', <Quote className="h-4 w-4" />, 'Quote (⌘⇧9)')}
            {formatButton('code', <Code className="h-4 w-4" />, 'Code (⌘E)')}
            {formatButton('link', <LinkIcon className="h-4 w-4" />, 'Link (⌘K)')}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 