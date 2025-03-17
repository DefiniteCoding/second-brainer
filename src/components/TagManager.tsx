
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Tag, useNotes } from '@/contexts/NotesContext';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TagManagerProps {
  open?: boolean;
  onOpenChange: (open: boolean) => void;
}

const TagManager: React.FC<TagManagerProps> = ({ open = false, onOpenChange }) => {
  const { tags, addTag, deleteTag } = useNotes();
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366F1');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleAddTag = () => {
    if (newTagName.trim()) {
      addTag({ name: newTagName.trim(), color: newTagColor });
      setNewTagName('');
      setNewTagColor('#6366F1');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  const colorOptions = [
    '#EF4444', // red
    '#F97316', // orange
    '#F59E0B', // amber
    '#10B981', // emerald
    '#06B6D4', // cyan
    '#3B82F6', // blue
    '#6366F1', // indigo
    '#8B5CF6', // violet
    '#D946EF', // fuchsia
    '#EC4899', // pink
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-10 p-0 h-10"
                  style={{ backgroundColor: newTagColor }}
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="flex flex-wrap gap-1 max-w-[240px]">
                  {colorOptions.map((color) => (
                    <div
                      key={color}
                      className="w-8 h-8 rounded-md cursor-pointer flex items-center justify-center"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setNewTagColor(color);
                        setShowColorPicker(false);
                      }}
                    >
                      {newTagColor === color && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <Input
              placeholder="New tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            
            <Button onClick={handleAddTag} disabled={!newTagName.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          
          <div className="border rounded-md">
            <div className="p-3 border-b bg-muted/50">
              <h3 className="text-sm font-medium">Your Tags</h3>
            </div>
            <div className="p-3">
              {tags.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tags yet. Create your first tag above.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      style={{ backgroundColor: tag.color }}
                      className="text-white flex items-center gap-1 px-3 py-1 h-7"
                    >
                      {tag.name}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTag(tag.id);
                        }}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TagManager;
