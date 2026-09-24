import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

import PasswordStrengthChecklist, {
  getPasswordStrengthChecks,
} from '../components/PasswordStrengthChecklist';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from '../firebase';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const passwordChecks = getPasswordStrengthChecks(formData.password);
  const isPasswordStrong = passwordChecks.every((rule) => rule.met);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim().toLowerCase();

    if (!isPasswordStrong) {
      setError(
        'Password must contain at least 8 characters, one lowercase letter, one uppercase letter, one number, and one special character.'
      );
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    let createdFirebaseUser = null;

    try {
      // 1. Create or sync user in Firebase
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          trimmedEmail,
          formData.password
        );
        createdFirebaseUser = userCredential.user;
      } catch (fbErr) {
        // If account already exists in Firebase (e.g. from an earlier interrupted attempt),
        // try signing in with the provided password to link it with MongoDB
        if (fbErr.code === 'auth/email-already-in-use') {
          userCredential = await signInWithEmailAndPassword(
            auth,
            trimmedEmail,
            formData.password
          );
        } else {
          throw fbErr;
        }
      }

      // 2. Create user in MongoDB to get the required database ID
      const res = await axios.post('http://localhost:3001/api/auth/register', {
        name: trimmedName,
        email: trimmedEmail,
        password: formData.password
      });

      // Save the MongoDB user object (which contains the .id) locally
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // Redirect after signup
      navigate('/');
    } catch (err) {
      // If MongoDB registration failed, clean up the newly created Firebase user to prevent orphaned accounts
      if (createdFirebaseUser) {
        try {
          await createdFirebaseUser.delete();
        } catch (cleanupErr) {
          console.warn('Failed to rollback Firebase user:', cleanupErr);
        }
      }

      if (
        err.code === 'auth/email-already-in-use' ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.response?.data?.message === 'User already exists'
      ) {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.response?.data?.message || err.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-cyan-900/20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-cyan-900/20 blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">

        <div className="flex justify-center">
          <div className="w-14 h-14 bg-cyan-500 rounded-2xl flex items-center justify-center transform rotate-3 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <UserPlus className="w-7 h-7 text-black" />
          </div>
        </div>

        <h2 className="mt-8 text-center text-4xl font-extrabold text-white tracking-tight">
          Create an account
        </h2>

        <p className="mt-3 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-cyan-400 hover:text-cyan-300"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">

        <div className="bg-gray-900/60 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-cyan-900/20 sm:rounded-2xl sm:px-10 border border-gray-800">

          <form className="space-y-5" onSubmit={handleSubmit}>

            {error && (
              <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-sm text-red-400">
                  {error}
                  {(error.includes('sign in') || error.includes('log in')) && (
                    <Link to="/login" className="underline font-bold ml-1 text-cyan-400 hover:text-cyan-300">
                      Sign in here &rarr;
                    </Link>
                  )}
                </p>
              </div>
            )}

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-1.5"
              >
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="appearance-none block w-full px-4 py-3 bg-gray-950/80 border border-gray-700 rounded-xl placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1.5"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="appearance-none block w-full px-4 py-3 bg-gray-950/80 border border-gray-700 rounded-xl placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1.5"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
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
              <PasswordStrengthChecklist password={formData.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-1.5"
              >
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
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

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-black transition-all duration-200 ${loading
                    ? 'bg-cyan-600'
                    : 'bg-cyan-400 hover:bg-cyan-300'
                  }`}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};


export default Signup;