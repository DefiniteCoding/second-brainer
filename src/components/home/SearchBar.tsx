
import React from 'react';
import { Note, useNotes } from '@/contexts/NotesContext';
import HeaderSection from './HeaderSection';
import HeaderActions from './HeaderActions';
import { UnifiedSearch } from './UnifiedSearch';

interface SearchBarProps {
  onNoteSelected: (note: Note) => void;
  onAddNote: () => void;
  onSearchResults: (results: Note[] | null, isSearching: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onNoteSelected, 
  onAddNote, 
  onSearchResults 
}) => {
  return (
    <div className="border-b">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4">
        <div className="mr-4 flex">
          <HeaderSection />
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <UnifiedSearch onSearchResults={onSearchResults} />
          </div>
          
          <HeaderActions onAddNote={onAddNote} />
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
