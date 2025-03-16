import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sparkles, Tag, Link2, Text } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIActionsMenuProps {
  onAnalyzeContent: () => Promise<void>;
  onSuggestTitle: () => Promise<void>;
  isProcessing: boolean;
  hasGenericTitle: boolean;
}

export const AIActionsMenu: React.FC<AIActionsMenuProps> = ({
  onAnalyzeContent,
  onSuggestTitle,
  isProcessing,
  hasGenericTitle
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "rounded-full hover:scale-105 transition-transform fixed bottom-24 right-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20",
            isProcessing && "animate-pulse"
          )}
        >
          <Sparkles className="h-4 w-4 text-indigo-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className="w-72 p-2"
      >
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm"
            onClick={onAnalyzeContent}
            disabled={isProcessing}
          >
            <div className="flex gap-2 items-center">
              <div className="flex -space-x-1">
                <Tag className="h-4 w-4 text-blue-500" />
                <Link2 className="h-4 w-4 text-purple-500" />
              </div>
            </div>
            Extract tags & find connections
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm"
            onClick={onSuggestTitle}
            disabled={isProcessing || !hasGenericTitle}
          >
            <Text className="h-4 w-4 text-green-500" />
            Suggest better title
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}; 