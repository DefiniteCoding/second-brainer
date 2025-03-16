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

interface NoteDetailViewProps {
  selectedNote: Note | null;
  isLoading: boolean;
  onBack: () => void;
  onDelete: (noteId: string) => void;
}

const NoteDetailView: React.FC<NoteDetailViewProps> = ({
  selectedNote,
  isLoading,
  onBack,
  onDelete
}) => {
  const { createNote, updateNote } = useNotes();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(!selectedNote);
  const [title, setTitle] = useState(selectedNote?.title || '');
  const [content, setContent] = useState(selectedNote?.content || '');
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

  // Reset state when selected note changes
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setIsEditing(false);
    } else {
      setTitle('');
      setContent('');
      setIsEditing(true);
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
        await updateNote(selectedNote.id, { title, content });
      } else {
        await createNote({ title, content });
      }
      setIsEditing(false);
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

    // Restore cursor position after state update
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
      <div className="h-full flex items-center justify-center p-6 bg-muted/5">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="animate-pulse flex flex-col items-center"
        >
          <div className="h-8 w-32 bg-muted rounded mb-4"></div>
          <div className="h-4 w-48 bg-muted rounded mb-2"></div>
          <div className="h-4 w-32 bg-muted rounded mb-4"></div>
          <div className="h-32 w-full max-w-md bg-muted rounded"></div>
        </motion.div>
      </div>
    );
  }

  if (!selectedNote && !isEditing) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="h-full flex flex-col items-center justify-center text-center p-8 bg-muted/5"
      >
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-full bg-muted/30 mb-6"
        >
          <BookOpen className="h-16 w-16 text-indigo-400 opacity-70" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl font-medium mb-3 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent"
        >
          Start writing a new note
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button 
            onClick={() => setIsEditing(true)}
            className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:scale-105 transition-transform"
          >
            Create Note
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  if (isEditing || !selectedNote) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="h-full bg-card"
      >
        <div className="h-full bg-muted/5 border-l p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(false)}
                className="rounded-full hover:bg-muted/80 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title..."
                className="text-xl font-medium bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-[300px] placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(false)}
                className="rounded-full hover:bg-red-50 text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSave}
                className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:scale-105 transition-transform"
              >
                <Send className="h-4 w-4 mr-2" />
                {selectedNote ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-4">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your note..."
                  className="min-h-[300px] bg-transparent border-none focus-visible:ring-0 resize-none placeholder:text-muted-foreground/50 text-base leading-relaxed"
                />
                <FloatingFormatToolbar onFormat={handleFormat} />
              </div>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex gap-2 sticky bottom-0 bg-background/80 backdrop-blur-sm p-2 rounded-lg border shadow-lg"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleAddImage}
                  className="hidden"
                />
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
                  onClick={handleAddLink}
                  className="rounded-full hover:scale-105 transition-transform"
                  title="Add Link"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleRecording}
                  className={`rounded-full hover:scale-105 transition-transform ${
                    isRecording ? 'bg-red-50 text-red-500 animate-pulse border-red-200' : ''
                  }`}
                  title="Record Voice"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </ScrollArea>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full bg-card"
    >
      <div className="h-full bg-muted/5 border-l">
        <NoteView 
          note={selectedNote}
          onBack={onBack}
          onEdit={() => setIsEditing(true)}
          onDelete={onDelete}
        />
      </div>
    </motion.div>
  );
};

export default NoteDetailView;
