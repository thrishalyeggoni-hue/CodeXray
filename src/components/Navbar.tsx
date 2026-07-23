import React, { useState } from 'react';
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
  theme = 'dark',
  onToggleTheme,
  user,
  onOpenLogin,
  onSignOut,
}) => {
  const isLight = theme === 'light';
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-200 border-b backdrop-blur-md ${
      isLight
        ? 'border-slate-200 bg-white/90 text-slate-800 shadow-sm'
        : 'border-white/5 bg-[#0e0e10]/90 text-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Transparent Logo Component */}
          <div
            onClick={() => setCurrentView('landing')}
            className="cursor-pointer group"
          >
            <CodeXrayLogo
              theme={theme}
              size={34}
              subtitle="Understand Code. Don't Just Copy It."
            />
          </div>

          {/* Navigation Links, Theme Switcher & Google Account Login */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
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
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Light</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setCurrentView('landing')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                currentView === 'landing'
                  ? isLight
                    ? 'bg-slate-200 text-slate-900 font-semibold'
                    : 'bg-white/10 text-white border border-white/10 shadow-sm'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Overview</span>
            </button>

            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all duration-200 shadow-md ${
                currentView === 'dashboard'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 ring-1 ring-indigo-400/30'
                  : isLight
                    ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                    : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Studio</span>
              <Sparkles className="w-3 h-3 text-indigo-200 animate-pulse" />
            </button>

            {/* Google Account Authentication */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center space-x-2 pl-1.5 pr-2 py-1 rounded-full border transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 hover:bg-slate-100'
                      : 'bg-[#16161c] border-white/10 hover:bg-white/10'
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
                    className={`absolute right-0 mt-2 w-56 rounded-xl border shadow-2xl p-2 space-y-1 z-50 ${
                      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#141419] border-white/10 text-slate-200'
                    }`}
                  >
                    <div className="p-2 border-b border-white/5">
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
                        setCurrentView('dashboard');
                      }}
                      className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/5 text-slate-300'
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
                      className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-500 hover:bg-rose-500/10 transition-colors"
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
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-sm transition-all"
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
