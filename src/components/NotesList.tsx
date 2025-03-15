
import React from 'react';
import { useNotes, Note } from '@/contexts/NotesContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Image, Link, Mic, FileCode, Music, Video, BookOpen, Star, FileCheck } from 'lucide-react';

interface NotesListProps {
  onNoteClick?: (note: Note) => void;
  notes?: Note[]; // Optional notes array for filtered views
  selectedNoteId?: string;
}

const NotesList: React.FC<NotesListProps> = ({ onNoteClick, notes: propNotes, selectedNoteId }) => {
  const { notes: contextNotes } = useNotes();
  const notes = propNotes || contextNotes;

  if (notes.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No notes yet. Create your first note!</p>
      </div>
    );
  }

  const getContentTypeIcon = (type: string, title: string) => {
    // Choose icon based on content type
    let icon = <FileText className="h-4 w-4 text-blue-500" />;
    
    if (type === 'image') {
      icon = <Image className="h-4 w-4 text-green-500" />;
    } else if (type === 'link') {
      icon = <Link className="h-4 w-4 text-purple-500" />;
    } else if (type === 'audio') {
      icon = <Mic className="h-4 w-4 text-red-500" />;
    } else if (type === 'code' || title.toLowerCase().includes('code')) {
      icon = <FileCode className="h-4 w-4 text-emerald-500" />;
    } else if (title.toLowerCase().includes('music')) {
      icon = <Music className="h-4 w-4 text-pink-500" />;
    } else if (title.toLowerCase().includes('video')) {
      icon = <Video className="h-4 w-4 text-amber-500" />;
    } else if (title.toLowerCase().includes('book')) {
      icon = <BookOpen className="h-4 w-4 text-indigo-500" />;
    } else if (title.toLowerCase().includes('important')) {
      icon = <Star className="h-4 w-4 text-yellow-500" />;
    } else if (title.toLowerCase().includes('todo')) {
      icon = <FileCheck className="h-4 w-4 text-cyan-500" />;
    }
    
    return icon;
  };

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <Card 
          key={note.id}
          className={`transition-all cursor-pointer hover:shadow-md ${
            selectedNoteId === note.id 
              ? 'border-primary bg-primary/5 shadow-sm' 
              : 'hover:bg-accent/50'
          }`}
          onClick={() => onNoteClick && onNoteClick(note)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getContentTypeIcon(note.contentType, note.title)}
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
                    variant="outline"
                    className="text-xs px-2 py-0 border-none"
                    style={{ 
                      backgroundColor: `${tag.color}20`,
                      color: tag.color 
                    }}
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
