import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Plane, Hotel, Train, MapPin, Upload, Brain, Map } from 'lucide-react';
import { useAuth } from '../context/Authcontext';

export const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-24 pb-20 w-full pt-8">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-full text-indigo-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upload your bookings. Let AI plan your journey.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Your entire trip.<br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Planned by AI.</span>
          </h1>

          <p className="text-slate-500 text-sm sm:text-base max-w-lg leading-relaxed">
            Upload your flight tickets, hotel bookings, and travel documents. TripAI extracts your travel details and creates a personalised itinerary in seconds.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to={isAuthenticated ? '/upload' : '/register'} className="btn-primary !text-sm !px-6 !py-3">
              <Sparkles className="w-4 h-4" />
              Create My Trip
            </Link>
            <a href="#how-it-works" className="btn-secondary !text-sm !px-6 !py-3">
              See How It Works
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 relative flex justify-center">
          <div className="w-full max-w-sm card rounded-3xl p-6 relative overflow-hidden space-y-4 transform hover:-translate-y-1 transition-all glow-backdrop">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Dubai Adventure</h3>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold text-[10px] rounded-full">
                Active Plan
              </span>
            </div>

            <div className="space-y-2 text-xs font-medium text-slate-700">
              {[
                { icon: Plane, label: 'Flight' },
                { icon: Hotel, label: 'Hotel' },
                { icon: Train, label: 'Train' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center space-x-2.5 p-2 bg-slate-50 rounded-xl">
                  <Icon className="w-4 h-4 text-indigo-600" />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/80 rounded-2xl flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-950">AI Generated Itinerary</span>
            </div>

            <div className="h-28 rounded-2xl overflow-hidden relative mt-2">
              <img
                src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80"
                alt="Dubai Skyline"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3">
                <p className="text-white font-bold text-xs flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Dubai, United Arab Emirates</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-center">
        <div className="space-y-2">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">How It Works</h2>
          <p className="text-2xl font-black text-slate-900">3 Simple Steps to Your Perfect Journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {[
            { step: '01 — Upload', icon: Upload, title: 'Upload your travel documents', desc: 'PDFs, images, flight tickets, hotel bookings, and more.' },
            { step: '02 — AI Understands', icon: Brain, title: 'AI extracts your travel details', desc: 'AI identifies dates, locations, bookings, and transportation.', highlight: true },
            { step: '03 — Get Your Itinerary', icon: Map, title: 'Receive your personalised travel plan', desc: 'Get a structured day-by-day itinerary with recommendations.' },
          ].map(({ step, icon: Icon, title, desc, highlight }) => (
            <div key={step} className={highlight ? 'relative group' : ''}>
              {highlight && (
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-500" />
              )}
              <div className={`relative card rounded-3xl p-6 text-left space-y-3 h-full ${highlight ? 'border-indigo-100 shadow-md' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800">{step}</span>
                  <Icon className={`w-5 h-5 ${highlight ? 'text-purple-600' : 'text-slate-500'}`} />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card rounded-3xl p-8 sm:p-12 text-center space-y-4 bg-gradient-to-br from-indigo-50 to-white">
          <Sparkles className="w-8 h-8 text-indigo-600 mx-auto" />
          <h2 className="text-2xl font-black text-slate-900">Premium travel planning, powered by AI</h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            From document upload to a beautiful day-by-day itinerary — TripAI handles the entire journey so you can focus on the adventure.
          </p>
          <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn-primary inline-flex !text-sm !px-6 !py-3">
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
