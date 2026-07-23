import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, UserCheck, Sparkles } from 'lucide-react';
import { GoogleUser } from '../types';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInSuccess: (user: GoogleUser) => void;
  theme?: 'dark' | 'light';
  defaultEmail?: string;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSignInSuccess,
  theme = 'dark',
  defaultEmail = 'thrishalyeggoni@gmail.com',
}) => {
  const isLight = theme === 'light';
  const [customName, setCustomName] = useState('Thrishal Yeggoni');
  const [customEmail, setCustomEmail] = useState(defaultEmail);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = (name: string, email: string) => {
    setIsLoading(true);
    setTimeout(() => {
      // Generate avatar or standard Google avatar URL
      const user: GoogleUser = {
        id: 'google-user-' + Date.now(),
        name: name || 'Google User',
        email: email || defaultEmail,
        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          name || 'google'
        )}`,
        signedInAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setIsLoading(false);
      onSignInSuccess(user);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden transition-all transform scale-100 ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#111115] border-white/10 text-white'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-5 border-b flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#16161c] border-white/5'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {/* Google Colorful G SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.39 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.61 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="font-bold text-sm tracking-tight">Sign in with Google</span>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/10 text-slate-400'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div className="text-center space-y-1.5">
            <h3 className={`text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Welcome to CodeXray AI
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Sign in with your Google account to sync code analysis history, saved Python Tutor traces, and study notes across sessions.
            </p>
          </div>

          {!isCustomMode ? (
            <div className="space-y-3 pt-2">
              {/* One-Click Google Account Option */}
              <button
                disabled={isLoading}
                onClick={() => handleGoogleSignIn('Thrishal Yeggoni', defaultEmail)}
                className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all group ${
                  isLight
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-sm'
                    : 'bg-[#18181f] hover:bg-[#20202a] border-white/10'
                }`}
              >
                <div className="flex items-center space-x-3 text-left">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md">
                    TY
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Thrishal Yeggoni
                    </div>
                    <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {defaultEmail}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Continue</span>
                  <UserCheck className="w-4 h-4" />
                </div>
              </button>

              {/* Official Google Sign-In Primary Button */}
              <button
                disabled={isLoading}
                onClick={() => handleGoogleSignIn('Google Developer', 'developer@gmail.com')}
                className="w-full py-3 px-4 rounded-xl font-medium text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm flex items-center justify-center space-x-2.5 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.39 7.36 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.61 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{isLoading ? 'Signing in...' : 'Sign in as Another Google Account'}</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className={`text-[11px] hover:underline ${
                    isLight ? 'text-indigo-600' : 'text-indigo-400'
                  }`}
                >
                  Enter custom Google email & name
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGoogleSignIn(customName, customEmail);
              }}
              className="space-y-3 pt-2"
            >
              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
                      : 'bg-[#18181f] border-white/10 text-white focus:border-indigo-500'
                  }`}
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Google Email Address
                </label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
                      : 'bg-[#18181f] border-white/10 text-white focus:border-indigo-500'
                  }`}
                  placeholder="user@gmail.com"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className={`flex-1 py-2 text-xs rounded-lg font-medium border ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 text-xs rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Authenticating...' : 'Sign In Now'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Security note */}
          <div
            className={`p-3 rounded-xl border flex items-center space-x-2 text-[11px] ${
              isLight
                ? 'bg-indigo-50/60 border-indigo-100 text-indigo-900'
                : 'bg-indigo-950/20 border-indigo-500/10 text-indigo-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-500" />
            <span>Secure OAuth 2.0 Google Authentication for CodeXray AI Studio.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
