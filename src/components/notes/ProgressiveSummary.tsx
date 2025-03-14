
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
      <span className="text-sm font-medium">Progressive Summary:</span>
      <ToggleGroup type="single" value={progressiveMode || ''} onValueChange={onProgressiveModeChange}>
        <ToggleGroupItem value="" aria-label="Full Text">Full</ToggleGroupItem>
        <ToggleGroupItem value="level1" aria-label="Main Points">
          Main Points
        </ToggleGroupItem>
        <ToggleGroupItem value="level2" aria-label="Key Ideas">
          Key Ideas
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default ProgressiveSummary;
