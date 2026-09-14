import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Luggage, FileText, Sparkles, MapPin, Calendar, Utensils, Lightbulb, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/Authcontext';
import tripAPI from '../api/tripApi';
import TripCard from '../components/Tripcard';
import LoadingSpinner from '../components/Loadingspinner';

export const Dashboard = () => {
  const { user, token } = useAuth();
  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState({ totalTrips: 0, upcomingTrips: 0, totalDocs: 0, destinations: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newType, setNewType] = useState('Leisure');
  const [newDays, setNewDays] = useState(6);
  const [newPeople, setNewPeople] = useState(2);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const res = await tripAPI.getTrips(token);
        const userTrips = res.trips || [];
        setTrips(userTrips);
        setStats({
          totalTrips: userTrips.length,
          upcomingTrips: userTrips.filter((t) => t.status !== 'Completed').length,
          totalDocs: res.stats?.totalDocs || 0,
          destinations: new Set(userTrips.map((t) => t.destination).filter(Boolean)).size,
        });
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setTrips([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsCreating(true);
    try {
      const res = await tripAPI.createTrip(token, {
        title: newTitle,
        destination: newDestination || 'Dubai',
        trip_type: newType,
        duration_days: newDays || 6,
        travelers_count: newPeople || 2,
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDestination('');
      navigate(`/upload?tripId=${res.trip.id}`);
    } catch (err) {
      alert(err.message || 'Failed to create trip');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTrip = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    try {
      await tripAPI.deleteTrip(token, id);
    } catch (err) {
      console.warn('API delete warning:', err);
    } finally {
      setTrips(prev => prev.filter(t => String(t.id) !== String(id)));
      setStats(prev => ({
        ...prev,
        totalTrips: Math.max(0, prev.totalTrips - 1),
        upcomingTrips: Math.max(0, prev.upcomingTrips - 1)
      }));
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading user travel statistics..." />;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
            <span>Hello, {user?.name || 'John'}</span>
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">Let&apos;s plan your next unforgettable journey.</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex bg-white border border-slate-100 rounded-2xl p-3.5 shadow-2xs items-center space-x-4">
            <div className="text-xs text-slate-500">Total Trips</div>
            <div className="text-xl font-black text-slate-900">{stats.totalTrips}</div>
            <div className="h-8 w-px bg-slate-100" />
            <div className="text-xs text-slate-500">Upcoming</div>
            <div className="text-xl font-black text-indigo-900">{stats.upcomingTrips}</div>
            <div className="h-8 w-px bg-slate-100" />
            <div className="text-xs text-slate-500">Docs</div>
            <div className="text-xl font-black text-slate-900">{stats.totalDocs}</div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#1e1b4b] hover:bg-[#2d2975] text-white font-semibold text-xs px-5 py-2.5 rounded-full transition-all shadow-sm flex items-center space-x-1.5 w-fit cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Trip</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center space-x-2 text-slate-400">
            <Luggage className="w-4 h-4 text-slate-500" />
            <span className="text-[11px] font-semibold text-slate-600">Total Trips</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalTrips}</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center space-x-2 text-slate-400">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="text-[11px] font-semibold text-slate-600">Upcoming Trips</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.upcomingTrips}</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center space-x-2 text-slate-400">
            <FileText className="w-4 h-4 text-slate-500" />
            <span className="text-[11px] font-semibold text-slate-600">Documents</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalDocs}</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center space-x-2 text-slate-400">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-semibold text-slate-600">Destinations</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.destinations}</p>
        </div>
      </div>

      {/* Main Grid: Recent Trips + AI Recommendations Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Trips Grid */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Trips</h2>
            <Link to="/trips" className="text-xs font-semibold text-indigo-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {trips.length === 0 ? (
              <div className="col-span-full card rounded-3xl p-10 text-center space-y-3">
                <p className="text-sm text-slate-500">No trips yet. Create your first journey!</p>
                <button onClick={() => setShowCreateModal(true)} className="btn-primary mx-auto">
                  <Plus className="w-4 h-4" />
                  New Trip
                </button>
              </div>
            ) : (
              trips.slice(0, 4).map((trip) => (
                <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip} />
              ))
            )}
          </div>
        </div>

        {/* Right Column: AI Recommendations Panel (Matching screenshot overlay) */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-indigo-950 font-bold text-sm border-b border-slate-100 pb-3">
            <Sparkles className="w-4 h-4 text-indigo-600 fill-indigo-200" />
            <span>AI Recommendations</span>
          </div>

          <div className="space-y-3">
            {/* Recommendation 1 */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100/80 space-y-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                <Utensils className="w-3.5 h-3.5 text-indigo-600" />
                <span>Where to Eat</span>
              </div>
              <p className="text-xs text-slate-500 pl-5">Try local seafood at harbor promenade</p>
            </div>

            {/* Recommendation 2 */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100/80 space-y-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Travel Tip</span>
              </div>
              <p className="text-xs text-slate-500 pl-5">Book dolphin cruise 2 days in advance</p>
            </div>

            {/* Recommendation 3 (Warm Amber Highlighted Card from Screenshot) */}
            <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl space-y-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-900">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Important</span>
              </div>
              <p className="text-xs text-amber-800/90 pl-5 font-medium">
                Check return flight 24h before departure
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Trip Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Create New Journey</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trip Name</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Dubai Adventure"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destination</label>
                <input
                  type="text"
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                  placeholder="e.g. Dubai, UAE"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Number of Days</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={newDays}
                  onChange={(e) => setNewDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Number of People</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newPeople}
                  onChange={(e) => setNewPeople(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trip Category</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  <option value="Leisure">Leisure / Vacation</option>
                  <option value="Business">Business Travel</option>
                  <option value="Adventure">Adventure</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="bg-[#1e1b4b] hover:bg-[#2d2975] text-white font-semibold px-5 py-2.5 rounded-full transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Continue ->'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
