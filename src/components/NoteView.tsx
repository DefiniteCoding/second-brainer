
import React from 'react';
import { Note } from '@/contexts/NotesContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash } from 'lucide-react';

interface NoteViewProps {
  note: Note;
  onBack: () => void;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

const NoteView: React.FC<NoteViewProps> = ({ note, onBack, onEdit, onDelete }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

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
            <p className="whitespace-pre-wrap">{note.content}</p>
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
            <p className="whitespace-pre-wrap">{note.content}</p>
          </div>
        );
      default:
        return <p className="whitespace-pre-wrap">{note.content}</p>;
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
