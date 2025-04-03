
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tag, useNotes } from '@/contexts/NotesContext';
import { X, Plus } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface TagSelectorProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  className?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onTagsChange,
  className,
}) => {
  const { tags } = useNotes();
  const { toast } = useToast();
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  // Filter out already selected tags
  const availableTags = tags.filter(
    tag => !selectedTags.some(selectedTag => selectedTag.id === tag.id)
  );

  const handleAddTag = (tagId: string) => {
    const tagToAdd = tags.find(tag => tag.id === tagId);
    if (tagToAdd) {
      onTagsChange([...selectedTags, tagToAdd]);
      toast({
        title: "Tag added",
        description: `Added "${tagToAdd.name}" tag to note.`,
      });
    }
  };

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(tag => tag.id !== tagId));
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {selectedTags.map(tag => (
          <Badge
            key={tag.id}
            style={{ backgroundColor: tag.color }}
            className="text-white flex items-center gap-1 px-3 py-1 h-7"
          >
            {tag.name}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => handleRemoveTag(tag.id)}
            />
          </Badge>
        ))}

        {availableTags.length > 0 && (
          <Select
            onValueChange={handleAddTag}
            value=""
            open={isSelectOpen}
            onOpenChange={setIsSelectOpen}
          >
            <SelectTrigger className="w-auto h-7 border border-dashed p-1">
              <SelectValue placeholder={
                <div className="flex items-center text-muted-foreground text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  <span>Add tag</span>
                </div>
              } />
            </SelectTrigger>
            <SelectContent>
              {availableTags.map(tag => (
                <SelectItem key={tag.id} value={tag.id}>
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};

export default TagSelector;
