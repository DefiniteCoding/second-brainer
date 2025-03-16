import React, { useState } from 'react';
import SearchBar from '@/components/home/SearchBar';
import NotesList from '@/components/home/NotesList';
import { Note } from '@/contexts/NotesContext';
import NoteDetailView from '@/components/home/NoteDetailView';

const HomePage: React.FC = () => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchResults, setSearchResults] = useState<Note[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchResults = (results: Note[] | null, searching: boolean) => {
    setSearchResults(results);
    setIsSearching(searching);
  };

  const handleNoteSelected = (note: Note) => {
    setSelectedNote(note);
  };

  const handleAddNote = () => {
    setSelectedNote({ id: '', title: '', content: '' });
  };

  return (
    <div className="min-h-screen">
      <SearchBar
        onNoteSelected={handleNoteSelected}
        onAddNote={handleAddNote}
        onSearchResults={handleSearchResults}
      />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6">
          {selectedNote ? (
            <NoteDetailView
              note={selectedNote}
              onBack={() => setSelectedNote(null)}
              isCreating={!selectedNote.id}
            />
          ) : (
            <NotesList
              searchResults={searchResults}
              isSearching={isSearching}
              onNoteSelected={handleNoteSelected}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage; 