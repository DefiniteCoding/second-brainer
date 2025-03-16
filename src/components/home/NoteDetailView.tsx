import React, { useState } from 'react';
import { Note, useNotes } from '@/contexts/NotesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Image as ImageIcon, Link as LinkIcon, Mic, Send, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import NoteView from '@/components/NoteView';

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
  const [isEditing, setIsEditing] = useState(!selectedNote);
  const [title, setTitle] = useState(selectedNote?.title || '');
  const [content, setContent] = useState(selectedNote?.content || '');
  const [isRecording, setIsRecording] = useState(false);

  const handleSave = async () => {
    if (selectedNote) {
      await updateNote(selectedNote.id, { title, content });
    } else {
      await createNote({ title, content });
    }
    setIsEditing(false);
  };

  const handleAddImage = () => {
    // TODO: Implement image upload
    const imageMarkdown = '![Image description](image-url)';
    setContent(prev => prev + '\n' + imageMarkdown);
  };

  const handleAddLink = () => {
    const linkMarkdown = '[Link text](url)';
    setContent(prev => prev + '\n' + linkMarkdown);
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording
    if (isRecording) {
      const audioMarkdown = '🎤 [Audio recording](audio-url)';
      setContent(prev => prev + '\n' + audioMarkdown);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-muted/5">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-32 bg-muted rounded mb-4"></div>
          <div className="h-4 w-48 bg-muted rounded mb-2"></div>
          <div className="h-4 w-32 bg-muted rounded mb-4"></div>
          <div className="h-32 w-full max-w-md bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!selectedNote && !isEditing) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-muted/5">
        <div className="p-6 rounded-full bg-muted/30 mb-6">
          <BookOpen className="h-16 w-16 text-indigo-400 opacity-70" />
        </div>
        <h2 className="text-xl font-medium mb-3 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Start writing a new note
        </h2>
        <Button 
          onClick={() => setIsEditing(true)}
          className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
        >
          Create Note
        </Button>
      </div>
    );
  }

  if (isEditing || !selectedNote) {
    return (
      <div className="h-full bg-card">
        <div className="h-full bg-muted/5 border-l p-4">
          <div className="flex items-center justify-between mb-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="text-xl font-medium bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(false)}
                className="rounded-full hover:bg-red-50 text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSave}
                className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your note..."
                className="min-h-[300px] bg-transparent border-none focus-visible:ring-0 resize-none"
              />
              
              <div className="flex gap-2 sticky bottom-0 bg-background/80 backdrop-blur-sm p-2 rounded-lg border">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAddImage}
                  className="rounded-full"
                  title="Add Image"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAddLink}
                  className="rounded-full"
                  title="Add Link"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleRecording}
                  className={`rounded-full ${isRecording ? 'bg-red-50 text-red-500' : ''}`}
                  title="Record Voice"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card">
      <div className="h-full bg-muted/5 border-l">
        <NoteView 
          note={selectedNote}
          onBack={onBack}
          onEdit={() => setIsEditing(true)}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default NoteDetailView;
