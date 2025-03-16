
import React from 'react';
import { Note } from '@/contexts/NotesContext';
import SearchPanel from '@/components/SearchPanel';

interface SearchWrapperProps {
  onNoteSelected: (note: Note) => void;
}

const SearchWrapper: React.FC<SearchWrapperProps> = ({ onNoteSelected }) => {
  return (
    <SearchPanel onNoteSelected={onNoteSelected} />
  );
};

export default SearchWrapper;
