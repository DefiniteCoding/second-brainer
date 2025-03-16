import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Heading1, Quote, Code, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingFormatToolbarProps {
  onFormat: (type: string) => void;
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
        
        if (rect.width === 0) return; // Don't show toolbar for empty selections
        
        // Ensure the toolbar stays within viewport bounds
        const viewportWidth = window.innerWidth;
        const toolbarWidth = 320; // Adjusted width of the toolbar
        
        let left = rect.left + (rect.width / 2);
        // Adjust if too close to edges
        if (left - toolbarWidth/2 < 20) left = toolbarWidth/2 + 20;
        if (left + toolbarWidth/2 > viewportWidth - 20) left = viewportWidth - toolbarWidth/2 - 20;
        
        setPosition({
          top: rect.top - 10 + window.scrollY,
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

  const handleFormatClick = (type: string) => {
    setActiveButton(type);
    onFormat(type);
    setTimeout(() => setActiveButton(null), 200);
  };

  const formatButton = (type: string, icon: React.ReactNode, title: string) => (
    <Button
      variant="ghost"
      size="icon"
      className={`h-8 w-8 rounded-md transition-all duration-200 hover:scale-110 ${
        activeButton === type ? 'bg-primary text-primary-foreground' : ''
      }`}
      onClick={() => handleFormatClick(type)}
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
          transition={{ duration: 0.1 }}
          className="fixed z-50 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-1.5 flex gap-1"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="flex items-center gap-1 px-1 rounded-md bg-muted/50">
            {formatButton('bold', <Bold className="h-4 w-4" />, 'Bold')}
            {formatButton('italic', <Italic className="h-4 w-4" />, 'Italic')}
          </div>

          <div className="w-px h-8 bg-border/50" />

          <div className="flex items-center gap-1 px-1 rounded-md bg-muted/50">
            {formatButton('heading', <Heading1 className="h-4 w-4" />, 'Heading')}
            {formatButton('quote', <Quote className="h-4 w-4" />, 'Quote')}
          </div>

          <div className="w-px h-8 bg-border/50" />

          <div className="flex items-center gap-1 px-1 rounded-md bg-muted/50">
            {formatButton('code', <Code className="h-4 w-4" />, 'Code')}
            {formatButton('link', <LinkIcon className="h-4 w-4" />, 'Link')}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 