
import React from 'react';
import { useNotes, Note } from '@/contexts/NotesContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Image, Link, Mic } from 'lucide-react';

interface NotesListProps {
  onNoteClick?: (note: Note) => void;
  notes?: Note[]; // Optional notes array for filtered views
}

const NotesList: React.FC<NotesListProps> = ({ onNoteClick, notes: propNotes }) => {
  const { notes: contextNotes } = useNotes();
  const notes = propNotes || contextNotes;

  if (notes.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No notes yet. Create your first note!</p>
      </div>
    );
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'link':
        return <Link className="h-4 w-4" />;
      case 'audio':
        return <Mic className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <Card 
          key={note.id}
          className="hover:bg-note-hover transition-colors cursor-pointer border-note-border"
          onClick={() => onNoteClick && onNoteClick(note)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getContentTypeIcon(note.contentType)}
                  <h3 className="font-medium leading-none">{note.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {note.content}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(note.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {note.tags.map(tag => (
                  <Badge 
                    key={tag.id} 
                    style={{ backgroundColor: tag.color }}
                    className="text-white text-xs px-2 py-0"
                    variant="outline"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NotesList;
