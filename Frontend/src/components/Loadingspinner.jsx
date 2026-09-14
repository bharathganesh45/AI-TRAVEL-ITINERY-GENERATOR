import React from 'react';
import { Sparkles } from 'lucide-react';

export const LoadingSpinner = ({ label = 'Loading TripAI...' }) => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 w-full">
      <Sparkles className="w-10 h-10 text-indigo-600 animate-pulse" />
      <p className="text-xs font-semibold text-slate-500 tracking-wide">{label}</p>
    </div>
  );
};

export default LoadingSpinner;
