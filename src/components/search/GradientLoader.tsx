
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface GradientLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'subtle' | 'apple';
}

const GradientLoader: React.FC<GradientLoaderProps> = ({ 
  className,
  size = 'md',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  // Apple-like gradient loader styling
  if (variant === 'apple') {
    return (
      <motion.div 
        className={cn(
          "relative", 
          sizeClasses[size],
          className
        )}
      >
        <motion.div 
          className="absolute inset-0 rounded-full opacity-80"
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ 
            duration: 2, 
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop" 
          }}
          style={{
            background: 'conic-gradient(from 0deg, rgba(134,61,199,1) 0%, rgba(87,170,255,1) 33%, rgba(66,211,170,1) 66%, rgba(134,61,199,1) 100%)',
          }}
        />
        <motion.div 
          className="absolute inset-0 rounded-full"
          animate={{ 
            rotate: -360,
            scale: [1, 0.9, 1],
          }}
          transition={{ 
            duration: 2.5, 
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop" 
          }}
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
            mixBlendMode: 'overlay'
          }}
        />
        <div className="h-[75%] w-[75%] rounded-full bg-background/90 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      </motion.div>
    );
  }

  // Subtle variant
  if (variant === 'subtle') {
    return (
      <div 
        className={cn(
          "rounded-full animate-pulse", 
          sizeClasses[size],
          className
        )}
        style={{
          background: 'linear-gradient(270deg, rgba(147,39,143,0.7) 0%, rgba(234,172,232,0.7) 50%, rgba(246,219,245,0.7) 100%)'
        }}
      >
        <div className="h-[85%] w-[85%] rounded-full bg-background m-auto translate-y-[7.5%]"></div>
      </div>
    );
  }
  
  // Default spinner
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
