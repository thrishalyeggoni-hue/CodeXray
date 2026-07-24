import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { GoogleUser } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [initialSampleId, setInitialSampleId] = useState<string | undefined>(undefined);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('codexray_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  // Google User Auth State
  const [user, setUser] = useState<GoogleUser | null>(() => {
    const savedUser = localStorage.getItem('codexray_google_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('codexray_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLaunchDashboard = () => {
    setInitialSampleId('empty');
    setCurrentView('dashboard');
  };

  const handleSelectSample = (sampleId: string) => {
    setInitialSampleId(sampleId);
    setCurrentView('dashboard');
  };

  const handleSignInSuccess = (newUser: GoogleUser) => {
    setUser(newUser);
    localStorage.setItem('codexray_google_user', JSON.stringify(newUser));
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('codexray_google_user');
  };

  return (
    <div className={`min-h-screen relative transition-colors duration-300 font-sans overflow-x-hidden ${
      theme === 'light'
        ? 'bg-[#f8fafd] text-slate-800 selection:bg-blue-500/20 selection:text-blue-900 bg-grid-pattern-light'
        : 'bg-[#080912] text-slate-100 selection:bg-purple-500/30 selection:text-purple-200 bg-grid-pattern'
    }`}>
      {/* Dynamic Gemini Aurora Background Glow Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] animate-pulse-glow ${
          theme === 'light'
            ? 'bg-blue-400/20'
            : 'bg-blue-600/25'
        }`} />
        <div className={`absolute top-1/3 -right-32 w-[32rem] h-[32rem] rounded-full blur-[140px] animate-pulse-glow delay-1000 ${
          theme === 'light'
            ? 'bg-purple-300/20'
            : 'bg-purple-600/20'
        }`} />
        <div className={`absolute -bottom-32 left-1/3 w-[30rem] h-[30rem] rounded-full blur-[140px] animate-pulse-glow delay-2000 ${
          theme === 'light'
            ? 'bg-pink-300/20'
            : 'bg-pink-600/15'
        }`} />
        <div className={`absolute top-1/2 left-10 w-80 h-80 rounded-full blur-[120px] animate-pulse-glow delay-3000 ${
          theme === 'light'
            ? 'bg-cyan-300/15'
            : 'bg-cyan-500/15'
        }`} />
      </div>

      <div className="relative z-10">
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          onLaunchDashboard={handleLaunchDashboard}
          theme={theme}
          onToggleTheme={toggleTheme}
          user={user}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onSignOut={handleSignOut}
        />

        <main className="transition-all duration-300">
          {currentView === 'landing' ? (
            <LandingPage
              onLaunchDashboard={handleLaunchDashboard}
              onSelectSample={handleSelectSample}
              onOpenLogin={() => setIsLoginModalOpen(true)}
              user={user}
              theme={theme}
            />
          ) : (
            <Dashboard
              initialSampleId={initialSampleId}
              user={user}
              theme={theme}
            />
          )}
        </main>

        <GoogleAuthModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSignInSuccess={handleSignInSuccess}
          theme={theme}
        />
      </div>
    </div>
  );
}
