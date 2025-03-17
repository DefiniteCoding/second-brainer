
import React from 'react';
import { Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HeaderSection: React.FC = () => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
          SecondBrainer
        </h1>
      </div>
    </div>
  );
};

export default HeaderSection;
