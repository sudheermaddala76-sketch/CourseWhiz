import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';

import { auth } from '../firebase';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, trimmedEmail, {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true,
      });

      setSuccess(
        `A password reset link has been sent to ${trimmedEmail}. Please check your inbox and spam folder, then follow the link to set a new password.`
      );
      setEmail('');
    } catch (err) {
      const code = err?.code;

      if (code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many reset attempts. Please wait a moment and try again.');
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Unable to send reset link right now. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-cyan-900/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-cyan-900/20 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <KeyRound className="w-7 h-7 text-black" />
          </div>
        </div>

        <h2 className="mt-8 text-center text-4xl font-extrabold text-white tracking-tight">
          Reset password
        </h2>

        <p className="mt-3 text-center text-sm text-gray-400">
          Enter your registered email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-gray-900/60 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-cyan-900/20 sm:rounded-2xl sm:px-10 border border-gray-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="space-y-5">
                <div className="w-12 h-12 mx-auto bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div className="bg-red-900/30 border border-red-700/50 p-4 rounded-xl">
                  <p className="text-sm text-red-200 leading-relaxed">{success}</p>
                </div>

                <div className="pt-2">
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-all duration-200"
                  >
                    Return to Sign in
                  </Link>
                </div>
              </div>
            )}

            {!success && (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Email address
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                      <Mail className="w-5 h-5" />
                    </div>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="appearance-none block w-full pl-11 pr-4 py-3.5 bg-gray-950/80 border border-gray-700 rounded-xl placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-black transition-all duration-200 ${loading ? 'bg-cyan-600 cursor-not-allowed' : 'bg-cyan-400 hover:bg-cyan-300'}`}
                  >
                    {loading ? 'Sending reset link...' : 'Send reset link'}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center text-sm font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    Back to Sign in
                  </Link>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
