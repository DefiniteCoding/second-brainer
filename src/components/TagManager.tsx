import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Tag, useNotes } from '@/contexts/NotesContext';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Settings, CircleDot } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const TagManager: React.FC = () => {
  const { tags, addTag, deleteTag } = useNotes();
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleAddTag = () => {
    if (newTagName.trim()) {
      addTag({ name: newTagName.trim(), color: newTagColor });
      setNewTagName('');
      setNewTagColor('#3B82F6');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span>Manage Tags</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Add new tag */}
          <div className="flex items-center gap-2">
            <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="h-10 w-10 p-0 rounded-md" 
                  style={{ backgroundColor: newTagColor }}
                >
                  <span className="sr-only">Pick a color</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <HexColorPicker color={newTagColor} onChange={setNewTagColor} />
              </PopoverContent>
            </Popover>
            <Input
              placeholder="New tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddTag} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Existing tags */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Existing Tags</div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <div key={tag.id} className="group flex items-center">
                  <Badge 
                    style={{ backgroundColor: tag.color }}
                    className="text-white flex items-center gap-1 px-3 py-1 group-hover:pr-1"
                  >
                    {tag.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteTag(tag.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                </div>
              ))}
              {tags.length === 0 && (
                <div className="text-sm text-muted-foreground">No tags created yet</div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="w-full">Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TagManager;
