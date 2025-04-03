
import React, { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import FormattingToolbar from '@/components/notes/FormattingToolbar';
import { FloatingFormatToolbar } from '@/components/notes/FloatingFormatToolbar';
import TagSelector from '@/components/TagSelector';
import { Tag } from '@/types/note';

interface EditorContentProps {
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
  handleFormatText: (formatType: string, meta?: any) => void;
}

const EditorContent: React.FC<EditorContentProps> = ({
  title,
  setTitle,
  content,
  setContent,
  tags,
  setTags,
  handleFormatText
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      <Input
        type="text"
        placeholder="Note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-lg font-medium"
      />
      
      <FormattingToolbar onFormat={handleFormatText} />
      
      <TagSelector 
        selectedTags={tags} 
        onTagsChange={setTags} 
      />
      
      <div className="relative">
        <Textarea
          ref={textareaRef}
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[300px] resize-none flex-1"
        />
        <FloatingFormatToolbar onFormat={handleFormatText} />
      </div>
    </div>
  );
};

export default EditorContent;
