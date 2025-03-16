import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sparkles, Tag, Link2, Text } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotes } from '@/contexts/NotesContext';
import { useToast } from '@/components/ui/use-toast';
import { extractKeywords, findRelatedNotes, generateSummary } from '@/services/ai';

export const FloatingAIButton = () => {
  console.log('FloatingAIButton rendering');
  
  useEffect(() => {
    console.log('FloatingAIButton mounted');
    return () => {
      console.log('FloatingAIButton unmounted');
    };
  }, []);

  const [isProcessing, setIsProcessing] = useState(false);
  const { notes, updateNote } = useNotes();
  const { toast } = useToast();

  useEffect(() => {
    console.log('Notes from context:', notes);
  }, [notes]);

  const handleAnalyzeAllNotes = async () => {
    if (!notes.length) {
      toast({
        title: "No Notes Found",
        description: "Create some notes first before running analysis.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Process all notes in parallel
      await Promise.all(notes.map(async (note) => {
        try {
          // Extract keywords and find related concepts in parallel for each note
          const [keywordsResponse, relatedConceptsResponse] = await Promise.all([
            extractKeywords(note.content),
            findRelatedNotes(note.content)
          ]);

          const updates: Partial<typeof note> = {};

          if (keywordsResponse.success && keywordsResponse.data?.keywords) {
            updates.tags = keywordsResponse.data.keywords.map(keyword => ({
              id: crypto.randomUUID(),
              name: keyword,
              color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
            }));
          }

          if (relatedConceptsResponse.success && relatedConceptsResponse.data?.concepts) {
            // Store concepts for later relationship building
            updates.concepts = relatedConceptsResponse.data.concepts;
          }

          // Only update if we have changes
          if (Object.keys(updates).length > 0) {
            await updateNote(note.id, {
              ...note,
              ...updates
            });
          }
        } catch (error) {
          console.error(`Failed to process note ${note.id}:`, error);
        }
      }));

      // After processing all notes, find relationships based on concept similarity
      const notesWithConcepts = notes.map(note => ({
        ...note,
        concepts: note.concepts || []
      }));

      for (const note of notesWithConcepts) {
        if (!note.concepts?.length) continue;

        const relatedNotes = notesWithConcepts
          .filter(other => other.id !== note.id)
          .map(other => ({
            id: other.id,
            similarity: calculateConceptSimilarity(note.concepts!, other.concepts || [])
          }))
          .filter(relation => relation.similarity > 0.3) // Only keep strong relationships
          .map(relation => relation.id);

        if (relatedNotes.length > 0) {
          await updateNote(note.id, {
            ...note,
            relationships: relatedNotes
          });
        }
      }

      toast({
        title: "Analysis Complete",
        description: `Processed ${notes.length} notes and updated their tags and connections.`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Some notes could not be processed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to calculate similarity between concept arrays
  const calculateConceptSimilarity = (concepts1: string[], concepts2: string[]): number => {
    const set1 = new Set(concepts1.map(c => c.toLowerCase()));
    const set2 = new Set(concepts2.map(c => c.toLowerCase()));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  };

  const handleSuggestTitles = async () => {
    const notesWithGenericTitles = notes.filter(note => 
      note.title?.startsWith('Note ') && /\d/.test(note.title)
    );

    if (!notesWithGenericTitles.length) {
      toast({
        title: "No Generic Titles Found",
        description: "There are no notes with generic titles to update.",
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Process notes with generic titles in parallel
      await Promise.all(notesWithGenericTitles.map(async (note) => {
        try {
          const summary = await generateSummary(note.content);
          
          if (summary.success && summary.data) {
            await updateNote(note.id, {
              ...note,
              title: summary.data
            });
          }
        } catch (error) {
          console.error(`Failed to generate title for note ${note.id}:`, error);
        }
      }));

      toast({
        title: "Titles Updated",
        description: `Generated new titles for ${notesWithGenericTitles.length} notes.`,
      });
    } catch (error) {
      toast({
        title: "Title Generation Failed",
        description: "Some titles could not be generated. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }} className="!fixed !bottom-6 !right-6 !z-[9999]">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            style={{ 
              height: '48px', 
              width: '48px',
              borderRadius: '9999px',
              background: 'linear-gradient(to right, rgb(99, 102, 241), rgb(168, 85, 247))',
              border: 'none',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              color: 'white',
              transform: 'scale(1)',
              transition: 'transform 0.2s'
            }}
            className={cn(
              "!h-12 !w-12 !rounded-full hover:!scale-105 !transition-transform !bg-gradient-to-r !from-indigo-500 !to-purple-500 hover:!from-indigo-600 hover:!to-purple-600 !shadow-lg !border-0 !text-white",
              isProcessing && "!animate-pulse"
            )}
          >
            <Sparkles className="!h-5 !w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          align="end" 
          className="w-72 p-2"
          sideOffset={5}
        >
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm"
              onClick={handleAnalyzeAllNotes}
              disabled={isProcessing}
            >
              <div className="flex gap-2 items-center">
                <div className="flex -space-x-1">
                  <Tag className="h-4 w-4 text-blue-500" />
                  <Link2 className="h-4 w-4 text-purple-500" />
                </div>
              </div>
              Analyze all notes (tags & connections)
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm"
              onClick={handleSuggestTitles}
              disabled={isProcessing}
            >
              <Text className="h-4 w-4 text-green-500" />
              Generate titles for generic notes
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}; 