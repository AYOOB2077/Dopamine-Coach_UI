import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconSignOut } from '../shared/Icons';

export function SettingsScreen() {
  const navigate = useNavigate();
  // In a real application, you would fetch these from an API
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    // Force a full reload to clear any memory states if needed,
    // or just navigate and let the App component handle unauthenticated state.
    window.location.href = '/login';
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // API call to change password would go here
    setCurrentPassword('');
    setNewPassword('');
    alert('Password updated successfully (simulation)');
  };

  return (
    <div className="flex flex-col flex-1 pb-16 animate-in fade-in duration-300">
      <div className="page-head mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display tracking-tight">
          Settings
        </h1>
      </div>

      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 space-y-10">
        
        {/* User Info Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 font-display border-b border-gray-100 dark:border-gray-700 pb-2">
            Profile Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                disabled
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email address cannot be changed.</p>
            </div>
            <button className="px-5 py-2.5 bg-[var(--green)] text-white font-medium rounded-lg hover:opacity-90 transition-colors w-auto">
              Update Profile
            </button>
          </div>
        </section>

        {/* Change Password Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 font-display border-b border-gray-100 dark:border-gray-700 pb-2">
            Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Current Password</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition-shadow"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition-shadow"
                required
              />
            </div>
            <button type="submit" className="px-5 py-2.5 bg-[var(--green)] text-white font-medium rounded-lg hover:opacity-90 transition-colors w-auto">
              Change Password
            </button>
          </form>
        </section>

        {/* Danger Zone Section */}
        <section className="pt-4">
          <h2 className="text-xl font-semibold text-red-600 mb-4 font-display">
            Session
          </h2>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 border border-red-200 transition-colors w-auto"
          >
            <IconSignOut /> Log Out
          </button>
        </section>
        
      </div>
    </div>
  );
}
