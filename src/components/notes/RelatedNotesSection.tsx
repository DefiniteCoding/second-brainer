
import React from 'react';
import { Note } from '@/contexts/NotesContext';
import { Brain, MessageSquareText } from 'lucide-react';

interface RelatedNotesSectionProps {
  suggestedConnections: Note[];
}

const RelatedNotesSection: React.FC<RelatedNotesSectionProps> = ({ suggestedConnections }) => {
  if (suggestedConnections.length === 0) return null;
  
  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
        <Brain className="h-4 w-4" />
        <span>AI Suggested Related Notes</span>
        <span className="ml-auto text-xs text-muted-foreground flex items-center">
          <MessageSquareText className="h-3 w-3 mr-1" />
          <span>Using NLP analysis</span>
        </span>
      </h3>
      <div className="text-sm text-muted-foreground space-y-2">
        {suggestedConnections.slice(0, 3).map(relatedNote => (
          <div key={relatedNote.id} className="py-1 flex items-start gap-2">
            <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0"></div>
            <div>
              <div className="font-medium text-foreground">{relatedNote.title}</div>
              <div className="line-clamp-1 text-xs">
                {relatedNote.content.substring(0, 100)}
                {relatedNote.content.length > 100 ? '...' : ''}
              </div>
              {relatedNote.tags.length > 0 && (
                <div className="text-xs mt-1 text-primary">
                  {relatedNote.tags[0].name}
                  {relatedNote.tags.length > 1 ? ` +${relatedNote.tags.length - 1} more` : ''}
                </div>
              )}
            </div>
          </div>
        ))}
        {suggestedConnections.length > 3 && (
          <div className="text-xs text-primary mt-1 cursor-pointer hover:underline">
            {suggestedConnections.length - 3} more related notes...
          </div>
        )}
      </div>
    </div>
  );
};

export default RelatedNotesSection;
