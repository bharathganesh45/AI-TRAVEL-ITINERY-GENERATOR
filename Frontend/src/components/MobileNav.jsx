import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Luggage, Plus, Link2, User } from 'lucide-react';

export const MobileNav = () => {
  const location = useLocation();

  const links = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Trips', path: '/trips', icon: Luggage },
    { label: 'Upload', path: '/upload', icon: Plus, highlight: true },
    { label: 'Shared', path: '/trips', icon: Link2 },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-100 px-2 py-2 safe-area-pb">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;

          if (link.highlight) {
            return (
              <Link
                key={link.label}
                to={link.path}
                className="flex flex-col items-center -mt-5"
              >
                <div className="w-12 h-12 rounded-full bg-brand-900 text-white flex items-center justify-center shadow-lg shadow-indigo-900/30">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-brand-900 mt-1">{link.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={link.label}
              to={link.path}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors ${
                isActive ? 'text-brand-900' : 'text-slate-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : ''}`} />
              <span className="text-[10px] font-semibold">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
