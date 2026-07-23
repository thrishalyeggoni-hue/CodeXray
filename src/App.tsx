import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [initialSampleId, setInitialSampleId] = useState<string | undefined>(undefined);

  const handleLaunchDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleSelectSample = (sampleId: string) => {
    setInitialSampleId(sampleId);
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <main className="transition-all duration-300">
        {currentView === 'landing' ? (
          <LandingPage
            onLaunchDashboard={handleLaunchDashboard}
            onSelectSample={handleSelectSample}
          />
        ) : (
          <Dashboard initialSampleId={initialSampleId} />
        )}
      </main>
    </div>
  );
}
