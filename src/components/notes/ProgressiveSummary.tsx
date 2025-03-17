
import React from 'react';
import { Button } from '@/components/ui/button';
import { EyeOff, BookOpen, BookText } from 'lucide-react';

interface ProgressiveSummaryProps {
  progressiveMode: string | null;
  onProgressiveModeChange: (mode: string | null) => void;
}

const ProgressiveSummary: React.FC<ProgressiveSummaryProps> = ({ 
  progressiveMode,
  onProgressiveModeChange
}) => {
  return (
    <div className="flex gap-2 items-center">
      <Button
        variant={progressiveMode === null ? "default" : "outline"}
        size="sm"
        className="gap-1"
        onClick={() => onProgressiveModeChange(null)}
      >
        <BookOpen className="h-3.5 w-3.5" />
        <span>Full</span>
      </Button>
      
      <Button
        variant={progressiveMode === "level1" ? "default" : "outline"}
        size="sm"
        className="gap-1"
        onClick={() => onProgressiveModeChange("level1")}
      >
        <BookText className="h-3.5 w-3.5" />
        <span>Main Points</span>
      </Button>
      
      <Button
        variant={progressiveMode === "level2" ? "default" : "outline"}
        size="sm"
        className="gap-1"
        onClick={() => onProgressiveModeChange("level2")}
      >
        <EyeOff className="h-3.5 w-3.5" />
        <span>Key Ideas</span>
      </Button>
    </div>
  );
};

export default ProgressiveSummary;
