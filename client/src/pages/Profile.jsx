import React from 'react';
import { User, Mail, Calendar } from 'lucide-react';

const Profile = () => {
    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
            <div className="bg-secondary border border-gray-800 rounded-2xl p-8 relative overflow-hidden shadow-2xl shadow-cyan-900/10 hover:border-gray-700 transition-all duration-300">
                {/* Decorative background circle */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar */}
                    <div className="w-32 h-32 bg-gray-900/80 rounded-full flex items-center justify-center border-4 border-gray-800 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-sm group hover:border-cyan-800 transition-colors duration-300">
                        <User className="w-16 h-16 text-cyan-500 transform group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 space-y-4 text-center md:text-left w-full">
                        <div>
                            <h2 className="text-4xl font-extrabold text-white tracking-tight">{user?.name || 'Student'}</h2>
                            <span className="inline-block mt-3 px-4 py-1.5 bg-cyan-950/50 text-cyan-400 text-sm font-semibold rounded-full border border-cyan-900/50 shadow-inner">
                                Student Learner
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-800/60 mt-4">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/40 border border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                                <div className="p-2 bg-gray-800 rounded-lg">
                                    <Mail className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div className="flex flex-col text-left overflow-hidden">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Email</span>
                                    <span className="text-gray-300 font-medium truncate" title={user?.email || 'No email provided'}>{user?.email || 'No email provided'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/40 border border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                                <div className="p-2 bg-gray-800 rounded-lg">
                                    <Calendar className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Joined</span>
                                    <span className="text-gray-300 font-medium">
                                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Points Section */}
                        <div className="mt-4 p-5 rounded-xl bg-gradient-to-br from-cyan-900/40 to-primary/10 border border-cyan-800/50 flex items-center justify-between shadow-lg shadow-cyan-900/20">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="text-2xl text-cyan-400">✨</span> Learning Points
                                </h3>
                                <p className="text-sm text-cyan-200 mt-1">Earn points by taking quizzes!</p>
                            </div>
                            <div className="flex items-end gap-1">
                                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-primary drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                                    {user?.points || 0}
                                </span>
                                <span className="text-cyan-500 font-bold mb-1">pts</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
