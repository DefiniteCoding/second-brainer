import React, { useState } from 'react';
import { Note, useNotes } from '@/contexts/NotesContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash, Sparkles, ChevronLeft, Trash2, Edit3 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import FormattingToolbar from './notes/FormattingToolbar';
import ProgressiveSummary from './notes/ProgressiveSummary';
import NoteContentRenderer from './notes/NoteContentRenderer';
import BacklinksSection from './notes/BacklinksSection';
import AIEnhance from './notes/AIEnhance';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideInRight } from '@/lib/animations';

interface NoteViewProps {
  note: Note;
  onBack: () => void;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

const NoteView: React.FC<NoteViewProps> = ({
  note,
  onBack,
  onEdit,
  onDelete
}) => {
  const {
    parseNoteContent,
    findBacklinks,
    updateNote
  } = useNotes();
  const [progressiveMode, setProgressiveMode] = useState<string | null>(null);
  const [showAIEnhance, setShowAIEnhance] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const {
    parsedContent
  } = parseNoteContent(note.content);
  const backlinks = findBacklinks(note.id);

  const handleBoldSelection = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const selectedText = selection.toString();
      const updatedContent = note.content.replace(selectedText, `**${selectedText}**`);
      updateNote(note.id, {
        content: updatedContent
      });
    }
  };

  const handleItalicSelection = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const selectedText = selection.toString();
      const updatedContent = note.content.replace(selectedText, `_${selectedText}_`);
      updateNote(note.id, {
        content: updatedContent
      });
    }
  };

  const handleHighlightSelection = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const selectedText = selection.toString();
      const updatedContent = note.content.replace(selectedText, `==${selectedText}==`);
      updateNote(note.id, {
        content: updatedContent
      });
    }
  };

  const renderAudio = (url: string) => {
    if (url.startsWith('data:audio')) {
      return (
        <div className="my-4">
          <audio controls className="w-full">
            <source src={url} type="audio/webm" />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }
    return <a href={url} target="_blank" rel="noopener noreferrer">Audio Recording</a>;
  };

  const components = {
    img: ({ src, alt }: { src?: string; alt?: string }) => (
      <img 
        src={src} 
        alt={alt} 
        className="max-w-full h-auto rounded-lg shadow-md my-4" 
        loading="lazy"
      />
    ),
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
      if (href?.startsWith('data:audio')) {
        return renderAudio(href);
      }
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          {children}
        </a>
      );
    },
  };

  return (
    <motion.div
      variants={slideInRight}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex h-full flex-col overflow-hidden bg-background"
    >
      <motion.div
        variants={fadeIn}
        className="flex items-center justify-between border-b px-4 py-3 bg-gradient-to-b from-background to-muted/20"
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {note.title}
            </h2>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAIEnhance(!showAIEnhance)}
            className={`rounded-full hover:bg-muted ${showAIEnhance ? 'bg-primary/10 text-primary' : ''}`}
            title={showAIEnhance ? 'Hide AI Insights' : 'Show AI Insights'}
          >
            <Sparkles className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(note)}
            className="rounded-full hover:bg-muted"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(note.id)}
            className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <ScrollArea className="flex-1 px-4">
        <motion.div
          variants={fadeIn}
          className="prose prose-sm dark:prose-invert max-w-none py-6"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Created {formatDate(note.createdAt)}</span>
              <span>•</span>
              <span>Updated {formatDate(note.updatedAt)}</span>
            </div>

            <AnimatePresence>
              {showAIEnhance && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-lg border bg-card p-4 shadow-sm">
                    <AIEnhance note={note} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="rounded-lg bg-muted/30 p-6">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={components}
              >
                {note.content}
              </ReactMarkdown>
            </div>
            
            <BacklinksSection backlinks={backlinks} />
          </div>
        </motion.div>
      </ScrollArea>

      <CardFooter className="flex flex-wrap gap-1 border-t bg-slate-50/50 dark:bg-slate-900/50 py-3">
        {note.tags.map(tag => (
          <Badge 
            key={tag.id} 
            style={{ backgroundColor: tag.color }} 
            className="text-white transition-all hover:scale-105"
          >
            {tag.name}
          </Badge>
        ))}
      </CardFooter>
    </motion.div>
  );
};

export default NoteView;