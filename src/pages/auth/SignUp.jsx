import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getLocalUserId } from '../../services/userService';
import { supabase } from '../../services/supabaseClient';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signUp(email || 'user@example.com', password || 'password', name || 'Demo User');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      navigate('/explore', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-full border border-surface-300 bg-white flex items-center justify-center text-surface-900 font-bold shadow-minimal">
            M
          </div>
          <span className="font-semibold text-xl tracking-tight text-surface-900">
            Mind Over Money
          </span>
        </Link>
        <h2 className="text-center text-3xl font-bold text-surface-900">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-surface-500">
          Already have an account?{' '}
          <Link to="/signin" className="font-medium text-surface-900 underline hover:text-surface-700 transition">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-minimal sm:rounded-2xl sm:px-10 border border-surface-200">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2 text-red-600 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-surface-700">
                Full name
              </label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-surface-400 stroke-[1.5]" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 bg-surface-50 border border-surface-200 rounded-xl py-2.5 text-surface-900 placeholder-surface-400 focus:ring-2 focus:ring-surface-900 focus:border-transparent transition sm:text-sm"
                  placeholder="Jane Doe"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700">
                Email address
              </label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-surface-400 stroke-[1.5]" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 bg-surface-50 border border-surface-200 rounded-xl py-2.5 text-surface-900 placeholder-surface-400 focus:ring-2 focus:ring-surface-900 focus:border-transparent transition sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700">
                Password
              </label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-surface-400 stroke-[1.5]" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 bg-surface-50 border border-surface-200 rounded-xl py-2.5 text-surface-900 placeholder-surface-400 focus:ring-2 focus:ring-surface-900 focus:border-transparent transition sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-surface-900 hover:bg-surface-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-surface-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
              {!isLoading && <ArrowRight className="w-4 h-4 stroke-[1.5]" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
