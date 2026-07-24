import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, UserCheck, Sparkles, Plus, Trash2, Laptop } from 'lucide-react';
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

  // Saved accounts list stored in localStorage for laptop sessions
  const [savedAccounts, setSavedAccounts] = useState<
    Array<{ name: string; email: string; avatar: string; color: string; isDeviceActive?: boolean }>
  >(() => {
    try {
      const stored = localStorage.getItem('codexray_saved_google_accounts');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return [
      {
        name: 'Thrishal Yeggoni',
        email: defaultEmail,
        avatar: 'TY',
        color: 'bg-indigo-600',
        isDeviceActive: true,
      },
      {
        name: 'Thrishal Yeggoni (Dev)',
        email: 'thrishal.developer@gmail.com',
        avatar: 'TD',
        color: 'bg-emerald-600',
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('codexray_saved_google_accounts', JSON.stringify(savedAccounts));
    } catch {}
  }, [savedAccounts]);

  if (!isOpen) return null;

  const handleGoogleSignIn = (name: string, email: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const user: GoogleUser = {
        id: 'google-user-' + Date.now(),
        name: name || 'Google User',
        email: email || defaultEmail,
        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          name || 'google'
        )}`,
        signedInAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Ensure account is added to saved list if new
      if (!savedAccounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
        const initials = name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        const newAcc = {
          name,
          email,
          avatar: initials || 'GU',
          color: 'bg-purple-600',
          isDeviceActive: true,
        };
        setSavedAccounts((prev) => [newAcc, ...prev]);
      }

      setIsLoading(false);
      onSignInSuccess(user);
      onClose();
    }, 600);
  };

  const handleRemoveAccount = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedAccounts((prev) => prev.filter((a) => a.email !== email));
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
            <span className="font-bold text-sm tracking-tight">Sign in with Google Account</span>
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
              Select a Google account signed in on this device to sync code history, ChatGPT explanations, and study notes.
            </p>
          </div>

          {!isCustomMode ? (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-[11px] font-medium tracking-wide uppercase px-1">
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                  Accounts on this device ({savedAccounts.length})
                </span>
                <span className="text-emerald-500 dark:text-emerald-400 font-bold flex items-center space-x-1 text-[10px]">
                  <Laptop className="w-3 h-3" />
                  <span>Laptop Session Detected</span>
                </span>
              </div>

              {/* Dynamic Accounts List */}
              {savedAccounts.map((acc, index) => (
                <div
                  key={index}
                  onClick={() => handleGoogleSignIn(acc.name, acc.email)}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all group cursor-pointer ${
                    isLight
                      ? 'bg-slate-50 hover:bg-slate-100/90 border-slate-200/90 shadow-sm'
                      : 'bg-[#18181f] hover:bg-[#20202b] border-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3 text-left">
                    <div className={`w-9 h-9 rounded-full ${acc.color} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}>
                      {acc.avatar}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {acc.name}
                        </span>
                        {acc.isDeviceActive && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {acc.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                      <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                    {savedAccounts.length > 1 && (
                      <button
                        onClick={(e) => handleRemoveAccount(acc.email, e)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add / Custom Account Button */}
              <button
                disabled={isLoading}
                onClick={() => {
                  setIsCustomMode(true);
                  setCustomName('');
                  setCustomEmail('');
                }}
                className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs transition-all flex items-center justify-center space-x-2 border border-dashed cursor-pointer ${
                  isLight
                    ? 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    : 'border-white/20 text-slate-300 hover:bg-white/5'
                }`}
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>Use another Google account</span>
              </button>
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
