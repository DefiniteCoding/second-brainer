
import React, { useState, useEffect, useRef } from 'react';
import { Note, useNotes } from '@/contexts/NotesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Link, Image, Mic, Save, X } from 'lucide-react';
import { uploadFile, validateFileSize, validateImageType } from '@/lib/fileUpload';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import { generateDefaultTitle } from '@/contexts/notes/constants';
import { useNavigate } from 'react-router-dom';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { FormattingToolbar } from '@/components/notes/FormattingToolbar';
import TagSelector from '@/components/TagSelector';

interface NoteEditorProps {
  note?: Note | null;
  onBack: () => void;
  isCreating?: boolean;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onBack, isCreating = false }) => {
  const { createNote, updateNote, addToRecentViews } = useNotes();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags || []);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isRecording,
    audioURL,
    error: recordingError,
    startRecording,
    stopRecording,
    resetRecording
  } = useVoiceRecorder();

  // Default title if empty
  useEffect(() => {
    if (isCreating && !title) {
      setTitle(generateDefaultTitle(new Date()));
    }
  }, [isCreating, title]);

  // Handle audio recording result
  useEffect(() => {
    if (audioURL) {
      const audioMarkdown = `🎤 [Voice Recording](${audioURL})`;
      setContent(prev => prev + (prev ? '\n\n' : '') + audioMarkdown);
      resetRecording();
    }
  }, [audioURL]);

  // Handle recording errors
  useEffect(() => {
    if (recordingError) {
      toast({
        title: "Recording Error",
        description: recordingError,
        variant: "destructive"
      });
    }
  }, [recordingError, toast]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      if (note) {
        await updateNote(note.id, { title, content, tags });
        toast({
          title: "Note updated",
          description: "Your note has been saved successfully.",
        });
      } else {
        const noteId = await createNote({ 
          title, 
          content, 
          contentType: 'text',
          tags
        });
        
        if (noteId) {
          addToRecentViews(noteId);
          navigate(`/?noteId=${noteId}`, { replace: true });
        }
        
        toast({
          title: "Note created",
          description: "Your new note has been saved successfully.",
        });
      }
      onBack();
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateImageType(file)) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, GIF, or WebP).",
        variant: "destructive"
      });
      return;
    }

    if (!validateFileSize(file)) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      const dataUrl = await uploadFile(file);
      
      // Add image markdown to content
      const imageMarkdown = `![${file.name}](${dataUrl})`;
      setContent(prev => prev + (prev ? '\n\n' : '') + imageMarkdown);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddLink = () => {
    const linkText = window.prompt('Enter link text:');
    const url = window.prompt('Enter URL:');
    
    if (linkText && url) {
      const linkMarkdown = `[${linkText}](${url})`;
      setContent(prev => prev + (prev ? '\n\n' : '') + linkMarkdown);
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleFormatText = (formatType: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    let newCursorPosition = start;
    
    switch (formatType) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        newCursorPosition = start + 2;
        break;
      case 'italic':
        formattedText = `_${selectedText}_`;
        newCursorPosition = start + 1;
        break;
      case 'h1':
        formattedText = `# ${selectedText}`;
        newCursorPosition = start + 2;
        break;
      case 'h2':
        formattedText = `## ${selectedText}`;
        newCursorPosition = start + 3;
        break;
      case 'h3':
        formattedText = `### ${selectedText}`;
        newCursorPosition = start + 4;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        newCursorPosition = start + 2;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        newCursorPosition = start + 1;
        break;
      case 'link':
        const url = window.prompt('Enter URL:', 'https://');
        if (url) {
          formattedText = `[${selectedText || 'Link'}](${url})`;
          newCursorPosition = start + 1;
        } else {
          return;
        }
        break;
      default:
        return;
    }
    
    const newContent = 
      content.substring(0, start) + 
      formattedText + 
      content.substring(end);
      
    setContent(newContent);
    
    // Set cursor position after the formatting is applied
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        newCursorPosition,
        newCursorPosition + selectedText.length
      );
    }, 0);
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="h-full flex flex-col overflow-hidden bg-card"
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">
            {isCreating ? "Create Note" : "Edit Note"}
          </h1>
        </div>
        
        <Button onClick={handleSave} disabled={isSaving} className="gap-1.5">
          {isSaving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save
            </>
          )}
        </Button>
      </div>
      
      {/* Editor */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <Input
          type="text"
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-medium"
        />
        
        <FormattingToolbar onFormat={handleFormatText} />
        
        <TagSelector 
          selectedTags={tags} 
          onTagsChange={setTags} 
        />
        
        <Textarea
          ref={textareaRef}
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[300px] resize-none flex-1"
        />
      </div>
      
      {/* Toolbar */}
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
          ) :  (
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
    </motion.div>
  );
};

export default NoteEditor;
