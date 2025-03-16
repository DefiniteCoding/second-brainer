
import React, { useState } from 'react';
import { Note, useNotes } from '@/contexts/NotesContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash, Network, Sparkles } from 'lucide-react';
import RelatedNotes from './RelatedNotes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import FormattingToolbar from './notes/FormattingToolbar';
import ProgressiveSummary from './notes/ProgressiveSummary';
import NoteContentRenderer from './notes/NoteContentRenderer';
import BacklinksSection from './notes/BacklinksSection';
import RelatedNotesSection from './notes/RelatedNotesSection';
import AIEnhance from './notes/AIEnhance';

interface NoteViewProps {
  note: Note;
  onBack: () => void;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

const NoteView: React.FC<NoteViewProps> = ({ note, onBack, onEdit, onDelete }) => {
  const { parseNoteContent, getSuggestedConnections, findBacklinks, updateNote } = useNotes();
  const [showConnections, setShowConnections] = useState(false);
  const [progressiveMode, setProgressiveMode] = useState<string | null>(null);
  const [showAIEnhance, setShowAIEnhance] = useState(false);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const { parsedContent } = parseNoteContent(note.content);
  const backlinks = findBacklinks(note.id);
  const suggestedConnections = getSuggestedConnections(note.id);

  const handleBoldSelection = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const selectedText = selection.toString();
      const updatedContent = note.content.replace(
        selectedText, 
        `**${selectedText}**`
      );
      updateNote(note.id, { content: updatedContent });
    }
  };

  const handleItalicSelection = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const selectedText = selection.toString();
      const updatedContent = note.content.replace(
        selectedText, 
        `_${selectedText}_`
      );
      updateNote(note.id, { content: updatedContent });
    }
  };

  const handleHighlightSelection = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const selectedText = selection.toString();
      const updatedContent = note.content.replace(
        selectedText, 
        `==${selectedText}==`
      );
      updateNote(note.id, { content: updatedContent });
    }
  };

  return (
    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-full">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 py-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="rounded-full hover:bg-white/80 dark:hover:bg-slate-900/80"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex gap-1 rounded-full border-indigo-200 hover:bg-indigo-50 dark:border-indigo-900 dark:hover:bg-indigo-950"
              onClick={() => setShowAIEnhance(!showAIEnhance)}
            >
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <span>AI Enhance</span>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex gap-1 rounded-full border-indigo-200 hover:bg-indigo-50 dark:border-indigo-900 dark:hover:bg-indigo-950"
                  onClick={() => setShowConnections(true)}
                >
                  <Network className="h-4 w-4 text-indigo-500" />
                  <span>Connections</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Note Connections</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh]">
                  <RelatedNotes 
                    note={note} 
                    backlinks={backlinks} 
                    suggestions={suggestedConnections} 
                  />
                </ScrollArea>
              </DialogContent>
            </Dialog>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEdit(note)}
              className="rounded-full hover:bg-amber-50 text-amber-500 dark:hover:bg-amber-950"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDelete(note.id)}
              className="rounded-full hover:bg-red-50 text-red-500 dark:hover:bg-red-950"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardTitle className="text-xl bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">{note.title}</CardTitle>
        <CardDescription>
          Created: {formatDate(note.createdAt)}
          {note.createdAt.getTime() !== note.updatedAt.getTime() && 
            ` • Updated: ${formatDate(note.updatedAt)}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-380px)]">
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <ProgressiveSummary 
                progressiveMode={progressiveMode} 
                onProgressiveModeChange={setProgressiveMode} 
              />
              
              <div className="flex-1 flex justify-end">
                <FormattingToolbar 
                  onBoldClick={handleBoldSelection}
                  onItalicClick={handleItalicSelection}
                  onHighlightClick={handleHighlightSelection}
                />
              </div>
            </div>
            
            <NoteContentRenderer 
              note={note} 
              processedContent={parsedContent} 
              progressiveMode={progressiveMode} 
            />
            
            {showAIEnhance && <AIEnhance note={note} />}
            
            <BacklinksSection backlinks={backlinks} />
            
            <RelatedNotesSection suggestedConnections={suggestedConnections} />
          </div>
        </ScrollArea>
      </CardContent>
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
    </Card>
  );
};

export default NoteView;
