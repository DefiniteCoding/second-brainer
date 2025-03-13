
import React, { useState } from 'react';
import { Note, useNotes } from '@/contexts/NotesContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash, Link, Network, Brain } from 'lucide-react';
import RelatedNotes from './RelatedNotes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NoteViewProps {
  note: Note;
  onBack: () => void;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

const NoteView: React.FC<NoteViewProps> = ({ note, onBack, onEdit, onDelete }) => {
  const { parseNoteContent, getSuggestedConnections, findBacklinks } = useNotes();
  const [showConnections, setShowConnections] = useState(false);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const { parsedContent } = parseNoteContent(note.content);
  const backlinks = findBacklinks(note.id);
  const suggestedConnections = getSuggestedConnections(note.id);

  const renderContent = () => {
    switch (note.contentType) {
      case 'image':
        return (
          <div className="space-y-4">
            {note.mediaUrl && (
              <div className="my-4 flex justify-center">
                <img src={note.mediaUrl} alt="Note media" className="max-h-80 rounded-md" />
              </div>
            )}
            <div className="whitespace-pre-wrap">{parsedContent}</div>
          </div>
        );
      case 'link':
        return (
          <div className="space-y-4">
            {note.mediaUrl && (
              <a 
                href={note.mediaUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-3 border rounded-md hover:bg-muted/50 transition-colors"
              >
                {note.mediaUrl}
              </a>
            )}
            <div className="whitespace-pre-wrap">{parsedContent}</div>
          </div>
        );
      default:
        return <div className="whitespace-pre-wrap">{parsedContent}</div>;
    }
  };

  return (
    <>
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
          {renderContent()}
          
          {backlinks.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                <Link className="h-4 w-4" />
                <span>Backlinks</span>
                <Badge variant="outline" className="ml-2">{backlinks.length}</Badge>
              </h3>
              <div className="text-sm text-muted-foreground">
                {backlinks.slice(0, 3).map(link => (
                  <div key={link.id} className="py-1">
                    {link.title}
                  </div>
                ))}
                {backlinks.length > 3 && (
                  <div className="text-xs text-primary mt-1 cursor-pointer hover:underline">
                    {backlinks.length - 3} more backlinks...
                  </div>
                )}
              </div>
            </div>
          )}
          
          {suggestedConnections.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                <Brain className="h-4 w-4" />
                <span>Related Notes</span>
              </h3>
              <div className="text-sm text-muted-foreground">
                {suggestedConnections.slice(0, 3).map(relatedNote => (
                  <div key={relatedNote.id} className="py-1">
                    {relatedNote.title}
                  </div>
                ))}
                {suggestedConnections.length > 3 && (
                  <div className="text-xs text-primary mt-1 cursor-pointer hover:underline">
                    {suggestedConnections.length - 3} more related notes...
                  </div>
                )}
              </div>
            </div>
          )}
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
    </>
  );
};

export default NoteView;
