import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';

import {
  auth,
  signInWithEmailAndPassword
} from '../firebase';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    const trimmedEmail = formData.email.trim().toLowerCase();

    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        trimmedEmail,
        formData.password
      );

      const firebaseToken = await userCredential.user.getIdToken();

      // 2. Authenticate with MongoDB to get the required database ID and user points
      const res = await axios.post('https://coursewhiz-backend-xt2i.onrender.com/api/auth/login', {
        email: trimmedEmail,
        password: formData.password,
        firebaseToken
      });

      // Save the MongoDB user object (which contains the .id) locally
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      navigate('/');
    } catch (err) {
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.response?.data?.message === 'Invalid Credentials'
      ) {
        setError('Invalid email or password.');
      } else {
        setError(err.response?.data?.message || err.message || 'Login failed.');
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
            <LogIn className="w-7 h-7 text-black" />
          </div>
        </div>

        <h2 className="mt-8 text-center text-4xl font-extrabold text-white tracking-tight">
          Welcome back
        </h2>

        <p className="mt-3 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-semibold text-cyan-400 hover:text-cyan-300"
          >
            Create a new account
          </Link>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">

        <div className="bg-gray-900/60 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-cyan-900/20 sm:rounded-2xl sm:px-10 border border-gray-800">

          <form className="space-y-6" onSubmit={handleSubmit}>

            {error && (
              <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-sm text-red-400">
                  {error}
                </p>
              </div>
            )}

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
                className="appearance-none block w-full px-4 py-3.5 bg-gray-950/80 border border-gray-700 rounded-xl placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
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
                  className="appearance-none block w-full px-4 py-3.5 pr-11 bg-gray-950/80 border border-gray-700 rounded-xl placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
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
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-2">

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-gray-950 border-gray-700 rounded text-cyan-500"
                />

                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-300"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-black transition-all duration-200 ${loading
                    ? 'bg-cyan-600'
                    : 'bg-cyan-400 hover:bg-cyan-300'
                  }`}
              >
                {loading ? 'Authenticating...' : 'Sign in'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;