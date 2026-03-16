import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, LogOut, Code2, Sparkles } from 'lucide-react';
import FallingPapers from './FallingPapers';

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const [showAnimation, setShowAnimation] = useState(() => {
        const saved = localStorage.getItem('showFallingPapers');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const toggleAnimation = () => {
        setShowAnimation(prev => {
            const next = !prev;
            localStorage.setItem('showFallingPapers', JSON.stringify(next));
            return next;
        });
    };

    return (
        <div className="min-h-screen bg-background text-text flex flex-col font-sans relative">
            {showAnimation && <FallingPapers />}
            {/* Navbar */}
            <nav className="border-b border-gray-800 bg-background/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Code2 className="h-8 w-8 text-primary mr-2" />
                            <span className="text-xl font-bold tracking-tight text-white">CourseWhiz</span>
                        </div>

                        {/* Center Nav */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/" className={`flex items-center text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                Dashboard
                            </Link>
                            <Link to="/new" className={`flex items-center text-sm font-medium transition-colors ${location.pathname === '/new' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Create Course
                            </Link>
                        </div>

                        {/* Right Nav */}
                        <div className="flex items-center space-x-6">
                            <button onClick={toggleAnimation} className={`flex items-center text-sm transition-colors ${showAnimation ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`} title="Toggle Background Animation">
                                <Sparkles className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">{showAnimation ? 'Effects On' : 'Effects Off'}</span>
                            </button>
                            <span className="text-sm text-gray-400 hidden sm:inline">
                                Welcome,{' '}
                                <Link to="/profile" className="text-white font-medium hover:text-cyan-400 transition-colors drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                                    {user ? user.name : 'Student'}
                                </Link>
                            </span>
                            <button onClick={handleLogout} className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
                                <LogOut className="w-4 h-4 mr-1" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
