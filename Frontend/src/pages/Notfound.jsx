import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center px-4 w-full">
      <Sparkles className="w-12 h-12 text-indigo-400" />
      <h1 className="text-3xl font-extrabold text-slate-900">404 — Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-sm">The route you are looking for does not exist or has been moved.</p>
      <Link to="/" className="btn-primary">
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;
