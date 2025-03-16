import React, { useMemo } from 'react';
import { Note } from '@/contexts/NotesContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
  
  // Check if processedContent is an array of React elements (for content with note mentions)
  const isProcessedContentArray = Array.isArray(processedContent);
  
  return (
    <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground">
      {summarizedContent ? (
        <div className="p-4 border rounded-md bg-muted/50">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={atomDark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {summarizedContent}
          </ReactMarkdown>
        </div>
      ) : isProcessedContentArray ? (
        // If it's an array with mentions, render it directly
        <div>{processedContent}</div>
      ) : (
        // Otherwise, render it as markdown with enhanced components
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={atomDark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 text-primary" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3 text-primary/90" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2 text-primary/80" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-6 my-4" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-4" {...props} />,
            li: ({node, ...props}) => <li className="my-1" {...props} />,
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary/30 pl-4 italic my-4" {...props} />
          }}
        >
          {typeof processedContent === 'string' ? processedContent : note.content}
        </ReactMarkdown>
      )}
    </div>
  );
};

export default NoteContentRenderer;
