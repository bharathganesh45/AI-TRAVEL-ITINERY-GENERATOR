import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 text-slate-500 py-6 px-4 text-xs mt-auto shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-slate-900">TripPilot AI</span>
          <span>— Modern AI Travel Platform</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1 text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Booking Extractor</span>
          </span>
          <span>© 2026 TripPilot AI. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
