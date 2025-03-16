import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { FileText, Image, Link2, Mic, Video } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterPanelProps {
  onReset: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onReset }) => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = React.useState<string[]>([]);

  const contentTypes = [
    { id: 'text', icon: FileText, label: 'Text', color: 'text-blue-500' },
    { id: 'image', icon: Image, label: 'Image', color: 'text-green-500' },
    { id: 'link', icon: Link2, label: 'Link', color: 'text-purple-500' },
    { id: 'audio', icon: Mic, label: 'Audio', color: 'text-amber-500' },
    { id: 'video', icon: Video, label: 'Video', color: 'text-red-500' },
  ];

  const tags = [
    { id: 'important', color: 'bg-red-500', label: 'Important' },
    { id: 'work', color: 'bg-blue-500', label: 'Work' },
    { id: 'personal', color: 'bg-green-500', label: 'Personal' },
    { id: 'idea', color: 'bg-purple-500', label: 'Idea' },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-2">Date Range</h3>
          <div className="border rounded-lg bg-card">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
            />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-2">Content Type</h3>
          <div className="grid grid-cols-3 gap-2">
            {contentTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.id}
                  variant="outline"
                  className={`flex flex-col items-center justify-center h-20 p-2 hover:bg-muted ${
                    selectedContentTypes.includes(type.id) ? 'border-primary' : ''
                  }`}
                  onClick={() => {
                    setSelectedContentTypes(prev =>
                      prev.includes(type.id)
                        ? prev.filter(t => t !== type.id)
                        : [...prev, type.id]
                    );
                  }}
                >
                  <Icon className={`h-6 w-6 ${type.color} mb-1`} />
                  <span className="text-xs text-center">{type.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Tags</h3>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select tags..." />
          </SelectTrigger>
          <SelectContent>
            {tags.map(tag => (
              <SelectItem key={tag.id} value={tag.id}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${tag.color}`} />
                  <span>{tag.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={onReset}
      >
        Reset Filters
      </Button>
    </div>
  );
};

export default FilterPanel; 