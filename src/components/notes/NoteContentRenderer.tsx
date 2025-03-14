
import React from 'react';
import { Note } from '@/contexts/NotesContext';

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
  const renderProcessedContent = () => {
    let content = note.content;
    
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    content = content.replace(/_(.*?)_/g, '<em>$1</em>');
    
    content = content.replace(/==(.*?)==/g, '<mark>$1</mark>');

    if (progressiveMode === 'level1') {
      const boldMatches = note.content.match(/\*\*(.*?)\*\*/g) || [];
      if (boldMatches.length > 0) {
        content = boldMatches.map(match => match.replace(/\*\*(.*?)\*\*/g, '$1')).join('\n\n');
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      } else {
        content = 'No highlighted main points in this note.';
      }
    } else if (progressiveMode === 'level2') {
      const matches = [
        ...(note.content.match(/\*\*(.*?)\*\*/g) || []),
        ...(note.content.match(/==(.*?)==/g) || [])
      ];
      if (matches.length > 0) {
        content = matches.map(match => 
          match.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
               .replace(/==(.*?)==/g, '<mark>$1</mark>')
        ).join('\n\n');
      } else {
        content = 'No highlighted content in this note.';
      }
    }

    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };

  const renderContent = () => {
    switch (note.contentType) {
      case 'image':
        return (
          <div className="space-y-4">
            {note.mediaUrl && (
              <div className="my-4 flex justify-center">
                <img src={note.mediaUrl} alt="Note media" className="max-h-80 rounded-md" />
              </div>
            )}
            <div className="whitespace-pre-wrap">
              {progressiveMode ? renderProcessedContent() : processedContent}
            </div>
          </div>
        );
      case 'link':
        return (
          <div className="space-y-4">
            {note.mediaUrl && (
              <a 
                href={note.mediaUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-3 border rounded-md hover:bg-muted/50 transition-colors"
              >
                {note.mediaUrl}
              </a>
            )}
            <div className="whitespace-pre-wrap">
              {progressiveMode ? renderProcessedContent() : processedContent}
            </div>
          </div>
        );
      default:
        return (
          <div className="whitespace-pre-wrap">
            {progressiveMode ? renderProcessedContent() : processedContent}
          </div>
        );
    }
  };

  return renderContent();
};

export default NoteContentRenderer;
