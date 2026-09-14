import React, { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/Authcontext';
import authAPI from '../api/authApi';

export const Profile = () => {
  const { user, token, updateUserData } = useAuth();

  const [name, setName] = useState(user?.name || 'John');
  const [profileImage, setProfileImage] = useState(user?.profile_image || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);

    try {
      const res = await authAPI.updateProfile(token, {
        name,
        profile_image: profileImage,
        current_password: currentPassword || undefined,
        new_password: newPassword || undefined,
      });

      updateUserData(res.user);
      setMessage('Profile settings updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900">Profile & Preferences</h1>
          <p className="text-xs text-slate-500 font-medium">Manage account info, avatar preferences, and security credentials.</p>
        </div>

        {message && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex items-center space-x-2 text-emerald-700 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 flex items-center space-x-2 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Email Address</label>
            <input
              type="email"
              readOnly
              value={user?.email || 'john.doe@example.com'}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-500 font-semibold cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Avatar Image URL</label>
            <input
              type="text"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              placeholder="https://images.unsplash.com/photo-1534528741775-53994a69daeb"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Change Password</h4>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Required only if changing password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1e1b4b] hover:bg-[#2d2975] text-white font-semibold text-xs py-3 rounded-full transition-all shadow-2xs cursor-pointer"
          >
            {isSubmitting ? 'Saving Changes...' : 'Save Profile Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
