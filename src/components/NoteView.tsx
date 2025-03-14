
import React, { useState } from 'react';
import { Note, useNotes } from '@/contexts/NotesContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash, Network } from 'lucide-react';
import RelatedNotes from './RelatedNotes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import FormattingToolbar from './notes/FormattingToolbar';
import ProgressiveSummary from './notes/ProgressiveSummary';
import NoteContentRenderer from './notes/NoteContentRenderer';
import BacklinksSection from './notes/BacklinksSection';
import RelatedNotesSection from './notes/RelatedNotesSection';

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
    <Card className="border-note-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex gap-1"
                  onClick={() => setShowConnections(true)}
                >
                  <Network className="h-4 w-4" />
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
            <Button variant="ghost" size="icon" onClick={() => onEdit(note)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(note.id)}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardTitle className="text-xl">{note.title}</CardTitle>
        <CardDescription>
          Created: {formatDate(note.createdAt)}
          {note.createdAt.getTime() !== note.updatedAt.getTime() && 
            ` • Updated: ${formatDate(note.updatedAt)}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
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
        
        <BacklinksSection backlinks={backlinks} />
        
        <RelatedNotesSection suggestedConnections={suggestedConnections} />
      </CardContent>
      <CardFooter className="flex flex-wrap gap-1">
        {note.tags.map(tag => (
          <Badge 
            key={tag.id} 
            style={{ backgroundColor: tag.color }}
            className="text-white"
          >
            {tag.name}
          </Badge>
        ))}
      </CardFooter>
    </Card>
  );
};

export default NoteView;
