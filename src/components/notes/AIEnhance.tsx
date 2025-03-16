import React, { useState } from 'react';
import { Note, useNotes } from '@/contexts/NotesContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lightbulb, Tag, Check, X, RotateCcw, Link } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { setApiKey, getApiKey, hasApiKey } from '@/services/api/geminiApi';
import { generateSummary } from '@/services/ai/summaryService';
import { extractKeywords as getKeywords } from '@/services/ai/keywordService';
import { findRelatedNotes as getRelatedNotes } from '@/services/ai/relationService';

interface AIEnhanceProps {
  note: Note;
}

const AIEnhance: React.FC<AIEnhanceProps> = ({ note }) => {
  const { updateNote, notes, connectNotes } = useNotes();
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
      const result = await generateSummary(note.content);
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
      const result = await getKeywords(note.content);
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
      const result = await getRelatedNotes(note, notes);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
      } else if (result.suggestedConnections) {
        const related = result.suggestedConnections
          .map(id => {
            const foundNote = notes.find(n => n.id === id);
            return foundNote ? { id, title: foundNote.title } : null;
          })
          .filter((n): n is { id: string; title: string } => n !== null);
        
        setRelatedNotes(related);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to find related notes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyEnhancement = () => {
    setEnhancingNote(true);
    
    let updatedContent = note.content;
    
    if (summary) {
      updatedContent = `> ${summary.trim().replace(/\n/g, '\n> ')}\n\n${updatedContent}`;
    }
    
    updateNote(note.id, { content: updatedContent });
    
    if (relatedNotes) {
      relatedNotes.forEach(related => {
        connectNotes(note.id, related.id);
      });
    }
    
    toast({
      title: "Note Enhanced",
      description: "AI enhancements have been applied to your note",
    });
    
    setEnhancingNote(false);
    setSummary(null);
    setKeywords(null);
    setRelatedNotes(null);
  };

  const discardChanges = () => {
    setSummary(null);
    setKeywords(null);
    setRelatedNotes(null);
  };

  return (
    <div className="mt-4 border-t pt-4">
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
            Keywords
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
              {loading ? "Generating..." : "Generate Summary"}
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
              {loading ? "Extracting..." : "Extract Keywords"}
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
              {loading ? "Finding..." : "Find Related Notes"}
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
            <Check className="h-4 w-4" />
            <span>Apply to Note</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default AIEnhance;
