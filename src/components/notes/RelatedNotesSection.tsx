
import React from 'react';
import { Note } from '@/contexts/NotesContext';
import { Brain } from 'lucide-react';

interface RelatedNotesSectionProps {
  suggestedConnections: Note[];
}

const RelatedNotesSection: React.FC<RelatedNotesSectionProps> = ({ suggestedConnections }) => {
  if (suggestedConnections.length === 0) return null;
  
  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
        <Brain className="h-4 w-4" />
        <span>Related Notes</span>
      </h3>
      <div className="text-sm text-muted-foreground">
        {suggestedConnections.slice(0, 3).map(relatedNote => (
          <div key={relatedNote.id} className="py-1">
            {relatedNote.title}
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
