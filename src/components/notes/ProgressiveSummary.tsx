
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FileText, FileDigit, FileSearch } from 'lucide-react';

interface ProgressiveSummaryProps {
  progressiveMode: string | null;
  onProgressiveModeChange: (value: string | null) => void;
}

const ProgressiveSummary: React.FC<ProgressiveSummaryProps> = ({
  progressiveMode,
  onProgressiveModeChange
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Summary:</span>
      <ToggleGroup type="single" value={progressiveMode || ''} onValueChange={onProgressiveModeChange}>
        <ToggleGroupItem value="" aria-label="Full Text" className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Full</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="level1" aria-label="Main Points" className="flex items-center gap-1">
          <FileDigit className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Main Points</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="level2" aria-label="Key Ideas" className="flex items-center gap-1">
          <FileSearch className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Key Ideas</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default ProgressiveSummary;
