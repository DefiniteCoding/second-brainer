
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { useNotes, Tag } from '@/contexts/NotesContext';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  List, 
  Columns, 
  Table2 
} from 'lucide-react';
import NotesList from './NotesList';
import { Note } from '@/contexts/NotesContext';

interface CollectionsProps {
  onNoteClick?: (note: Note) => void;
}

const Collections: React.FC<CollectionsProps> = ({ onNoteClick }) => {
  const { notes, tags } = useNotes();
  const [activeView, setActiveView] = useState<'list' | 'kanban' | 'table'>('list');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };

  const filteredNotes = selectedTags.length > 0 
    ? notes.filter(note => 
        note.tags.some(tag => selectedTags.includes(tag.id))
      )
    : notes;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by tags:</span>
        </div>
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
          <TabsList className="grid grid-cols-3 w-[180px]">
            <TabsTrigger value="list">
              <List className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="kanban">
              <Columns className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="table">
              <Table2 className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-wrap gap-2 pb-2">
        {tags.map(tag => (
          <Badge
            key={tag.id}
            style={{ 
              backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
              color: selectedTags.includes(tag.id) ? 'white' : 'inherit',
              borderColor: tag.color
            }}
            variant={selectedTags.includes(tag.id) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleTag(tag.id)}
          >
            {tag.name}
          </Badge>
        ))}
        {tags.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No tags available. Create tags to organize your notes.
          </div>
        )}
      </div>

      <Tabs value={activeView} className="w-full">
        <TabsContent value="list" className="mt-0">
          <NotesList notes={filteredNotes} onNoteClick={onNoteClick} />
        </TabsContent>
        
        <TabsContent value="kanban" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedTags.length > 0 ? (
              selectedTags.map(tagId => {
                const tag = tags.find(t => t.id === tagId);
                const tagNotes = notes.filter(note => 
                  note.tags.some(t => t.id === tagId)
                );
                
                return (
                  <div key={tagId} className="space-y-2">
                    <div 
                      className="font-medium px-2 py-1 rounded text-white" 
                      style={{ backgroundColor: tag?.color }}
                    >
                      {tag?.name} ({tagNotes.length})
                    </div>
                    <div className="space-y-2">
                      <NotesList notes={tagNotes} onNoteClick={onNoteClick} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center p-8 text-muted-foreground">
                Select tags to organize notes in Kanban view
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="table" className="mt-0">
          <table className="w-full border-collapse">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-2 text-sm font-medium">Title</th>
                <th className="text-left p-2 text-sm font-medium">Created</th>
                <th className="text-left p-2 text-sm font-medium">Tags</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotes.length > 0 ? (
                filteredNotes.map(note => (
                  <tr 
                    key={note.id} 
                    className="border-b cursor-pointer hover:bg-note-hover"
                    onClick={() => onNoteClick && onNoteClick(note)}
                  >
                    <td className="p-2">{note.title}</td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map(tag => (
                          <Badge 
                            key={tag.id} 
                            style={{ backgroundColor: tag.color }}
                            className="text-white text-xs px-2 py-0"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-muted-foreground">
                    No notes match the selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Collections;
