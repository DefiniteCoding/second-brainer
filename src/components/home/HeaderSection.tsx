
import React from 'react';
import { Brain } from 'lucide-react';

const HeaderSection: React.FC = () => {
  return (
    <div className="mb-8 flex flex-col items-center justify-center text-center animate-fade-in">
      <div className="mb-4 flex items-center justify-center gap-2">
        <div className="p-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
          SecondBrainer
        </h1>
      </div>
      <p className="text-muted-foreground max-w-lg">
        Capture your thoughts, ideas, and inspiration in one place with minimal friction.
      </p>
    </div>
  );
};

export default HeaderSection;
