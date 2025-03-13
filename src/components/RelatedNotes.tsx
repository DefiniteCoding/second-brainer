
import React, { useState } from 'react';
import { Note, useNotes } from '@/contexts/NotesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Link, 
  Unlink, 
  Search, 
  SearchX,
  Brain,
  MessageSquareCode
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RelatedNotesProps {
  note: Note;
  backlinks: Note[];
  suggestions: Note[];
}

const RelatedNotes: React.FC<RelatedNotesProps> = ({ note, backlinks, suggestions }) => {
  const { notes, connectNotes, disconnectNotes } = useNotes();
  const [search, setSearch] = useState('');
  
  // Explicit connections
  const connections = (note.connections || [])
    .map(id => notes.find(n => n.id === id))
    .filter((n): n is Note => n !== undefined);
  
  // Filter notes for potential connections
  const filteredNotes = notes
    .filter(n => n.id !== note.id) // Exclude current note
    .filter(n => !connections.some(conn => conn.id === n.id)) // Exclude already connected notes
    .filter(n => 
      search === '' || 
      n.title.toLowerCase().includes(search.toLowerCase()) || 
      n.content.toLowerCase().includes(search.toLowerCase())
    );

  const handleConnect = (targetId: string) => {
    connectNotes(note.id, targetId);
  };

  const handleDisconnect = (targetId: string) => {
    disconnectNotes(note.id, targetId);
  };

  const renderNoteCard = (relatedNote: Note, isConnected: boolean = false) => (
    <Card key={relatedNote.id} className="mb-2 border-note-border">
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-medium">{relatedNote.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {relatedNote.content}
            </p>
            {relatedNote.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {relatedNote.tags.map(tag => (
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
          </div>
          <div className="shrink-0 ml-4">
            {isConnected ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDisconnect(relatedNote.id)}
                className="h-8 flex items-center gap-1"
              >
                <Unlink className="h-3 w-3" />
                <span>Disconnect</span>
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleConnect(relatedNote.id)}
                className="h-8 flex items-center gap-1"
              >
                <Link className="h-3 w-3" />
                <span>Connect</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4">
      <Tabs defaultValue="connections">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="connections" className="flex-1">
            <Link className="h-4 w-4 mr-2" />
            Connections ({connections.length})
          </TabsTrigger>
          <TabsTrigger value="backlinks" className="flex-1">
            <Link className="h-4 w-4 mr-2 rotate-180" />
            Backlinks ({backlinks.length})
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex-1">
            <Brain className="h-4 w-4 mr-2" />
            Suggested ({suggestions.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            All Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections">
          <div className="space-y-2">
            <h3 className="text-sm font-medium mb-2">Explicitly Connected Notes</h3>
            {connections.length > 0 ? (
              connections.map(connectedNote => renderNoteCard(connectedNote, true))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Link className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>No explicit connections yet.</p>
                <p className="text-sm mt-2">Create connections to build your knowledge network.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="backlinks">
          <div className="space-y-2">
            <h3 className="text-sm font-medium mb-2">Notes Referring to This Note</h3>
            {backlinks.length > 0 ? (
              backlinks.map(backlinkNote => renderNoteCard(backlinkNote))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <SearchX className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>No backlinks found.</p>
                <p className="text-sm mt-2">Other notes that link to this one will appear here.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="suggestions">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">AI-Suggested Related Notes</h3>
              <div className="flex items-center text-xs text-muted-foreground">
                <MessageSquareCode className="h-3 w-3 mr-1" />
                <span>Content similarity based</span>
              </div>
            </div>
            {suggestions.length > 0 ? (
              suggestions.map(suggestedNote => renderNoteCard(suggestedNote))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>No related notes found.</p>
                <p className="text-sm mt-2">Create more notes to see AI-suggested connections.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search for notes to connect..." 
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            {filteredNotes.length > 0 ? (
              filteredNotes.map(filteredNote => renderNoteCard(filteredNote))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <SearchX className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>No notes found matching your search.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RelatedNotes;
