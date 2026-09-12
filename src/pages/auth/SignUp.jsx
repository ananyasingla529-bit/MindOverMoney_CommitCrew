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
    setError('');
    setIsLoading(true);

    try {
      const data = await signUp(email, password, name);
      const userId = data?.user?.id;
      
      if (userId) {
        // Migrate local coins if any
        const localUserId = getLocalUserId();
        const localCoinsStr = localStorage.getItem('mom_user_coins');
        const localScoreStr = localStorage.getItem('mom_user_quiz_score');
        
        if (localCoinsStr || localScoreStr) {
          const localCoins = parseInt(localCoinsStr || '150', 10);
          const localScore = parseInt(localScoreStr || '0', 10);
          
          if (localCoins !== 150 || localScore !== 0) {
            // Wait briefly for the DB trigger to create the profile row
            await new Promise(r => setTimeout(r, 1000));
            
            // Update newly created profile with local progress
            await supabase.from('user_profiles').update({
              coins: localCoins,
              total_quiz_score: localScore
            }).eq('id', userId);
            
            // Also update any practice investments from local user id to new user id
            await supabase.from('practice_investments').update({
              user_id: userId
            }).eq('user_id', localUserId);
            
            // And quiz attempts
            await supabase.from('quiz_attempts').update({
              user_id: userId
            }).eq('user_id', localUserId);
          }
        }
      }
      
      navigate('/explore');
    } catch (err) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
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
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  required
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
                  type="email"
                  required
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
                  required
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
