import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Luggage, Upload, FileText, Link2, User, Settings, Sparkles } from 'lucide-react';
import { useAuth } from '../context/Authcontext';

export const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const links = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Trips', path: '/trips', icon: Luggage },
    { label: 'Upload Documents', path: '/upload', icon: Upload },
    { label: 'Documents', path: '/upload?tab=documents', icon: FileText },
    { label: 'Shared Trips', path: '/trips', icon: Link2 },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/profile', icon: Settings },
  ];

  const isLinkActive = (link) => {
    if (link.path.includes('?')) {
      return location.pathname + location.search === link.path;
    }
    return location.pathname === link.path;
  };

  return (
    <aside className="w-60 bg-white border-r border-slate-100 shrink-0 hidden lg:flex flex-col justify-between min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-6">
        <div className="px-3 pt-2 flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-xl">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <span className="font-extrabold text-lg text-slate-900 tracking-tight">
            TripPilot <span className="text-indigo-600">AI</span>
          </span>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = isLinkActive(link);
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <Link to="/profile" className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
          {user?.profile_image ? (
            <img src={user.profile_image} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-900 font-bold flex items-center justify-center text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'J'}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'John Doe'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email || 'john@email.com'}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
