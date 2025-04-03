
import React from 'react';
import { cn } from '@/lib/utils';

interface GradientLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const GradientLoader: React.FC<GradientLoaderProps> = ({ 
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div 
      className={cn(
        "rounded-full animate-spin", 
        sizeClasses[size],
        className
      )}
      style={{
        background: 'conic-gradient(from 0deg, rgba(147,39,143,1) 0%, rgba(234,172,232,1) 50%, rgba(246,219,245,1) 100%)'
      }}
    >
      <div className="h-[85%] w-[85%] rounded-full bg-background m-auto translate-y-[7.5%]"></div>
    </div>
  );
};

export default GradientLoader;
