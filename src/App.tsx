
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotesProvider } from "@/contexts/NotesContext";
import { FloatingAIButton } from "@/components/FloatingAIButton";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/AppLayout";
import KnowledgeGraph from "./pages/KnowledgeGraph";
import ErrorBoundary from "./components/ErrorBoundary";
import { useEffect } from "react";
import { useStatePersistence } from '@/hooks/useStatePersistence';
import { useNotes } from '@/contexts/NotesContext';
import { useFileSystem } from '@/hooks/useFileSystem';
import { useDebounce } from '@/hooks/useDebounce';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Note } from '@/types/note';

const queryClient = new QueryClient();

const AppContent = () => {
  const { loadState } = useStatePersistence();
  const { notes, setNotes } = useNotes();
  const { loadFiles } = useFileSystem();
  const debouncedNotes = useDebounce(notes, 1000);

  // Set the title and favicon when the app loads
  useEffect(() => {
    // Set the document title
    document.title = "SecondBrainer";
    
    // Create a link element for the favicon
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%238b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>';
    
    // Add it to the document head
    document.head.appendChild(link);
  }, []);

  // Load persisted state before fetching files
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load state from IndexedDB first
        await loadState();
        
        // Then load files from File System
        const files = await loadFiles();
        
        // Merge IndexedDB notes with files, preferring files for conflicts
        const mergedNotes = mergeNotes(notes, files);
        setNotes(mergedNotes);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, []);

  // Sync with File System in the background
  useEffect(() => {
    const syncWithFileSystem = async () => {
      try {
        const files = await loadFiles();
        const mergedNotes = mergeNotes(notes, files);
        setNotes(mergedNotes);
      } catch (error) {
        console.error('Failed to sync with file system:', error);
      }
    };

    syncWithFileSystem();
  }, [debouncedNotes]);

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/graph" element={<KnowledgeGraph />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};

// Helper function to merge notes from different sources
const mergeNotes = (indexedDBNotes: Note[], fileSystemNotes: Note[]): Note[] => {
  const merged = new Map<string, Note>();
  
  // Add IndexedDB notes first
  indexedDBNotes.forEach(note => {
    merged.set(note.id, note);
  });
  
  // Override with File System notes
  fileSystemNotes.forEach(note => {
    merged.set(note.id, note);
  });
  
  return Array.from(merged.values());
};

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <NotesProvider>
              <Toaster />
              <Sonner />
              <FloatingAIButton />
              <AppContent />
            </NotesProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
