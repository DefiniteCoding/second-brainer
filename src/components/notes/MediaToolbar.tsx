
import React from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, LinkIcon, Mic, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface MediaToolbarProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
  isUploading: boolean;
  onLinkClick: () => void;
  onToggleRecording: () => void;
  isRecording: boolean;
}

const MediaToolbar: React.FC<MediaToolbarProps> = ({
  fileInputRef,
  isUploading,
  onLinkClick,
  onToggleRecording,
  isRecording
}) => {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="flex gap-2 sticky bottom-0 bg-background/80 backdrop-blur-sm p-2 rounded-lg border shadow-lg"
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        className="rounded-full hover:scale-105 transition-transform"
        title="Add Image"
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onLinkClick}
        className="rounded-full hover:scale-105 transition-transform"
        title="Add Link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleRecording}
        className={`rounded-full hover:scale-105 transition-transform ${
          isRecording ? 'bg-red-50 text-red-500 animate-pulse border-red-200' : ''
        }`}
        title="Record Voice"
      >
        <Mic className="h-4 w-4" />
      </Button>
    </motion.div>
  );
};

export default MediaToolbar;
