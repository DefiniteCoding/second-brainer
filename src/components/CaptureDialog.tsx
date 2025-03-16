import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useNotes, Tag, Note } from '@/contexts/NotesContext';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { X, Image, Link, Mic, Paperclip, Tag as TagIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteToEdit?: Note | null;
}

const CaptureDialog: React.FC<CaptureDialogProps> = ({ open, onOpenChange, noteToEdit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<'text' | 'image' | 'link' | 'audio'>('text');
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [showTagsPopover, setShowTagsPopover] = useState(false);
  
  const { addNote, tags, updateNote } = useNotes();
  const { toast } = useToast();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title);
      setContent(noteToEdit.content);
      setContentType(noteToEdit.contentType as 'text' | 'image' | 'link' | 'audio');
      setMediaUrl(noteToEdit.mediaUrl || '');
      setSelectedTags(noteToEdit.tags);
    } else {
      setTitle('');
      setContent('');
      setContentType('text');
      setMediaUrl('');
      setSelectedTags([]);
    }
  }, [noteToEdit, open]);

  useEffect(() => {
    if (open && textAreaRef.current) {
      setTimeout(() => {
        textAreaRef.current?.focus();
      }, 100);
    }
  }, [open, contentType]);

  const handleSave = () => {
    if (!content.trim()) {
      toast({
        title: "Note cannot be empty",
        description: "Please add some content to your note.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    const source = 'Quick Capture';
    
    const noteData = {
      title: title.trim() || `Note ${now.toLocaleTimeString()}`,
      content,
      contentType,
      tags: selectedTags,
      source,
      mediaUrl: mediaUrl || undefined,
    };

    if (noteToEdit) {
      updateNote(noteToEdit.id, noteData);
      toast({
        title: "Note updated!",
        description: "Your note has been updated successfully.",
      });
    } else {
      addNote(noteData);
      toast({
        title: "Note captured!",
        description: "Your note has been saved successfully.",
      });
    }
    
    setTitle('');
    setContent('');
    setContentType('text');
    setMediaUrl('');
    setSelectedTags([]);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const toggleTag = (tag: Tag) => {
    if (selectedTags.some(t => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const renderContentInput = () => {
    switch (contentType) {
      case 'text':
        return (
          <Textarea
            ref={textAreaRef}
            placeholder="What's on your mind?"
            className="min-h-[150px] text-base"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        );
      case 'link':
        return (
          <div className="space-y-4">
            <Input 
              placeholder="Paste URL here"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="text-base"
            />
            <Textarea
              placeholder="Add your notes about this link"
              className="min-h-[120px] text-base"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        );
      case 'image':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
              <Input 
                type="file" 
                accept="image/*"
                className="hidden"
                id="image-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const objectUrl = URL.createObjectURL(file);
                    setMediaUrl(objectUrl);
                  }
                }}
              />
              <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                <Image className="h-8 w-8 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload an image</span>
              </label>
              {mediaUrl && (
                <div className="mt-2">
                  <img src={mediaUrl} alt="Preview" className="max-h-40 mx-auto rounded" />
                </div>
              )}
            </div>
            <Textarea
              placeholder="Add your notes about this image"
              className="min-h-[100px] text-base"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        );
      case 'audio':
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center border rounded-md p-4 gap-2">
              <Button 
                variant="outline" 
                className="h-20 w-20 rounded-full"
                onClick={() => {
                  toast({
                    title: "Voice recording",
                    description: "This feature is coming soon!",
                  });
                }}
              >
                <Mic className="h-8 w-8 text-primary" />
              </Button>
              <span className="text-sm text-muted-foreground">Press to record</span>
            </div>
            <Textarea
              placeholder="Add your transcription or notes"
              className="min-h-[100px] text-base"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 animate-slide-up">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-semibold">
            {noteToEdit ? 'Edit Note' : 'Capture Thought'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-2 px-6">
          <Button
            variant={contentType === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setContentType('text')}
            className="gap-2"
          >
            <Paperclip className="h-4 w-4" />
            <span>Text</span>
          </Button>
          <Button
            variant={contentType === 'image' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setContentType('image')}
            className="gap-2"
          >
            <Image className="h-4 w-4" />
            <span>Image</span>
          </Button>
          <Button
            variant={contentType === 'link' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setContentType('link')}
            className="gap-2"
          >
            <Link className="h-4 w-4" />
            <span>Link</span>
          </Button>
          <Button
            variant={contentType === 'audio' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setContentType('audio')}
            className="gap-2"
          >
            <Mic className="h-4 w-4" />
            <span>Voice</span>
          </Button>
        </div>
        
        <div className="p-6 pt-4 space-y-4">
          <Input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium"
          />
          
          {renderContentInput()}
          
          <div className="flex flex-wrap gap-2 items-center mt-2">
            {selectedTags.map(tag => (
              <Badge 
                key={tag.id} 
                style={{ backgroundColor: tag.color }}
                className="text-white flex items-center gap-1 px-3 py-1"
              >
                {tag.name}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setSelectedTags(selectedTags.filter(t => t.id !== tag.id))}
                />
              </Badge>
            ))}
            
            <Popover open={showTagsPopover} onOpenChange={setShowTagsPopover}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 gap-1 rounded-full"
                >
                  <TagIcon className="h-3.5 w-3.5" />
                  <span>Tags</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-2" align="start">
                <div className="space-y-1">
                  {tags.map(tag => {
                    const isSelected = selectedTags.some(t => t.id === tag.id);
                    return (
                      <div 
                        key={tag.id}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted ${isSelected ? 'bg-muted' : ''}`}
                        onClick={() => toggleTag(tag)}
                      >
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: tag.color }}
                        />
                        <span>{tag.name}</span>
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <DialogFooter className="p-6 pt-2">
          <div className="flex justify-between items-center w-full">
            <div className="text-xs text-muted-foreground">
              Press <kbd className="rounded border px-1 py-0.5 bg-muted">Ctrl+Enter</kbd> to save
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {noteToEdit ? 'Update Note' : 'Save Note'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CaptureDialog;
