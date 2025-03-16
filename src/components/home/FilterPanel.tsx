import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { FileText, Image, Link2, Mic, Video, Check } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface FilterPanelProps {
  onReset: () => void;
  onChange: (filters: {
    dateRange?: DateRange;
    contentTypes: string[];
    tags: string[];
  }) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ onReset, onChange }) => {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = React.useState<string[]>([]);
  const [tagsOpen, setTagsOpen] = React.useState(false);

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

  // Update parent component when filters change
  React.useEffect(() => {
    onChange({
      dateRange,
      contentTypes: selectedContentTypes,
      tags: selectedTags,
    });
  }, [dateRange, selectedContentTypes, selectedTags, onChange]);

  const handleReset = () => {
    setDateRange(undefined);
    setSelectedTags([]);
    setSelectedContentTypes([]);
    onReset();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-2">Date Range</h3>
          <div className="border rounded-lg bg-card">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={1}
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
        <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={tagsOpen}
              className="w-full justify-between"
            >
              {selectedTags.length === 0 ? (
                <span className="text-muted-foreground">Select tags...</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map(tagId => {
                    const tag = tags.find(t => t.id === tagId);
                    return tag ? (
                      <Badge key={tag.id} variant="secondary">
                        <div className={`w-2 h-2 rounded-full ${tag.color} mr-1`} />
                        {tag.label}
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {tags.map(tag => (
                  <CommandItem
                    key={tag.id}
                    onSelect={() => {
                      setSelectedTags(prev =>
                        prev.includes(tag.id)
                          ? prev.filter(t => t !== tag.id)
                          : [...prev, tag.id]
                      );
                    }}
                  >
                    <div className={`w-2 h-2 rounded-full ${tag.color} mr-2`} />
                    <span>{tag.label}</span>
                    {selectedTags.includes(tag.id) && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleReset}
      >
        Reset Filters
      </Button>
    </div>
  );
}; 