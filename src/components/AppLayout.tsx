import React from 'react';
import { NotesProvider } from '@/contexts/NotesContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <NotesProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </div>
    </NotesProvider>
  );
};

export default AppLayout;
