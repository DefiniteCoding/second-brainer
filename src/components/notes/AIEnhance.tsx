
import React, { useState } from 'react';
import { Note, useNotes } from '@/contexts/NotesContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lightbulb, Tag, Check, X, RotateCcw, Link, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { hasApiKey } from '@/services/ai';
import { SummaryOptions } from '@/types/ai.types';
import * as aiService from '@/services/ai';

interface AIEnhanceProps {
  note: Note;
}

const AIEnhance: React.FC<AIEnhanceProps> = ({ note }) => {
  const { updateNote, notes, connectNotes, addTag } = useNotes();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("summary");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string[] | null>(null);
  const [relatedNotes, setRelatedNotes] = useState<{ id: string; title: string; score?: number }[] | null>(null);
  const [enhancingNote, setEnhancingNote] = useState(false);

  const generateSummary = async () => {
    if (!hasApiKey()) {
      toast({
        title: "API Key Required",
        description: "Please set your Gemini API key in AI Settings first.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await aiService.generateSummary(note.content);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
      } else if (result.summary) {
        setSummary(result.summary);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate summary",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const extractKeywords = async () => {
    if (!hasApiKey()) {
      toast({
        title: "API Key Required",
        description: "Please set your Gemini API key in AI Settings first.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await aiService.extractKeywords(note.content);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
      } else if (result.keywords) {
        setKeywords(result.keywords);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract keywords",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const findRelatedNotes = async () => {
    if (!hasApiKey()) {
      toast({
        title: "API Key Required",
        description: "Please set your Gemini API key in AI Settings first.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await aiService.findRelatedNotes(note.content);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
      } else if (result.concepts) {
        // Get potential related notes based on the extracted concepts
        const relatedNoteIds = await searchRelatedNotes(result.concepts);
        
        const related = relatedNoteIds
          .map(id => {
            const foundNote = notes.find(n => n.id === id);
            return foundNote ? { id, title: foundNote.title } : null;
          })
          .filter((n): n is { id: string; title: string } => n !== null);
        
        setRelatedNotes(related);
      }
    } catch (error) {
      console.error('Error finding related notes:', error);
      toast({
        title: "Error",
        description: "Failed to find related notes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Search for related notes based on concepts
  const searchRelatedNotes = async (concepts: string[]): Promise<string[]> => {
    const relatedNoteIds: string[] = [];
    const noteContentMap = new Map<string, string>();
    
    // Create a map of note content for faster searching
    notes.forEach(n => {
      if (n.id !== note.id) {
        noteContentMap.set(n.id, `${n.title} ${n.content}`.toLowerCase());
      }
    });
    
    // Search for each concept in all notes
    concepts.forEach(concept => {
      const conceptLower = concept.toLowerCase();
      noteContentMap.forEach((content, id) => {
        if (content.includes(conceptLower) && !relatedNoteIds.includes(id)) {
          relatedNoteIds.push(id);
        }
      });
    });
    
    return relatedNoteIds.slice(0, 5); // Limit to 5 related notes
  };

  const applyEnhancement = async () => {
    setEnhancingNote(true);
    
    try {
      let updatedNote = { ...note };
      
      // Apply summary if available
      if (summary) {
        updatedNote.content = `> ${summary.trim().replace(/\n/g, '\n> ')}\n\n${note.content}`;
      }
      
      // Apply tag keywords if available
      if (keywords && keywords.length > 0) {
        // Create new tags from keywords and add them to the note
        const newTags = [...updatedNote.tags];
        
        for (const keyword of keywords) {
          // Generate a random color for the new tag
          const tagColors = ['#EF4444', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];
          const randomColor = tagColors[Math.floor(Math.random() * tagColors.length)];
          
          // Add the tag to the note
          const tagId = addTag({ name: keyword, color: randomColor });
          
          // Check if the tag is already on the note
          if (!newTags.some(tag => tag.name.toLowerCase() === keyword.toLowerCase())) {
            newTags.push({ id: tagId, name: keyword, color: randomColor });
          }
        }
        
        updatedNote.tags = newTags;
      }
      
      // Apply connections if available
      if (relatedNotes && relatedNotes.length > 0) {
        // Create connections array if it doesn't exist
        const connections = updatedNote.connections || [];
        
        // Add each related note as a connection
        relatedNotes.forEach(related => {
          if (!connections.includes(related.id)) {
            connections.push(related.id);
          }
          
          // Create a bi-directional connection
          connectNotes(note.id, related.id);
        });
        
        updatedNote.connections = connections;
      }
      
      // Save the updated note
      await updateNote(note.id, updatedNote);
      
      toast({
        title: "Note Enhanced",
        description: "AI enhancements have been applied to your note",
      });
    } catch (error) {
      console.error('Error applying enhancements:', error);
      toast({
        title: "Error",
        description: "Failed to apply enhancements",
        variant: "destructive"
      });
    } finally {
      setEnhancingNote(false);
      setSummary(null);
      setKeywords(null);
      setRelatedNotes(null);
    }
  };

  const discardChanges = () => {
    setSummary(null);
    setKeywords(null);
    setRelatedNotes(null);
  };

  return (
    <div>
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
        <Sparkles className="h-4 w-4 text-purple-500" />
        <span>AI Enhancements</span>
      </h3>
      
      <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 mb-4">
          <TabsTrigger value="summary" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
            Summary
          </TabsTrigger>
          <TabsTrigger value="keywords" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
            Generate Tags
          </TabsTrigger>
          <TabsTrigger value="connections" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
            Connections
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="mt-0">
          {summary ? (
            <Card>
              <CardContent className="p-4 text-sm">
                {summary}
              </CardContent>
            </Card>
          ) : (
            <Button 
              onClick={generateSummary} 
              variant="outline" 
              size="sm" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Summary"
              )}
            </Button>
          )}
        </TabsContent>
        
        <TabsContent value="keywords" className="mt-0">
          {keywords && keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, i) => (
                <Badge key={i} variant="outline" className="bg-primary/10">
                  <Tag className="h-3 w-3 mr-1" />
                  {keyword}
                </Badge>
              ))}
            </div>
          ) : (
            <Button 
              onClick={extractKeywords} 
              variant="outline" 
              size="sm" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Tags"
              )}
            </Button>
          )}
        </TabsContent>
        
        <TabsContent value="connections" className="mt-0">
          {relatedNotes && relatedNotes.length > 0 ? (
            <div className="space-y-2">
              {relatedNotes.map(related => (
                <div key={related.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">{related.title}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Button 
              onClick={findRelatedNotes} 
              variant="outline" 
              size="sm" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Finding...
                </>
              ) : (
                "Find Related Notes"
              )}
            </Button>
          )}
        </TabsContent>
      </Tabs>
      
      {(summary || (keywords && keywords.length > 0) || (relatedNotes && relatedNotes.length > 0)) && (
        <div className="flex justify-end gap-2 mt-4">
          <Button 
            variant="outline"
            size="sm"
            onClick={discardChanges}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            <span>Discard</span>
          </Button>
          <Button 
            size="sm"
            onClick={applyEnhancement}
            className="flex items-center gap-1"
            disabled={enhancingNote}
          >
            {enhancingNote ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Apply to Note</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AIEnhance;
