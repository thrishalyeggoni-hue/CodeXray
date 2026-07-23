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
    <div className={`min-h-screen transition-colors duration-200 font-sans ${
      theme === 'light'
        ? 'bg-slate-100 text-slate-800 selection:bg-indigo-500/20 selection:text-indigo-900'
        : 'bg-[#0a0a0b] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200'
    }`}>
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
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
  );
}
