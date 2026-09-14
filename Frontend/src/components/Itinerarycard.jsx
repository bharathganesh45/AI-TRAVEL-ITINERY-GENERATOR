import React, { useState } from 'react';
import { Calendar, MapPin, Lightbulb, Navigation, Luggage, Plane, Hotel, Car, Sun, Utensils, Clock, Star } from 'lucide-react';

const CATEGORY_ICONS = {
  flight: Plane,
  hotel: Hotel,
  transport: Car,
  dining: Utensils,
  leisure: Sun,
  sightseeing: MapPin,
  shopping: Luggage,
  adventure: Sun,
  default: Calendar,
};

const getActivityIcon = (category) => {
  const key = (category || '').toLowerCase();
  return CATEGORY_ICONS[key] || CATEGORY_ICONS.default;
};

export const ItineraryCard = ({ itinerary, trip, showAllDays = false }) => {
  const [activeDay, setActiveDay] = useState(1);
  const data = itinerary || null;

  if (!data) {
    return (
      <div className="card rounded-3xl p-8 text-center space-y-3">
        <p className="text-slate-500 text-sm">No itinerary generated yet.</p>
        <p className="text-xs text-slate-400">Upload travel documents and generate an AI itinerary to see your day-by-day plan.</p>
      </div>
    );
  }

  const {
    tripSummary = {},
    flights = [],
    hotels = [],
    nearbyHotels = [],
    dayWisePlan = [],
    packingList = [],
    tips = [],
  } = data;

  const totalDays = Number(trip?.duration_days) || Number(tripSummary.totalDays) || 6;
  const travelers = Number(trip?.travelers_count) || Number(tripSummary.travelers) || 2;

  const renderTimelineDay = (day) => (
    <div key={day.day} className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="bg-brand-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">
          DAY {day.day}
        </div>
        <span className="text-xs font-bold text-slate-700">{day.title}</span>
        {day.focusArea && (
          <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            {day.focusArea}
          </span>
        )}
      </div>

      <div className="relative pl-8 border-l-2 border-indigo-200 space-y-4 ml-2">
        {day.activities?.map((act, actIdx) => {
          const Icon = getActivityIcon(act.category);
          return (
            <div key={actIdx} className="relative">
              <div className="absolute -left-[41px] top-1 w-8 h-8 rounded-full bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="card p-4 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-indigo-600">{act.time || 'Flexible'}</span>
                  {act.duration && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {act.duration}
                    </span>
                  )}
                  {act.costEstimate && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {act.costEstimate}
                    </span>
                  )}
                </div>
                <h5 className="text-sm font-bold text-slate-900">{act.title}</h5>
                {act.description && <p className="text-xs text-slate-500 leading-relaxed">{act.description}</p>}
                <div className="space-y-1 pt-1">
                  {act.location && (
                    <div className="flex items-start gap-1.5 text-[11px] text-slate-600">
                      <MapPin className="w-3 h-3 text-indigo-500 mt-0.5 shrink-0" />
                      <span>
                        <span className="font-semibold">{act.location}</span>
                        {act.area ? ` · ${act.area}` : ''}
                      </span>
                    </div>
                  )}
                  {act.address && (
                    <div className="flex items-start gap-1.5 text-[11px] text-slate-400">
                      <Navigation className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                      <span>{act.address}</span>
                    </div>
                  )}
                  {act.nearbyTip && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
                      Tip: {act.nearbyTip}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {!showAllDays && (
        <div className="card rounded-3xl p-6 space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-indigo-600">
              <MapPin className="w-4 h-4" />
              <span>{tripSummary.destination || trip?.destination}</span>
              <span>•</span>
              <span>{totalDays} Days</span>
              <span>•</span>
              <span>{travelers} People</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">{tripSummary.title || trip?.title || 'Travel Plan'}</h2>
            {tripSummary.bestBaseArea && (
              <p className="text-xs text-slate-500 mt-1">Best base area: {tripSummary.bestBaseArea}</p>
            )}
          </div>
          {tripSummary.overview && <p className="text-slate-600 text-sm leading-relaxed">{tripSummary.overview}</p>}
        </div>
      )}

      {(hotels.length > 0 || nearbyHotels.length > 0) && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Hotel className="w-4 h-4 text-indigo-600" />
            Hotels & Nearby Stays
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hotels.map((hotel, idx) => (
              <div key={`h-${idx}`} className="card p-4 text-xs space-y-2 border-indigo-100">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-indigo-700">Primary Stay</span>
                  {hotel.priceRange && <span className="text-slate-400">{hotel.priceRange}</span>}
                </div>
                <div className="font-bold text-slate-900 text-sm">{hotel.hotelName}</div>
                <p className="text-slate-600">{hotel.address}</p>
                {hotel.area && <p className="text-indigo-600 font-semibold">{hotel.area}</p>}
                {hotel.whyRecommended && <p className="text-slate-500">{hotel.whyRecommended}</p>}
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
                  <span>In: {hotel.checkIn || '—'}</span>
                  <span>Out: {hotel.checkOut || '—'}</span>
                </div>
              </div>
            ))}
            {nearbyHotels.map((hotel, idx) => (
              <div key={`n-${idx}`} className="card p-4 text-xs space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-500">Nearby Hotel</span>
                  <span className="flex items-center gap-1 text-amber-600">
                    {hotel.ratingHint && <><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{hotel.ratingHint}</>}
                    {hotel.priceRange && <span className="text-slate-400 ml-1">{hotel.priceRange}</span>}
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{hotel.hotelName}</div>
                <p className="text-slate-600">{hotel.address}</p>
                <p className="text-indigo-600 font-semibold">
                  {hotel.area}{hotel.distanceFromCenter ? ` · ${hotel.distanceFromCenter}` : ''}
                </p>
                {hotel.whyRecommended && <p className="text-slate-500">{hotel.whyRecommended}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {flights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flights.map((flight, idx) => (
            <div key={idx} className="card p-4 text-xs space-y-2">
              <div className="font-bold text-indigo-600">Flight: {flight.airline} {flight.flightNumber}</div>
              <p className="text-slate-700">
                <span className="font-bold">{flight.departureAirport}</span> → <span className="font-bold">{flight.arrivalAirport}</span>
              </p>
              <p className="text-slate-500 text-[11px]">{flight.departureTime} — {flight.arrivalTime}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>Detailed Day-by-Day Itinerary</span>
        </h3>

        {showAllDays ? (
          <div className="space-y-8">{dayWisePlan.map(renderTimelineDay)}</div>
        ) : (
          <>
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              {dayWisePlan.map((d) => (
                <button
                  key={d.day}
                  onClick={() => setActiveDay(d.day)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-colors shrink-0 ${
                    activeDay === d.day ? 'bg-brand-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Day {d.day}
                </button>
              ))}
            </div>
            {dayWisePlan.filter((d) => d.day === activeDay).map(renderTimelineDay)}
          </>
        )}
      </div>

      {(packingList.length > 0 || tips.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packingList.length > 0 && (
            <div className="card rounded-3xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
                <Luggage className="w-4 h-4 text-indigo-600" />
                <span>Packing List</span>
              </h4>
              <div className="grid grid-cols-1 gap-2 text-xs text-slate-700">
                {packingList.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tips.length > 0 && (
            <div className="card rounded-3xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Travel Tips</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                {tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ItineraryCard;
