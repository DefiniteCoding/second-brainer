
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Database, Loader2 } from 'lucide-react';
import { useNotes } from '@/contexts/NotesContext';
import { loadDemoData } from '@/utils/demoNotes';
import { useToast } from '@/components/ui/use-toast';

const DemoDataLoader: React.FC = () => {
  const { addNote, addTag, tags, notes } = useNotes();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLoadDemoData = () => {
    setLoading(true);
    
    // Small timeout to allow UI to update with loading state
    setTimeout(() => {
      try {
        const noteCount = loadDemoData(addNote, addTag, tags);
        
        toast({
          title: "Demo Data Loaded",
          description: `Added ${noteCount} sample notes to showcase the application.`,
        });
      } catch (error) {
        console.error("Error loading demo data:", error);
        toast({
          title: "Error",
          description: "Failed to load demo data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      onClick={handleLoadDemoData}
      disabled={loading || notes.length > 0}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Database className="h-4 w-4" />
      )}
      <span>{notes.length > 0 ? "Demo Data Loaded" : "Load Demo Data"}</span>
    </Button>
  );
};

export default DemoDataLoader;
