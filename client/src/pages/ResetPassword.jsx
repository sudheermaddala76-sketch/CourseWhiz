import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

import PasswordStrengthChecklist, {
  getPasswordStrengthChecks,
} from '../components/PasswordStrengthChecklist';
import { auth, confirmPasswordReset, verifyPasswordResetCode } from '../firebase';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeValid, setCodeValid] = useState(false);
  const [checkingCode, setCheckingCode] = useState(true);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const oobCode = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('oobCode') || params.get('code') || '';
  }, [location.search]);

  const passwordChecks = getPasswordStrengthChecks(password);
  const isPasswordStrong = passwordChecks.every((rule) => rule.met);

  useEffect(() => {
    if (!oobCode) {
      setCodeValid(false);
      setCheckingCode(false);
      setError('This reset link is invalid or expired. Please request a new password reset email.');
      return;
    }

    const validateCode = async () => {
      try {
        await verifyPasswordResetCode(auth, oobCode);
        setCodeValid(true);
        setError('');
      } catch (err) {
        const code = err?.code;
        if (code === 'auth/expired-action-code' || code === 'auth/invalid-action-code') {
          setError('This reset link is invalid or expired. Please request a new password reset email.');
        } else if (code === 'auth/network-request-failed') {
          setError('Network error. Please try again.');
        } else {
          setError('This reset link could not be verified. Please request a new password reset email.');
        }
        setCodeValid(false);
      } finally {
        setCheckingCode(false);
      }
    };

    validateCode();
  }, [oobCode]);

  useEffect(() => {
    if (!success) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/forgot-password', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [success, navigate]);

  const handleContinue = () => {
    navigate('/forgot-password', { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!oobCode) {
      setError('This reset link is invalid or expired. Please request a new password reset email.');
      return;
    }

    if (!isPasswordStrong) {
      setError(
        'Password must contain at least 8 characters, one lowercase letter, one uppercase letter, one number, and one special character.'
      );
      return;
    }

    if (!password.trim() || !confirmPassword.trim()) {
      setError('Please enter and confirm your new password.');
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    try {
      setLoading(true);
      await confirmPasswordReset(auth, oobCode, password);
      setPassword('');
      setConfirmPassword('');
      setSuccess(true);
    } catch (err) {
      const code = err?.code;

      if (code === 'auth/expired-action-code') {
        setError('This reset link has expired. Please request a new one.');
      } else if (code === 'auth/invalid-action-code') {
        setError('This reset link is invalid or has already been used. Please request a new password reset email.');
      } else if (code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait a moment and try again.');
      } else {
        setError('Unable to reset your password right now. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingCode) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 text-white">
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl px-8 py-6 text-center shadow-2xl shadow-cyan-900/20">
          <p className="text-sm text-gray-300">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center py-12 px-4 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-cyan-900/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-cyan-900/20 blur-3xl pointer-events-none" />

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-gray-900/60 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-cyan-900/20 sm:rounded-2xl sm:px-10 border border-gray-800 text-center">
            <div className="w-14 h-14 mx-auto bg-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <CheckCircle2 className="w-7 h-7 text-black" />
            </div>

            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
              Password Reset Successfully
            </h2>

            <p className="mt-4 text-sm text-gray-300">
              Your password has been updated successfully.
            </p>

            <p className="mt-4 text-sm text-cyan-400">
              Redirecting you back to reset email page... {countdown}s
            </p>

            <button
              type="button"
              onClick={handleContinue}
              className="mt-6 w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-all duration-200"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-cyan-900/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-cyan-900/20 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <ShieldCheck className="w-7 h-7 text-black" />
          </div>
        </div>

        <h2 className="mt-8 text-center text-4xl font-extrabold text-white tracking-tight">
          Set new password
        </h2>

        <p className="mt-3 text-center text-sm text-gray-400">
          Choose a strong password to secure your account.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-gray-900/60 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-cyan-900/20 sm:rounded-2xl sm:px-10 border border-gray-800">
          {!codeValid ? (
            <div className="space-y-4">
              <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-sm text-red-300">{error}</p>
              </div>
              <div className="pt-2">
                <Link
                  to="/forgot-password"
                  className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-all duration-200"
                >
                  Request a new reset link
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="appearance-none block w-full px-4 py-3 pr-11 bg-gray-950/80 border border-gray-700 rounded-xl placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-cyan-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <PasswordStrengthChecklist password={password} />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="appearance-none block w-full px-4 py-3 pr-11 bg-gray-950/80 border border-gray-700 rounded-xl placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-cyan-300"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-black transition-all duration-200 ${loading ? 'bg-cyan-600 cursor-not-allowed' : 'bg-cyan-400 hover:bg-cyan-300'}`}
                >
                  {loading ? 'Updating password...' : 'Reset password'}
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
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

