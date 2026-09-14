import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Sparkles, Share2, ArrowLeft, Edit, Utensils, Lightbulb, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/Authcontext';
import tripAPI from '../api/tripApi';
import ItineraryCard from '../components/Itinerarycard';
import ShareModal from '../components/ShareModal';
import LoadingSpinner from '../components/Loadingspinner';

export const TripDetails = () => {
  const { id } = useParams();
  const { token } = useAuth();

  const [tripData, setTripData] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shareData, setShareData] = useState(null);

  useEffect(() => {
    const fetchTripData = async () => {
      setIsLoading(true);
      try {
        const res = await tripAPI.getTripById(token, id);
        setTripData(res.trip);
        setItinerary(res.itinerary);
      } catch (err) {
        console.error('Failed to load trip details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id && token) fetchTripData();
  }, [id, token]);

  const handleShare = async () => {
    try {
      const res = await tripAPI.createShareLink(token, id);
      setShareData(res);
    } catch (err) {
      alert(err.message || 'Failed to generate share link');
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading itinerary..." />;
  }

  const formatDate = () => {
    if (tripData?.start_date && tripData?.end_date) {
      return `${tripData.start_date} – ${tripData.end_date}`;
    }
    return tripData?.start_date || `${tripData?.duration_days || 6} days`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between no-print">
        <Link to="/trips" className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Trips</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link to={`/upload?tripId=${id}`} className="btn-secondary">
            <Edit className="w-3.5 h-3.5" />
            Edit Trip
          </Link>
          <button onClick={handleShare} className="btn-primary">
            <Share2 className="w-3.5 h-3.5" />
            Share Trip
          </button>
        </div>
      </div>

      <div className="card rounded-3xl p-6 sm:p-8 space-y-3">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{tripData?.title || 'Trip'}</h1>
        <p className="text-sm text-slate-500 font-medium">{formatDate()}</p>
        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
          <MapPin className="w-4 h-4" />
          <span>{tripData?.destination || 'Destination'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { emoji: '📅', label: `${tripData?.duration_days || itinerary?.tripSummary?.totalDays || 6} Days` },
          { emoji: '👥', label: `${tripData?.travelers_count || itinerary?.tripSummary?.travelers || 2} People` },
          { emoji: '✈', label: `${itinerary?.flights?.length || 0} Flights` },
          { emoji: '🏨', label: `${itinerary?.hotels?.length || 0} Hotels` },
        ].map(({ emoji, label }) => (
          <div key={label} className="card p-4 text-center">
            <div className="text-lg">{emoji}</div>
            <div className="text-sm font-bold text-slate-900 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <ItineraryCard itinerary={itinerary} trip={tripData} showAllDays />

      <div className="card rounded-3xl p-5 space-y-4">
        <div className="flex items-center space-x-2 text-indigo-950 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>AI Recommendations</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: Utensils, title: 'Where to Eat', text: 'Try local seafood near your resort.', color: 'indigo' },
            { icon: Lightbulb, title: 'Travel Tip', text: 'Book your dolphin cruise one day in advance.', color: 'amber' },
            { icon: AlertTriangle, title: 'Important', text: 'Check your return flight 24 hours before departure.', color: 'orange', warn: true },
          ].map(({ icon: Icon, title, text, warn }) => (
            <div key={title} className={`p-4 rounded-2xl border space-y-1 ${warn ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
              <div className={`flex items-center space-x-2 text-xs font-bold ${warn ? 'text-amber-900' : 'text-slate-900'}`}>
                <Icon className={`w-3.5 h-3.5 ${warn ? 'text-amber-600' : 'text-indigo-600'}`} />
                <span>{title}</span>
              </div>
              <p className={`text-xs pl-5 ${warn ? 'text-amber-800' : 'text-slate-500'}`}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      <ShareModal
        shareData={shareData}
        onClose={() => setShareData(null)}
        tripTitle={tripData?.title}
      />
    </div>
  );
};

export default TripDetails;
