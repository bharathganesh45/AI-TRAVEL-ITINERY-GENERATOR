import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Trash2, MoreVertical, Share2, Eye, Pencil } from 'lucide-react';

const DESTINATION_IMAGES = {
  Maldives: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80',
  Dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
  Thailand: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=600&q=80',
  Europe: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80',
  Default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
};

export const TripCard = ({ trip, onDelete, onShare }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const coverKey = Object.keys(DESTINATION_IMAGES).find(
    (k) => k !== 'Default' && trip.destination?.toLowerCase().includes(k.toLowerCase())
  );
  const coverImage = DESTINATION_IMAGES[coverKey] || DESTINATION_IMAGES.Default;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statusColor =
    trip.status === 'Itinerary Ready' || trip.status === 'Completed'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-indigo-50 text-indigo-700';

  return (
    <div className="card rounded-3xl overflow-hidden hover:shadow-card-hover transition-all group flex flex-col">
      <div className="h-36 overflow-hidden relative">
        <img src={coverImage} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1.5 ${statusColor}`}>
          <span className="w-2 h-2 rounded-full bg-current opacity-60" />
          <span>{trip.status || 'Upcoming'}</span>
        </div>

        <div className="absolute top-3 right-3 z-10" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 bg-white/90 backdrop-blur-md hover:bg-white text-slate-600 rounded-full transition-colors shadow-sm"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-100 rounded-xl shadow-lg py-1 text-xs font-semibold z-20">
              <Link to={`/trips/${trip.id}`} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700" onClick={() => setMenuOpen(false)}>
                <Eye className="w-3.5 h-3.5" /> View
              </Link>
              <Link to={`/upload?tripId=${trip.id}`} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700" onClick={() => setMenuOpen(false)}>
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Link>
              {onShare && (
                <button type="button" className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700" onClick={() => { onShare(trip.id); setMenuOpen(false); }}>
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
              )}
              {onDelete && (
                <button type="button" className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 text-rose-600" onClick={() => { onDelete(trip.id); setMenuOpen(false); }}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">
            {trip.title}
          </h3>
          <p className="text-xs text-slate-500">{trip.start_date || `${trip.duration_days || 6} days`}</p>
          <p className="text-xs text-slate-500 flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
            <span className="truncate">{trip.destination}</span>
          </p>
        </div>

        <div className="pt-2 border-t border-slate-50 flex items-center justify-end">
          <Link to={`/trips/${trip.id}`} className="text-xs font-bold text-indigo-950 group-hover:text-indigo-600 transition-colors flex items-center space-x-1">
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
