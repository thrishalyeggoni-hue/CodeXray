import React from 'react';
import {
  Code2,
  Sparkles,
  LayoutDashboard,
  Home,
  BookOpen,
  Key,
  Layers,
} from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'dashboard';
  setCurrentView: (view: 'landing' | 'dashboard') => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0e0e10]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => setCurrentView('landing')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold tracking-tight text-white font-mono">
                  Code<span className="text-indigo-400">Xray</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-400/30 rounded uppercase">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Understand Code. Don't Just Copy It.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setCurrentView('landing')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                currentView === 'landing'
                  ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Overview</span>
            </button>

            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded text-xs font-semibold transition-all duration-200 shadow-lg ${
                currentView === 'dashboard'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 ring-1 ring-indigo-400/30'
                  : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Launch Studio</span>
              <Sparkles className="w-3 h-3 text-indigo-200 animate-pulse" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
