
import React, { useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import FormattingToolbar from '@/components/notes/FormattingToolbar';
import { FloatingFormatToolbar } from '@/components/notes/FloatingFormatToolbar';
import TagSelector from '@/components/TagSelector';
import { Tag } from '@/types/note';
import { autoSaveService } from '@/services/storage/autoSave';
import { useNotes } from '@/contexts/NotesContext';

interface EditorContentProps {
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
  handleFormatText: (formatType: string, meta?: any) => void;
  noteId?: string;
  isCreating?: boolean;
}

const EditorContent: React.FC<EditorContentProps> = ({
  title,
  setTitle,
  content,
  setContent,
  tags,
  setTags,
  handleFormatText,
  noteId,
  isCreating = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { updateNote, createNote, addToRecentViews } = useNotes();
  
  // Set up autosave for content changes
  useEffect(() => {
    if (!title || isCreating) return;
    
    const saveTimeout = setTimeout(() => {
      if (noteId) {
        console.log('Autosaving note changes...');
        updateNote(noteId, { title, content, tags });
        autoSaveService.triggerSave();
      }
    }, 1500); // Delay autosave to reduce frequency
    
    return () => clearTimeout(saveTimeout);
  }, [title, content, tags, noteId, updateNote, isCreating]);

  // Handle title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  // Handle content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      <Input
        type="text"
        placeholder="Note title"
        value={title}
        onChange={handleTitleChange}
        className="text-lg font-medium"
      />
      
      <FormattingToolbar onFormat={handleFormatText} />
      
      <TagSelector 
        selectedTags={tags} 
        onTagsChange={setTags} 
      />
      
      <div className="relative">
        <Textarea
          ref={textareaRef}
          placeholder="What's on your mind?"
          value={content}
          onChange={handleContentChange}
          className="min-h-[300px] resize-none flex-1"
        />
        <FloatingFormatToolbar onFormat={handleFormatText} />
      </div>
    </div>
  );
};

export default EditorContent;
