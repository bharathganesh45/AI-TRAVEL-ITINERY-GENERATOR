import React, { useState, useEffect } from 'react';
import { Sparkles, Plane, Hotel, Train, CheckCircle2, Loader2 } from 'lucide-react';

const STEPS = [
  'Reading your bookings',
  'Extracting travel dates',
  'Organising your transportation',
  'Planning your daily schedule',
  'Finalising your itinerary',
];

export const AIGenerationScreen = ({ trip, documents = [], onComplete }) => {
  const [completedSteps, setCompletedSteps] = useState(0);
  const [showButton, setShowButton] = useState(false);

  const flightCount = documents.filter((d) =>
    (d.document_type || d.booking_type || '').toLowerCase().includes('flight')
  ).length || 2;
  const hotelCount = documents.filter((d) =>
    (d.document_type || d.booking_type || '').toLowerCase().includes('hotel')
  ).length || 1;
  const trainCount = documents.filter((d) =>
    (d.document_type || d.booking_type || '').toLowerCase().includes('train')
  ).length || 1;

  useEffect(() => {
    const timers = STEPS.map((_, i) =>
      setTimeout(() => setCompletedSteps(i + 1), (i + 1) * 900)
    );
    const doneTimer = setTimeout(() => setShowButton(true), STEPS.length * 900 + 400);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 bg-indigo-50 rounded-2xl">
          <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">AI is planning your journey</h1>
        <p className="text-sm text-slate-500">Creating your personalised itinerary...</p>
      </div>

      <div className="card p-5 space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">We found</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Plane, label: `${flightCount} Flights` },
            { icon: Hotel, label: `${hotelCount} Hotel` },
            { icon: Train, label: `${trainCount} Train` },
            { icon: Sparkles, label: `${trip?.duration_days || 6} Days` },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 bg-slate-50 rounded-xl p-3 text-sm font-semibold text-slate-800">
              <Icon className="w-4 h-4 text-indigo-600" />
              {label}
            </div>
          ))}
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3 text-sm font-semibold text-slate-800 col-span-2">
            👥 {trip?.travelers_count || 2} People
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        {STEPS.map((step, i) => {
          const done = completedSteps > i;
          const active = completedSteps === i;
          return (
            <div key={step} className="flex items-center gap-3 text-sm">
              {done ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : active ? (
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-slate-200 shrink-0" />
              )}
              <span className={done ? 'text-emerald-700 font-medium' : active ? 'text-indigo-700 font-semibold' : 'text-slate-400'}>
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {showButton && (
        <button onClick={onComplete} className="btn-primary w-full justify-center py-3 text-sm">
          <Sparkles className="w-4 h-4" />
          View My Itinerary
        </button>
      )}
    </div>
  );
};

export default AIGenerationScreen;
