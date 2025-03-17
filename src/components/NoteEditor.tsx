
import React, { useState, useRef, useEffect } from 'react';
import { Note, useNotes } from '@/contexts/NotesContext';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import FormattingToolbar from '@/components/notes/FormattingToolbar';
import { FloatingFormatToolbar } from '@/components/notes/FloatingFormatToolbar';
import { motion } from 'framer-motion';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useNavigate } from 'react-router-dom';
import { uploadFile, validateFileSize, validateImageType } from '@/lib/fileUpload';
import EditorToolbar from '@/components/notes/EditorToolbar';
import MediaToolbar from '@/components/notes/MediaToolbar';

interface NoteEditorProps {
  note: Note | null;
  onBack: () => void;
  isCreating: boolean;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onBack,
  isCreating
}) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { addNote, updateNote } = useNotes();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const {
    isRecording,
    startRecording,
    stopRecording,
    resetRecording,
    audioURL,
    error: recordingError
  } = useVoiceRecorder();

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [note]);

  // Handle audio recording results
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
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content for your note.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      if (note) {
        await updateNote(note.id, { 
          title: title.trim() || 'Untitled Note', 
          content 
        });
        toast({
          title: "Note updated",
          description: "Your note has been saved successfully.",
        });
      } else {
        const newNote = { 
          title: title.trim() || 'Untitled Note', 
          content,
          contentType: 'text' as const, // Explicitly type as a literal
          tags: [] // Add empty tags array to satisfy the type requirement
        };
        
        const newNoteId = await addNote(newNote);
        toast({
          title: "Note created",
          description: "Your note has been saved successfully.",
        });
        
        // Navigate to the newly created note
        if (newNoteId) {
          navigate(`/?noteId=${newNoteId}`, { replace: true });
        }
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

  const handleFormat = (type: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let prefix = '';
    let suffix = '';
    let cursorOffset = 0;

    switch (type) {
      case 'bold':
        prefix = '**';
        suffix = '**';
        cursorOffset = 2;
        break;
      case 'italic':
        prefix = '*';
        suffix = '*';
        cursorOffset = 1;
        break;
      case 'heading':
        prefix = '# ';
        suffix = '';
        cursorOffset = 2;
        break;
      case 'quote':
        prefix = '> ';
        suffix = '';
        cursorOffset = 2;
        break;
      case 'ul':
        prefix = '- ';
        suffix = '';
        cursorOffset = 2;
        break;
      case 'ol':
        prefix = '1. ';
        suffix = '';
        cursorOffset = 3;
        break;
      case 'code':
        if (selectedText.includes('\n')) {
          prefix = '```\n';
          suffix = '\n```';
          cursorOffset = 4;
        } else {
          prefix = '`';
          suffix = '`';
          cursorOffset = 1;
        }
        break;
      case 'link':
        const url = prompt('Enter URL:', 'https://');
        if (url) {
          prefix = '[';
          suffix = `](${url})`;
          cursorOffset = 1;
        } else {
          return;
        }
        break;
    }

    const newContent = 
      content.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      content.substring(end);

    setContent(newContent);

    // Restore cursor position and focus
    requestAnimationFrame(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(
          start + prefix.length,
          end + prefix.length
        );
      } else {
        textarea.setSelectionRange(
          start + prefix.length,
          start + prefix.length
        );
      }
    });
  };

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
      
      const textarea = textareaRef.current;
      if (textarea) {
        const cursorPos = textarea.selectionStart;
        const newContent = content.substring(0, cursorPos) + 
          `\n${imageMarkdown}\n` + 
          content.substring(cursorPos);
        setContent(newContent);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add image. Please try again.",
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
    const url = window.prompt('Enter URL:');
    if (!url) return;

    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      const linkText = selectedText || 'link text';
      const markdown = `[${linkText}](${url})`;

      const newContent = content.substring(0, start) + markdown + content.substring(end);
      setContent(newContent);
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full bg-card"
    >
      <div className="h-full bg-muted/5 border-l p-4">
        <EditorToolbar 
          title={title}
          setTitle={setTitle}
          onBack={onBack}
          onSave={handleSave}
          isSaving={isSaving}
          isUpdateMode={!!note}
        />

        {/* Add visible formatting toolbar here */}
        <div className="mb-4">
          <FormattingToolbar
            onBoldClick={() => handleFormat('bold')}
            onItalicClick={() => handleFormat('italic')}
            onHeadingClick={() => handleFormat('heading')}
            onQuoteClick={() => handleFormat('quote')}
            onCodeClick={() => handleFormat('code')}
            onLinkClick={() => handleFormat('link')}
            onBulletListClick={() => handleFormat('ul')}
            onNumberedListClick={() => handleFormat('ol')}
          />
        </div>

        <ScrollArea className="h-[calc(100vh-240px)]">
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
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleAddImage}
              className="hidden"
            />
            
            <MediaToolbar 
              fileInputRef={fileInputRef}
              isUploading={isUploading}
              onLinkClick={handleAddLink}
              onToggleRecording={handleToggleRecording}
              isRecording={isRecording}
            />
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  );
};

export default NoteEditor;
