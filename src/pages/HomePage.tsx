
import React, { useState } from 'react';
import SearchBar from '@/components/home/SearchBar';
import NotesList from '@/components/home/NotesList';
import { Note, useNotes } from '@/contexts/NotesContext';
import NoteDetailView from '@/components/home/NoteDetailView';

const HomePage: React.FC = () => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchResults, setSearchResults] = useState<Note[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleSearchResults = (results: Note[] | null, searching: boolean) => {
    setSearchResults(results);
    setIsSearching(searching);
  };

  const handleNoteSelected = (note: Note) => {
    setSelectedNote(note);
    setIsCreating(false);
  };

  const handleAddNote = () => {
    setSelectedNote(null);
    setIsCreating(true);
  };

  const handleBack = () => {
    setSelectedNote(null);
    setIsCreating(false);
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
              selectedNote={selectedNote}
              isLoading={false}
              onBack={handleBack}
              onDelete={() => {}}
              isEditing={false}
              onEdit={() => {}}
              isCreating={false}
            />
          ) : isCreating ? (
            <NoteDetailView
              selectedNote={null}
              isLoading={false}
              onBack={handleBack}
              onDelete={() => {}}
              isEditing={false}
              onEdit={() => {}}
              isCreating={true}
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
