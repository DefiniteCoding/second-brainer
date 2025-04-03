
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
import { useNotes } from '@/contexts/NotesContext';
import { useFileSystem } from '@/hooks/useFileSystem';
import { useDebounce } from '@/hooks/useDebounce';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Note } from '@/types/note';
import { mergeNotes } from './contexts/notes/notesUtils';
import SearchBar from './components/SearchBar';

const queryClient = new QueryClient();

const AppWithRouter = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

const AppContent = () => {
  const { notes, setNotes } = useNotes();
  const { loadFiles } = useFileSystem();
  const debouncedNotes = useDebounce(notes, 1000);

  useEffect(() => {
    document.title = "SecondBrainer";
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%238b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const files = await loadFiles();
        if (files.length > 0) {
          setNotes(files);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, []);

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
    <AppLayout>
      <div className="container max-w-screen-2xl px-4 pt-4">
        <SearchBar />
      </div>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/graph" element={<KnowledgeGraph />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
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
              <AppWithRouter />
            </NotesProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
