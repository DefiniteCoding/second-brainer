import React, { useMemo } from 'react';
import { Note } from '@/contexts/NotesContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

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
  
  const markdownComponents = {
    code({node, inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      return !inline && language ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language}
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
    h1: ({node, children, ...props}) => (
      <h1 className="text-2xl font-bold mt-6 mb-4 text-primary" {...props}>
        {children}
      </h1>
    ),
    h2: ({node, children, ...props}) => (
      <h2 className="text-xl font-bold mt-5 mb-3 text-primary/90" {...props}>
        {children}
      </h2>
    ),
    h3: ({node, children, ...props}) => (
      <h3 className="text-lg font-bold mt-4 mb-2 text-primary/80" {...props}>
        {children}
      </h3>
    ),
    ul: ({node, children, ...props}) => (
      <ul className="list-disc pl-6 my-4" {...props}>
        {children}
      </ul>
    ),
    ol: ({node, children, ...props}) => (
      <ol className="list-decimal pl-6 my-4" {...props}>
        {children}
      </ol>
    ),
    li: ({node, children, ...props}) => (
      <li className="my-1" {...props}>
        {children}
      </li>
    ),
    blockquote: ({node, children, ...props}) => (
      <blockquote className="border-l-4 border-primary/30 pl-4 italic my-4" {...props}>
        {children}
      </blockquote>
    ),
    a: ({node, children, href, ...props}) => (
      <a 
        href={href}
        className="text-blue-600 dark:text-blue-400 hover:underline"
        {...props}
      >
        {children}
      </a>
    ),
    table: ({node, children, ...props}) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full divide-y divide-gray-300" {...props}>
          {children}
        </table>
      </div>
    ),
    th: ({node, children, ...props}) => (
      <th className="px-3 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-left" {...props}>
        {children}
      </th>
    ),
    td: ({node, children, ...props}) => (
      <td className="px-3 py-2 border-t border-gray-200 dark:border-gray-700" {...props}>
        {children}
      </td>
    )
  };
  
  const renderContent = (content: React.ReactNode) => {
    if (typeof content === 'string') {
      return (
        <ReactMarkdown 
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      );
    }
    return content;
  };
  
  return (
    <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground">
      {summarizedContent ? (
        <div className="p-4 border rounded-md bg-muted/50">
          {renderContent(summarizedContent)}
        </div>
      ) : (
        renderContent(processedContent)
      )}
    </div>
  );
};

export default NoteContentRenderer;
