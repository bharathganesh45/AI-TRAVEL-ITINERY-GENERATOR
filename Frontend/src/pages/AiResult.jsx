import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Printer } from 'lucide-react';
import { useAuth } from '../context/Authcontext';
import tripAPI from '../api/tripApi';
import ItineraryCard from '../components/Itinerarycard';
import AIGenerationScreen from '../components/AIGenerationScreen';
import LoadingSpinner from '../components/Loadingspinner';

export const AIResult = () => {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId');
  const { token } = useAuth();

  const [itinerary, setItinerary] = useState(null);
  const [trip, setTrip] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showItinerary, setShowItinerary] = useState(false);

  useEffect(() => {
    const fetchItineraryData = async () => {
      if (!tripId || !token) return;
      setIsLoading(true);
      try {
        const tripDetails = await tripAPI.getTripById(token, tripId);
        setTrip(tripDetails.trip);
        setDocuments(tripDetails.documents || []);
        setItinerary(tripDetails.itinerary);
      } catch (err) {
        console.error('Failed to fetch AI result:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItineraryData();
  }, [tripId, token]);

  if (isLoading) {
    return <LoadingSpinner label="AI is planning your journey..." />;
  }

  if (!showItinerary) {
    return (
      <AIGenerationScreen
        trip={trip}
        documents={documents}
        onComplete={() => setShowItinerary(true)}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 no-print">
        <Link
          to={`/trips/${tripId}`}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Trip</span>
        </Link>

        <button onClick={() => window.print()} className="btn-primary">
          <Printer className="w-3.5 h-3.5" />
          Print Itinerary
        </button>
      </div>

      <div className="card rounded-3xl p-6 sm:p-8 space-y-2">
        <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold">
          <Sparkles className="w-4 h-4" />
          <span>AI Generated Itinerary</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">{trip?.title || 'Your Trip'}</h1>
        <p className="text-xs text-slate-500 font-medium">
          Your bookings have been compiled into an organised day-by-day travel plan.
        </p>
      </div>

      <ItineraryCard itinerary={itinerary} trip={trip} />
    </div>
  );
};

export default AIResult;
