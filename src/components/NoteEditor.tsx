
import React, { useState, useEffect } from 'react';
import { Note, useNotes } from '@/contexts/NotesContext';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import { generateDefaultTitle } from '@/contexts/notes/constants';
import { useNavigate } from 'react-router-dom';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { uploadFile, validateFileSize, validateImageType } from '@/lib/fileUpload';
import EditorHeader from './notes/EditorHeader';
import EditorContent from './notes/EditorContent';
import EditorToolbar from './notes/EditorToolbar';

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
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    
    const selectedText = selection.toString();
    if (!selectedText) return;
    
    let formattedText = '';
    
    switch (formatType) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `_${selectedText}_`;
        break;
      case 'h1':
        formattedText = `# ${selectedText}`;
        break;
      case 'h2':
        formattedText = `## ${selectedText}`;
        break;
      case 'h3':
        formattedText = `### ${selectedText}`;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'link':
        const url = window.prompt('Enter URL:', 'https://');
        if (url) {
          formattedText = `[${selectedText || 'Link'}](${url})`;
        } else {
          return;
        }
        break;
      default:
        return;
    }
    
    // Insert the formatted text into the textarea
    document.execCommand('insertText', false, formattedText);
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="h-full flex flex-col overflow-hidden bg-card"
    >
      <EditorHeader 
        title={title}
        setTitle={setTitle}
        onBack={onBack}
        handleSave={handleSave}
        isSaving={isSaving}
        isCreating={isCreating}
      />
      
      <EditorContent
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        tags={tags}
        setTags={setTags}
        handleFormatText={handleFormatText}
      />
      
      <EditorToolbar
        handleAddImage={handleAddImage}
        handleAddLink={handleAddLink}
        handleToggleRecording={handleToggleRecording}
        isUploading={isUploading}
        isRecording={isRecording}
      />
    </motion.div>
  );
};

export default NoteEditor;
