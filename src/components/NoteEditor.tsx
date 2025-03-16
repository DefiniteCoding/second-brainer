import React, { useState, useRef, useEffect } from 'react';
import { Note, useNotes } from '@/contexts/NotesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { FloatingFormatToolbar } from '@/components/notes/FloatingFormatToolbar';
import { motion } from 'framer-motion';
import { ChevronLeft, X, Send, ImageIcon, LinkIcon, Mic, Loader2 } from 'lucide-react';
import { readFileAsDataUrl } from '@/lib/fileUpload';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

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
  const { createNote, updateNote } = useNotes();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isRecording, startRecording, stopRecording } = useVoiceRecorder();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [note]);

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
      if (note) {
        await updateNote(note.id, { title, content });
      } else {
        await createNote({ title, content });
      }
      toast({
        title: note ? "Note updated" : "Note created",
        description: "Your note has been saved successfully.",
      });
      onBack();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFormat = (type: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newText = '';
    let cursorOffset = 2;

    switch (type) {
      case 'bold':
        newText = `**${selectedText}**`;
        break;
      case 'italic':
        newText = `_${selectedText}_`;
        cursorOffset = 1;
        break;
      case 'heading':
        newText = `# ${selectedText}`;
        break;
      case 'quote':
        newText = `> ${selectedText}`;
        break;
      case 'code':
        newText = `\`${selectedText}\``;
        cursorOffset = 1;
        break;
      case 'link':
        newText = `[${selectedText}](url)`;
        cursorOffset = 1;
        break;
      default:
        return;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + cursorOffset,
        end + cursorOffset
      );
    }, 0);
  };

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const dataUrl = await readFileAsDataUrl(file);
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
      const audioUrl = await stopRecording();
      if (audioUrl) {
        const textarea = textareaRef.current;
        if (textarea) {
          const cursorPos = textarea.selectionStart;
          const newContent = content.substring(0, cursorPos) + 
            `\n[Audio Recording](${audioUrl})\n` + 
            content.substring(cursorPos);
          setContent(newContent);
        }
      }
    } else {
      startRecording();
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
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
              onClick={onBack}
              className="rounded-full hover:bg-red-50 text-red-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSave}
              className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:scale-105 transition-transform"
            >
              <Send className="h-4 w-4 mr-2" />
              {note ? 'Update' : 'Save'}
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
};

export default NoteEditor; 