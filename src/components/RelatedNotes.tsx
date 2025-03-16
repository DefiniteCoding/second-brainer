import React, { useState, useEffect } from 'react';
import { useNotes } from '@/contexts/NotesContext';
import { Note } from '@/contexts/NotesContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, SearchX, Link2, Unlink } from 'lucide-react';
import { searchNotes } from '@/services/search';

interface RelatedNotesProps {
  note: Note;
  onNoteClick: (note: Note) => void;
}

const RelatedNotes: React.FC<RelatedNotesProps> = ({ note, onNoteClick }) => {
  const { notes, connectNotes, disconnectNotes, findBacklinks, getSuggestedConnections } = useNotes();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const backlinks = findBacklinks(note.id);
  const suggestedConnections = getSuggestedConnections(note.id);
  const connectedNotes = notes.filter(n => note.connections?.includes(n.id));

  useEffect(() => {
    const performSearch = async () => {
      if (!search.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchNotes(notes, search, { contentTypes: [], tags: [] }, false);
        setSearchResults(results.filter(n => n.id !== note.id));
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [search, notes, note.id]);

  const displayedNotes = search ? searchResults : suggestedConnections;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for notes to connect..."
          className="w-full pl-9 pr-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      <ScrollArea className="h-[300px]">
        {isSearching ? (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <div className="animate-spin">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <span className="mt-2 text-sm text-muted-foreground">Searching...</span>
          </div>
        ) : displayedNotes.length > 0 ? (
          <div className="space-y-2 p-1">
            {displayedNotes.map((relatedNote) => (
              <div
                key={relatedNote.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 group"
              >
                <button
                  onClick={() => onNoteClick(relatedNote)}
                  className="flex-1 text-left"
                >
                  <h4 className="font-medium line-clamp-1">{relatedNote.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {relatedNote.content}
                  </p>
                </button>
                {note.connections?.includes(relatedNote.id) ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => disconnectNotes(note.id, relatedNote.id)}
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <Unlink className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => connectNotes(note.id, relatedNote.id)}
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <Link2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : search ? (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <SearchX className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p>No notes found matching your search.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <SearchX className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p>No suggested connections found.</p>
          </div>
        )}
      </ScrollArea>

      {(connectedNotes.length > 0 || backlinks.length > 0) && (
        <div className="space-y-4 mt-6">
          {connectedNotes.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Connected Notes</h3>
              <div className="space-y-2">
                {connectedNotes.map((connectedNote) => (
                  <div
                    key={connectedNote.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 group"
                  >
                    <button
                      onClick={() => onNoteClick(connectedNote)}
                      className="flex-1 text-left"
                    >
                      <h4 className="font-medium line-clamp-1">{connectedNote.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {connectedNote.content}
                      </p>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => disconnectNotes(note.id, connectedNote.id)}
                      className="opacity-0 group-hover:opacity-100"
                    >
                      <Unlink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {backlinks.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Mentioned In</h3>
              <div className="space-y-2">
                {backlinks.map((backlink) => (
                  <button
                    key={backlink.id}
                    onClick={() => onNoteClick(backlink)}
                    className="w-full p-2 text-left rounded-lg hover:bg-muted/50"
                  >
                    <h4 className="font-medium line-clamp-1">{backlink.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {backlink.content}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RelatedNotes;
