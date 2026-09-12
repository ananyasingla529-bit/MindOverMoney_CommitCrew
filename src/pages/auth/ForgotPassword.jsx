import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setIsLoading(true);

    try {
      await resetPassword(email);
      setStatus({ 
        type: 'success', 
        message: 'Password reset instructions have been sent to your email.' 
      });
      setEmail('');
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.message || 'Failed to send reset instructions' 
      });
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
          Reset password
        </h2>
        <p className="mt-2 text-center text-sm text-surface-500">
          Remembered your password?{' '}
          <Link to="/signin" className="font-medium text-surface-900 underline hover:text-surface-700 transition">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-minimal sm:rounded-2xl sm:px-10 border border-surface-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {status.type === 'error' && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2 text-red-600 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{status.message}</span>
              </div>
            )}
            
            {status.type === 'success' && (
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-start gap-2 text-green-700 text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{status.message}</span>
              </div>
            )}
            
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-surface-900 hover:bg-surface-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-surface-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send reset instructions'}
              {!isLoading && <ArrowRight className="w-4 h-4 stroke-[1.5]" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
