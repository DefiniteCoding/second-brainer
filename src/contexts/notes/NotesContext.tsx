
import React, { createContext, useContext } from 'react';
import { NotesContextType } from './types';
import { useNotesState } from './hooks';

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const notesState = useNotesState();
  
  return (
    <NotesContext.Provider value={notesState}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
