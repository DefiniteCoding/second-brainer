import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sparkles, Tag, Link2, Text, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotes } from '@/contexts/NotesContext';
import { useToast } from '@/components/ui/use-toast';
import { extractKeywords, findRelatedNotes, generateSummary } from '@/services/ai';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export const FloatingAIButton = () => {
  console.log('FloatingAIButton rendering');
  
  useEffect(() => {
    console.log('FloatingAIButton mounted');
    return () => {
      console.log('FloatingAIButton unmounted');
    };
  }, []);

  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestedTitles, setSuggestedTitles] = useState<Array<{ noteId: string, oldTitle: string, newTitle: string }>>([]);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [showTitleDialog, setShowTitleDialog] = useState(false);
  const { notes, updateNote, addTag } = useNotes();
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
      
      // Process notes one at a time to avoid race conditions
      for (const note of notes) {
        try {
          // Extract keywords and concepts
          const [keywordsResponse, relatedConceptsResponse] = await Promise.all([
            extractKeywords(note.content),
            findRelatedNotes(note.content)
          ]);

          const keywords = keywordsResponse.success ? keywordsResponse.data?.keywords || [] : [];
          const concepts = relatedConceptsResponse.success ? relatedConceptsResponse.data?.concepts || [] : [];

          // Create tags for keywords
          const noteTags = [];
          for (const keyword of keywords) {
            try {
              const tagId = addTag({
                name: keyword,
                color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
              });
              if (tagId) {
                noteTags.push({
                  id: tagId,
                  name: keyword,
                  color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
                });
              }
            } catch (error) {
              console.error(`Failed to create tag for keyword ${keyword}:`, error);
            }
          }

          // Update note with new tags and concepts
          try {
            await updateNote(note.id, {
              ...note,
              tags: [...(note.tags || []), ...noteTags],
              concepts: concepts
            });
          } catch (error) {
            console.error(`Failed to update note ${note.id} with tags:`, error);
            throw error;
          }

          // Find and update connections
          if (concepts.length > 0) {
            const relatedNoteIds = notes
              .filter(other => other.id !== note.id && other.concepts?.length > 0)
              .map(other => ({
                id: other.id,
                similarity: calculateConceptSimilarity(concepts, other.concepts || [])
              }))
              .filter(relation => relation.similarity > 0.3)
              .map(relation => relation.id);

            if (relatedNoteIds.length > 0) {
              try {
                await updateNote(note.id, {
                  ...note,
                  connections: [...new Set([...(note.connections || []), ...relatedNoteIds])]
                });
              } catch (error) {
                console.error(`Failed to update connections for note ${note.id}:`, error);
              }
            }
          }
        } catch (error) {
          console.error(`Failed to process note ${note.id}:`, error);
          toast({
            title: "Note Processing Failed",
            description: `Failed to process note "${note.title}". Continuing with remaining notes.`,
            variant: "destructive"
          });
        }
      }

      toast({
        title: "Analysis Complete",
        description: `Processed ${notes.length} notes and updated their tags and connections.`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
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
      
      // Generate titles for all eligible notes
      const titleSuggestions = await Promise.all(notesWithGenericTitles.map(async (note) => {
        try {
          const summary = await generateSummary(note.content);
          
          if (summary.success && summary.data?.summary) {
            return {
              noteId: note.id,
              oldTitle: note.title || '',
              newTitle: summary.data.summary
            };
          }
          return null;
        } catch (error) {
          console.error(`Failed to generate title for note ${note.id}:`, error);
          return null;
        }
      }));

      // Filter out failed attempts and show dialog
      const validSuggestions = titleSuggestions.filter((s): s is NonNullable<typeof s> => s !== null);
      if (validSuggestions.length > 0) {
        setSuggestedTitles(validSuggestions);
        setSelectedNotes(new Set(validSuggestions.map(s => s.noteId)));
        setShowTitleDialog(true);
      } else {
        toast({
          title: "No Titles Generated",
          description: "Failed to generate any new titles. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Title generation error:', error);
      toast({
        title: "Title Generation Failed",
        description: "Failed to generate titles. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmTitles = async () => {
    try {
      setIsProcessing(true);
      
      const selectedSuggestions = suggestedTitles.filter(s => selectedNotes.has(s.noteId));
      let successCount = 0;
      
      // Process title updates sequentially
      for (const suggestion of selectedSuggestions) {
        try {
          const note = notes.find(n => n.id === suggestion.noteId);
          if (!note) {
            console.error(`Note ${suggestion.noteId} not found`);
            continue;
          }

          await updateNote(note.id, {
            ...note,
            title: suggestion.newTitle
          });
          
          successCount++;
        } catch (error) {
          console.error(`Failed to update title for note ${suggestion.noteId}:`, error);
          toast({
            title: "Update Failed",
            description: `Failed to update title for "${suggestion.oldTitle}". Continuing with remaining notes.`,
            variant: "destructive"
          });
        }
      }

      if (successCount > 0) {
        toast({
          title: "Titles Updated",
          description: `Successfully updated ${successCount} out of ${selectedSuggestions.length} titles.`,
        });
      } else {
        toast({
          title: "Update Failed",
          description: "No titles were updated. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating titles:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update titles. Please try again.",
        variant: "destructive"
      });
    } finally {
      setShowTitleDialog(false);
      setSuggestedTitles([]);
      setSelectedNotes(new Set());
      setIsProcessing(false);
    }
  };

  return (
    <>
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

      <Dialog open={showTitleDialog} onOpenChange={setShowTitleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Title Changes</DialogTitle>
            <DialogDescription>
              Select which notes you want to update with the suggested titles.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] mt-4">
            <div className="space-y-4">
              {suggestedTitles.map((suggestion) => (
                <div key={suggestion.noteId} className="flex items-start space-x-4 p-2 rounded hover:bg-accent">
                  <Checkbox
                    id={suggestion.noteId}
                    checked={selectedNotes.has(suggestion.noteId)}
                    onCheckedChange={(checked) => {
                      setSelectedNotes(prev => {
                        const newSet = new Set(prev);
                        if (checked) {
                          newSet.add(suggestion.noteId);
                        } else {
                          newSet.delete(suggestion.noteId);
                        }
                        return newSet;
                      });
                    }}
                  />
                  <div className="flex-1 space-y-1">
                    <label
                      htmlFor={suggestion.noteId}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Current: {suggestion.oldTitle}
                    </label>
                    <p className="text-sm text-muted-foreground">
                      New: {suggestion.newTitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowTitleDialog(false)}
              disabled={isProcessing}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              onClick={handleConfirmTitles}
              disabled={isProcessing || selectedNotes.size === 0}
            >
              <Check className="h-4 w-4 mr-1" />
              Update Selected ({selectedNotes.size})
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}; 