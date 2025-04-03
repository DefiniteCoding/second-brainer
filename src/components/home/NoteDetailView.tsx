
import React, { useState, useRef, useEffect } from 'react';
import { Note, useNotes } from '@/contexts/NotesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Image as ImageIcon, Link as LinkIcon, Mic, Send, X, Loader2, ChevronLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import NoteView from '@/components/NoteView';
import { uploadFile, validateFileSize, validateImageType } from '@/lib/fileUpload';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useToast } from '@/components/ui/use-toast';
import { FloatingFormatToolbar } from '@/components/notes/FloatingFormatToolbar';
import { motion, AnimatePresence } from 'framer-motion';
import NoteEditor from '@/components/NoteEditor';
import { fadeIn } from '@/lib/animations';
import TagSelector from '@/components/TagSelector';

interface NoteDetailViewProps {
  selectedNote: Note | null;
  isLoading: boolean;
  onBack: () => void;
  onDelete: (noteId: string) => void;
  isEditing: boolean;
  onEdit: (note: Note) => void;
  isCreating: boolean;
}

const NoteDetailView: React.FC<NoteDetailViewProps> = ({
  selectedNote,
  isLoading,
  onBack,
  onDelete,
  isEditing,
  onEdit,
  isCreating
}) => {
  const { createNote, updateNote } = useNotes();
  const { toast } = useToast();
  const [title, setTitle] = useState(selectedNote?.title || '');
  const [content, setContent] = useState(selectedNote?.content || '');
  const [tags, setTags] = useState(selectedNote?.tags || []);
  const [isUploading, setIsUploading] = useState(false);
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

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setTags(selectedNote.tags);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
    }
  }, [selectedNote]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (selectedNote) {
        await updateNote(selectedNote.id, { title, content, tags });
      } else {
        await createNote({ 
          title, 
          content, 
          contentType: 'text',
          tags
        });
      }
      toast({
        title: selectedNote ? "Note updated" : "Note created",
        description: `Your note has been ${selectedNote ? 'updated' : 'created'} successfully.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateImageType(file)) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
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

  React.useEffect(() => {
    if (audioURL) {
      const audioMarkdown = `🎤 [Voice Recording](${audioURL})`;
      setContent(prev => prev + (prev ? '\n\n' : '') + audioMarkdown);
      resetRecording();
    }
  }, [audioURL]);

  React.useEffect(() => {
    if (recordingError) {
      toast({
        title: "Recording Error",
        description: recordingError,
        variant: "destructive"
      });
    }
  }, [recordingError, toast]);

  const handleFormat = (type: string, selection: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = content;

    let formattedText = '';
    let newCursorPosition = start;

    switch (type) {
      case 'bold':
        formattedText = `**${selection}**`;
        newCursorPosition = start + 2;
        break;
      case 'italic':
        formattedText = `_${selection}_`;
        newCursorPosition = start + 1;
        break;
      case 'h1':
        formattedText = `# ${selection}`;
        newCursorPosition = start + 2;
        break;
      case 'h2':
        formattedText = `## ${selection}`;
        newCursorPosition = start + 3;
        break;
      case 'ul':
        formattedText = `- ${selection}`;
        newCursorPosition = start + 2;
        break;
      case 'ol':
        formattedText = `1. ${selection}`;
        newCursorPosition = start + 3;
        break;
      case 'quote':
        formattedText = `> ${selection}`;
        newCursorPosition = start + 2;
        break;
      case 'code':
        formattedText = `\`${selection}\``;
        newCursorPosition = start + 1;
        break;
      case 'link':
        const url = window.prompt('Enter URL:');
        if (url) {
          formattedText = `[${selection}](${url})`;
          newCursorPosition = start + 1;
        } else {
          return;
        }
        break;
      default:
        return;
    }

    const newContent = 
      currentContent.substring(0, start) +
      formattedText +
      currentContent.substring(end);

    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        newCursorPosition,
        newCursorPosition + selection.length + (type === 'link' ? 4 : 2)
      );
    }, 0);
  };

  if (isLoading) {
    return (
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="h-full flex items-center justify-center"
      >
        <div className="animate-pulse">Loading...</div>
      </motion.div>
    );
  }

  if (isCreating || isEditing) {
    return (
      <NoteEditor
        note={selectedNote}
        onBack={onBack}
        isCreating={isCreating}
      />
    );
  }

  if (!selectedNote) {
    return null;
  }

  return (
    <NoteView
      note={selectedNote}
      onBack={onBack}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default NoteDetailView;
