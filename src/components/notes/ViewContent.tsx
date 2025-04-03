
import React from 'react';
import { Note } from '@/types/note';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CardFooter } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import AIEnhance from './AIEnhance';
import BacklinksSection from './BacklinksSection';

interface ViewContentProps {
  note: Note;
  backlinks: Note[];
  showAIEnhance: boolean;
}

const ViewContent: React.FC<ViewContentProps> = ({
  note,
  backlinks,
  showAIEnhance
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const renderAudio = (url: string) => {
    if (url.startsWith('data:audio')) {
      return (
        <div className="my-4">
          <audio controls className="w-full">
            <source src={url} type="audio/webm" />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }
    return <a href={url} target="_blank" rel="noopener noreferrer">Audio Recording</a>;
  };

  const components = {
    img: ({ src, alt }: { src?: string; alt?: string }) => (
      <img 
        src={src} 
        alt={alt} 
        className="max-w-full h-auto rounded-lg shadow-md my-4" 
        loading="lazy"
      />
    ),
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
      if (href?.startsWith('data:audio')) {
        return renderAudio(href);
      }
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          {children}
        </a>
      );
    },
  };

  return (
    <>
      <ScrollArea className="flex-1 px-4">
        <motion.div
          variants={fadeIn}
          className="prose prose-sm dark:prose-invert max-w-none"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Created {formatDate(note.createdAt)}</span>
              <span>•</span>
              <span>Updated {formatDate(note.updatedAt)}</span>
            </div>

            {showAIEnhance && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-card">
                  <AIEnhance note={note} />
                </div>
              </motion.div>
            )}
            
            <div className="rounded-lg bg-muted/30 p-6">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={components}
              >
                {note.content}
              </ReactMarkdown>
            </div>
            
            <BacklinksSection backlinks={backlinks} />
          </div>
        </motion.div>
      </ScrollArea>

      <CardFooter className="flex flex-wrap gap-1 border-t bg-slate-50/50 dark:bg-slate-900/50 py-3">
        {note.tags.map(tag => (
          <Badge 
            key={tag.id} 
            style={{ backgroundColor: tag.color }} 
            className="text-white transition-all hover:scale-105"
          >
            {tag.name}
          </Badge>
        ))}
      </CardFooter>
    </>
  );
};

export default ViewContent;
