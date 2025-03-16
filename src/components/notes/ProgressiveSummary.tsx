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
  return;
};
export default ProgressiveSummary;