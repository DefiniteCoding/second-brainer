
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
      
      <Link to="/graph">
        <Button variant="outline" size="sm" className="ml-2 gap-1.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="5" cy="6" r="3" />
            <circle cx="12" cy="17" r="3" />
            <circle cx="19" cy="6" r="3" />
            <line x1="5" y1="9" x2="12" y2="14" />
            <line x1="12" y1="14" x2="19" y2="9" />
          </svg>
          <span>Graph</span>
        </Button>
      </Link>
    </div>
  );
};

export default HeaderSection;
