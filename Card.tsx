
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-surface p-4 sm:p-6 rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
};
