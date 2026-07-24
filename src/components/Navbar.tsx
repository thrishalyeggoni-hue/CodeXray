import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  LayoutDashboard,
  Home,
  Sun,
  Moon,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';
import { CodeXrayLogo } from './CodeXrayLogo';
import { GoogleUser } from '../types';

interface NavbarProps {
  currentView: 'landing' | 'dashboard';
  setCurrentView: (view: 'landing' | 'dashboard') => void;
  onLaunchDashboard?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  user?: GoogleUser | null;
  onOpenLogin?: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onLaunchDashboard,
  theme = 'dark',
  onToggleTheme,
  user,
  onOpenLogin,
  onSignOut,
}) => {
  const isLight = theme === 'light';
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 border-b backdrop-blur-xl ${
      isLight
        ? 'border-slate-200/80 bg-white/80 text-slate-800 shadow-sm'
        : 'border-white/10 bg-[#080911]/85 text-slate-100 shadow-lg shadow-black/20'
    }`}>
      {/* Moving 3px Multi-Color Gradient Accent Line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-violet-600 via-indigo-500 via-cyan-400 via-emerald-400 to-amber-400 animate-moving-gradient shadow-[0_0_12px_rgba(99,102,241,0.6)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Component */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentView('landing')}
            className="cursor-pointer group flex items-center space-x-2"
          >
            <CodeXrayLogo
              theme={theme}
              size={34}
              subtitle="Understand Code. Don't Just Copy It."
            />
          </motion.div>

          {/* Navigation Links, Theme Switcher & Google Account Login */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggleTheme}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all shadow-sm ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300/80'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15'
                }`}
                title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
              >
                {isLight ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline">Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                    <span className="hidden sm:inline">Light</span>
                  </>
                )}
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCurrentView('landing')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-medium backdrop-blur-md transition-all ${
                currentView === 'landing'
                  ? isLight
                    ? 'bg-slate-900 text-white font-semibold shadow-md'
                    : 'bg-gradient-to-r from-slate-800 to-slate-900 text-white border border-white/20 shadow-md'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                    : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Overview</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (onLaunchDashboard) {
                  onLaunchDashboard();
                } else {
                  setCurrentView('dashboard');
                }
              }}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-medium backdrop-blur-md transition-all duration-200 ${
                currentView === 'dashboard'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm border border-indigo-500/30'
                  : isLight
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    : 'bg-white/10 text-slate-200 hover:bg-white/15 border border-white/15'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Studio</span>
              <Sparkles className="w-3 h-3 text-indigo-200" />
            </motion.button>

            {/* Google Account Authentication */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center space-x-2 pl-1.5 pr-2.5 py-1 rounded-full border backdrop-blur-md transition-all ${
                    isLight
                      ? 'bg-white/70 border-slate-300/80 hover:bg-white/90 shadow-sm'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 shadow-sm'
                  }`}
                >
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-6 h-6 rounded-full border border-indigo-500/40 object-cover"
                  />
                  <span className={`text-xs font-semibold max-w-[100px] truncate hidden sm:inline ${
                    isLight ? 'text-slate-800' : 'text-slate-200'
                  }`}>
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div
                    className={`absolute right-0 mt-2 w-56 rounded-2xl border backdrop-blur-xl shadow-2xl p-2 space-y-1 z-50 ${
                      isLight ? 'bg-white/90 border-slate-200/90 text-slate-800' : 'bg-[#141419]/90 border-white/15 text-slate-200'
                    }`}
                  >
                    <div className="p-2 border-b border-white/10">
                      <p className="text-xs font-bold truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center space-x-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.39 7.36 24 12 24z"/>
                          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.61 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                        </svg>
                        <span className="text-[10px] text-emerald-500 font-medium">Google Connected</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (onLaunchDashboard) {
                          onLaunchDashboard();
                        } else {
                          setCurrentView('dashboard');
                        }
                      }}
                      className={`w-full flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Code Studio & History</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (onSignOut) onSignOut();
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm transition-all border ${
                  isLight
                    ? 'bg-white/80 hover:bg-white text-slate-800 border-slate-300'
                    : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/15'
                }`}
                title="Sign in with Google Account"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.39 7.36 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.61 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Sign in</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
