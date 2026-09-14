import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, MapPin, Printer, AlertCircle } from 'lucide-react';
import tripAPI from '../api/tripApi';
import ItineraryCard from '../components/Itinerarycard';
import LoadingSpinner from '../components/Loadingspinner';

export const SharedTrip = () => {
  const { token } = useParams();
  const [sharedData, setSharedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSharedTrip = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await tripAPI.getSharedTrip(token);
        setSharedData(res);
      } catch (err) {
        setError(err.message || 'This shared itinerary could not be found.');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchSharedTrip();
    else {
      setIsLoading(false);
      setError('Invalid share link.');
    }
  }, [token]);

  if (isLoading) {
    return <LoadingSpinner label="Fetching public travel itinerary..." />;
  }

  if (error || !sharedData) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">Itinerary Not Found</h1>
        <p className="text-sm text-slate-500">{error || 'This share link may have expired or been removed.'}</p>
      </div>
    );
  }

  const { trip, itinerary, viewsCount, qrCodeDataUrl } = sharedData;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6 px-4">
      <div className="card rounded-3xl p-6 sm:p-8 space-y-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600">
            <MapPin className="w-4 h-4" />
            <span>{trip?.destination || 'Destination'}</span>
            <span>•</span>
            <span className="flex items-center space-x-1 text-slate-500 font-semibold">
              <Eye className="w-3.5 h-3.5" />
              <span>{viewsCount || 0} Views</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{trip?.title || 'Shared Trip'}</h1>
          <p className="text-xs text-slate-500 font-medium">Publicly shared travel schedule powered by TripAI</p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {qrCodeDataUrl && (
            <div className="bg-white p-2 rounded-2xl w-24 h-24 shrink-0 border border-slate-200">
              <img src={qrCodeDataUrl} alt="Public QR" className="w-full h-full" />
            </div>
          )}
          <button
            onClick={() => window.print()}
            className="btn-primary"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      <ItineraryCard itinerary={itinerary} trip={trip} showAllDays />
    </div>
  );
};

export default SharedTrip;
