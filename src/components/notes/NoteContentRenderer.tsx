
import React, { useMemo } from 'react';
import { Note } from '@/contexts/NotesContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NoteContentRendererProps {
  note: Note;
  processedContent: React.ReactNode;
  progressiveMode: string | null;
}

const NoteContentRenderer: React.FC<NoteContentRendererProps> = ({
  note,
  processedContent,
  progressiveMode
}) => {
  const summarizedContent = useMemo(() => {
    if (!progressiveMode) return null;
    
    const content = typeof processedContent === 'string' 
      ? processedContent 
      : note.content;
    
    if (progressiveMode === 'level1') {
      // Main points summarization (roughly 50% of content)
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const importantSentences = sentences
        .filter((_, i) => i % 2 === 0 || sentences.length < 5)
        .join('. ') + '.';
      return importantSentences;
    } else if (progressiveMode === 'level2') {
      // Key ideas summarization (roughly 25% of content)
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      // Extract first sentence and any sentences with important keywords
      const keywordList = ['important', 'key', 'critical', 'essential', 'main', 'significant'];
      const keyIdeas = [sentences[0]];
      
      sentences.slice(1).forEach(sentence => {
        const lowerSentence = sentence.toLowerCase();
        if (keywordList.some(keyword => lowerSentence.includes(keyword))) {
          keyIdeas.push(sentence);
        }
      });
      
      // If we have too few sentences, add more based on position
      if (keyIdeas.length < Math.ceil(sentences.length / 4)) {
        sentences.forEach((sentence, index) => {
          if (index % 4 === 0 && !keyIdeas.includes(sentence)) {
            keyIdeas.push(sentence);
          }
        });
      }
      
      return keyIdeas.join('. ') + '.';
    }
    
    return null;
  }, [note.content, processedContent, progressiveMode]);
  
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      {summarizedContent ? (
        <div className="p-4 border rounded-md bg-muted/50">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {summarizedContent}
          </ReactMarkdown>
        </div>
      ) : (
        typeof processedContent === 'string' ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {processedContent}
          </ReactMarkdown>
        ) : (
          processedContent
        )
      )}
    </div>
  );
};

export default NoteContentRenderer;
