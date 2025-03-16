
import React from 'react';
import { Brain } from 'lucide-react';

const HeaderSection: React.FC = () => {
  return (
    <div className="mb-8 flex flex-col items-center justify-center text-center">
      <div className="mb-4 flex items-center justify-center gap-2">
        <Brain className="h-8 w-8 text-primary bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1 text-white" />
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Second Brain</h1>
      </div>
      <p className="text-muted-foreground max-w-lg">
        Capture your thoughts, ideas, and inspiration in one place with minimal friction.
      </p>
    </div>
  );
};

export default HeaderSection;
