import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';
import tripAPI from '../api/tripApi';
import TripCard from '../components/Tripcard';
import ShareModal from '../components/ShareModal';
import LoadingSpinner from '../components/Loadingspinner';

export const Trips = () => {
  const { token } = useAuth();
  const [trips, setTrips] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [shareModalData, setShareModalData] = useState(null);
  const [shareTripTitle, setShareTripTitle] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      setIsLoading(true);
      try {
        const res = await tripAPI.getTrips(token, search);
        setTrips(res.trips || []);
      } catch (err) {
        console.error('Failed to load trips:', err);
        setTrips([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchTrips();
  }, [token, search]);

  const handleDeleteTrip = async (id) => {
    if (!window.confirm('Delete this trip?')) return;
    try {
      await tripAPI.deleteTrip(token, id);
    } catch (err) {
      console.warn('API delete warning:', err);
    } finally {
      setTrips((prev) => prev.filter((t) => String(t.id) !== String(id)));
    }
  };

  const handleShareTrip = async (id) => {
    try {
      const shareRes = await tripAPI.createShareLink(token, id);
      const trip = trips.find((t) => String(t.id) === String(id));
      setShareTripTitle(trip?.title || 'My Trip');
      setShareModalData(shareRes);
    } catch (err) {
      alert(err.message || 'Failed to generate share link');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Trips</h1>
          <p className="text-xs text-slate-500 font-medium">View and manage your planned travel itineraries.</p>
        </div>
        <button onClick={() => navigate('/upload')} className="btn-primary shrink-0">
          <Plus className="w-4 h-4" />
          New Trip
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search trips by destination or title..."
          className="input-field !rounded-full pl-10"
        />
      </div>

      {isLoading ? (
        <LoadingSpinner label="Fetching your trips..." />
      ) : trips.length === 0 ? (
        <div className="card rounded-3xl p-12 text-center space-y-3">
          <p className="text-slate-500 text-sm">No trips yet. Create your first adventure!</p>
          <button onClick={() => navigate('/upload')} className="btn-primary mx-auto">
            <Plus className="w-4 h-4" />
            Create New Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip} onShare={handleShareTrip} />
          ))}
        </div>
      )}

      <ShareModal
        shareData={shareModalData}
        onClose={() => setShareModalData(null)}
        tripTitle={shareTripTitle}
      />
    </div>
  );
};

export default Trips;
