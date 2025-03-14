
import React from 'react';
import { Note } from '@/contexts/NotesContext';
import { Badge } from '@/components/ui/badge';
import { Link } from 'lucide-react';

interface BacklinksSectionProps {
  backlinks: Note[];
}

const BacklinksSection: React.FC<BacklinksSectionProps> = ({ backlinks }) => {
  if (backlinks.length === 0) return null;
  
  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
        <Link className="h-4 w-4" />
        <span>Backlinks</span>
        <Badge variant="outline" className="ml-2">{backlinks.length}</Badge>
      </h3>
      <div className="text-sm text-muted-foreground">
        {backlinks.slice(0, 3).map(link => (
          <div key={link.id} className="py-1">
            {link.title}
          </div>
        ))}
        {backlinks.length > 3 && (
          <div className="text-xs text-primary mt-1 cursor-pointer hover:underline">
            {backlinks.length - 3} more backlinks...
          </div>
        )}
      </div>
    </div>
  );
};

export default BacklinksSection;
