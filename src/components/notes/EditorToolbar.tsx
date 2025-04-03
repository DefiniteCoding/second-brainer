
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Image, Link, Mic } from 'lucide-react';

interface EditorToolbarProps {
  handleAddImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddLink: () => void;
  handleToggleRecording: () => void;
  isUploading: boolean;
  isRecording: boolean;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  handleAddImage,
  handleAddLink,
  handleToggleRecording,
  isUploading,
  isRecording
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-3 border-t flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAddImage}
        accept="image/*"
        className="hidden"
      />
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <Image className="h-4 w-4" />
        )}
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={handleAddLink}
      >
        <Link className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline" 
        size="icon"
        onClick={handleToggleRecording}
        className={isRecording ? "text-red-500 border-red-500" : ""}
      >
        <Mic className={`h-4 w-4 ${isRecording ? 'animate-pulse' : ''}`} />
      </Button>
    </div>
  );
};

export default EditorToolbar;
