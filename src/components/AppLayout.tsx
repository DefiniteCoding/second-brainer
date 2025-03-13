
import React from 'react';
import { NotesProvider } from '@/contexts/NotesContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <NotesProvider>
      <div className="min-h-screen bg-background">
        <div className="container max-w-6xl mx-auto py-8 px-4 md:px-6">
          {children}
        </div>
      </div>
    </NotesProvider>
  );
};

export default AppLayout;
