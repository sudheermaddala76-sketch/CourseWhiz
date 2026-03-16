import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Assuming server runs on 5000 or 3001, adjust if different (3001 is backend port)
      const res = await axios.post('http://localhost:3001/api/auth/login', formData);
      
      // Store token and user data
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Redirect to dashboard
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-cyan-900/20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-cyan-900/20 blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-cyan-500 rounded-2xl flex items-center justify-center transform rotate-3 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-transform hover:rotate-6 duration-300">
             <LogIn className="w-7 h-7 text-black transform -rotate-3 hover:-rotate-6 transition-transform duration-300" />
          </div>
        </div>
        <h2 className="mt-8 text-center text-4xl font-extrabold text-white tracking-tight">
          Welcome back
        </h2>
        <p className="mt-3 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
            Create a new account
          </Link>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-gray-900/60 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-cyan-900/20 sm:rounded-2xl sm:px-10 border border-gray-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg flex items-center">
                <p className="text-sm font-medium text-red-400">{error}</p>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3.5 bg-gray-950/80 border border-gray-700 rounded-xl shadow-inner placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3.5 bg-gray-950/80 border border-gray-700 rounded-xl shadow-inner placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-gray-950 border-gray-700 rounded text-cyan-500 focus:ring-cyan-500 focus:ring-offset-gray-900 cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] text-sm font-bold text-black ${loading ? 'bg-cyan-600' : 'bg-cyan-400 hover:bg-cyan-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:-translate-y-0.5'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 transition-all duration-200 transform`}
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
