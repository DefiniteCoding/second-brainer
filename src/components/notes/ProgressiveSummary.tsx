
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
    <div className="mb-4">
      <ToggleGroup type="single" value={progressiveMode || ""} onValueChange={onProgressiveModeChange}>
        <ToggleGroupItem value="full" aria-label="Show full content">
          <FileText className="h-4 w-4 mr-2" />
          <span>Full</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="summary" aria-label="Show summary">
          <FileDigit className="h-4 w-4 mr-2" />
          <span>Summary</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="key-points" aria-label="Show key points">
          <FileSearch className="h-4 w-4 mr-2" />
          <span>Key Points</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default ProgressiveSummary;
