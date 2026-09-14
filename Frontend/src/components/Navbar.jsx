import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Plus, Luggage, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/Authcontext';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 text-slate-800 sticky top-0 z-40 transition-all shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2 group">
          <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-2xl group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-indigo-600 fill-indigo-200" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-0.5">
            TripPilot <span className="text-indigo-600">AI</span>
          </span>
        </Link>

        {/* Center Nav Links for Landing Page */}
        {!isAuthenticated && (
          <nav className="hidden md:flex items-center space-x-8 text-xs font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
          </nav>
        )}

        {/* Navigation Actions */}
        <nav className="flex items-center space-x-3 sm:space-x-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center space-x-1.5 ${
                  location.pathname === '/dashboard' ? 'bg-slate-100 text-indigo-950 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <Link
                to="/trips"
                className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center space-x-1.5 ${
                  location.pathname === '/trips' ? 'bg-slate-100 text-indigo-950 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Luggage className="w-4 h-4" />
                <span className="hidden sm:inline">My Trips</span>
              </Link>

              <Link
                to="/upload"
                className="bg-[#1e1b4b] hover:bg-[#2d2975] text-white text-xs font-semibold px-4 py-2 rounded-full transition-all shadow-sm flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>New Trip</span>
              </Link>

              <div className="h-4 w-px bg-slate-200" />

              <Link
                to="/profile"
                className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 text-xs font-medium"
              >
                {user?.profile_image ? (
                  <img src={user.profile_image} alt={user.name} className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-900 font-bold flex items-center justify-center text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'J'}
                  </div>
                )}
                <span className="hidden md:inline font-semibold text-slate-900">{user?.name || 'John Doe'}</span>
              </Link>

              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-[#1e1b4b] to-[#3b2ea6] hover:from-[#2d2975] hover:to-[#4b3eb8] text-white text-xs font-semibold px-5 py-2 rounded-full transition-all shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
