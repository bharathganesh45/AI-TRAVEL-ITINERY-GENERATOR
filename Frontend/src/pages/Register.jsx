import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, User, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/Authcontext';
import authAPI from '../api/authApi';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await authAPI.register({ name, email, password });
      login(res.user, res.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Travel-themed SVG background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="bg1" x1="0%25" y1="0%25" x2="100%25" y2="100%25"><stop offset="0%25" style="stop-color:%2306B6D4;stop-opacity:0.1" /><stop offset="100%25" style="stop-color:%234F46E5;stop-opacity:0.1" /></linearGradient></defs><rect fill="%23F8FAFC" width="1200" height="800"/><path fill="url(%23bg1)" d="M0,400 Q300,250 600,400 T1200,400 L1200,800 L0,800 Z"/><circle cx="80" cy="120" r="70" fill="%2306B6D4" opacity="0.08"/><circle cx="1100" cy="650" r="100" fill="%234F46E5" opacity="0.08"/><path stroke="%2306B6D4" stroke-width="2" fill="none" opacity="0.15" d="M200,200 L400,300 M800,150 L950,280 M150,600 L380,480"/><text x="600" y="100" text-anchor="middle" font-size="80" opacity="0.05" fill="%234F46E5">✈</text></svg>')`,
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/85 via-white/75 to-indigo-50/85"></div>
      </div>

      {/* Content - Centered */}
      <div className="relative z-10 w-full max-w-md px-4 py-12">
        {/* Header - Centered */}
        <div className="text-center space-y-4 mb-10">
          <div className="flex justify-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">Start Your Journey</h1>
            <p className="text-slate-600 text-lg">Create your TripAI account and explore the world</p>
          </div>
        </div>

        {/* Card - Centered */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="p-8 space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 animate-pulse">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Full Name</label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 pl-12 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-slate-50 hover:bg-white"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 pl-12 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-slate-50 hover:bg-white"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-4 pl-12 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-slate-50 hover:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl p-4 space-y-3 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Password Requirements</p>
                  <div className="flex items-center gap-3">
                    {password.length >= 8 ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                    )}
                    <span className={password.length >= 8 ? 'text-sm text-emerald-700 font-semibold' : 'text-sm text-slate-600'}>
                      At least 8 characters
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || password.length < 8}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <span>{isSubmitting ? 'Creating account...' : 'Create Account'}</span>
                {!isSubmitting && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-xs text-slate-500 font-medium">Already exploring?</span>
              </div>
            </div>

            {/* Sign In Link */}
            <Link
              to="/login"
              className="w-full border-2 border-indigo-200 hover:border-indigo-400 text-indigo-700 hover:bg-indigo-50 font-bold py-3.5 rounded-xl transition text-center block transform hover:scale-[1.01]"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Footer - Centered */}
        <p className="text-center text-xs text-slate-600 mt-8 px-2 leading-relaxed">
          By creating an account, you agree to our{' '}
          <button className="text-indigo-600 hover:text-indigo-700 hover:underline font-semibold" onClick={(e) => { e.preventDefault(); }}>
            Terms of Service
          </button>
          {' '}and{' '}
          <button className="text-indigo-600 hover:text-indigo-700 hover:underline font-semibold" onClick={(e) => { e.preventDefault(); }}>
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
