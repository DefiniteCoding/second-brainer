
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Edit3, Trash2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';

interface ViewHeaderProps {
  title: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showAIEnhance: boolean;
  setShowAIEnhance: (show: boolean) => void;
}

const ViewHeader: React.FC<ViewHeaderProps> = ({
  title,
  onBack,
  onEdit,
  onDelete,
  showAIEnhance,
  setShowAIEnhance
}) => {
  return (
    <motion.div
      variants={fadeIn}
      className="flex items-center justify-between border-b px-4 py-3 bg-gradient-to-b from-background to-muted/20"
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowAIEnhance(!showAIEnhance)}
          className={`rounded-full hover:bg-muted ${showAIEnhance ? 'bg-primary/10 text-primary' : ''}`}
          title={showAIEnhance ? 'Hide AI Insights' : 'Show AI Insights'}
        >
          <Sparkles className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="rounded-full hover:bg-muted"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default ViewHeader;
