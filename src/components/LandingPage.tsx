import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Layers,
  Activity,
  GitFork,
  HelpCircle,
  MessagesSquare,
  BookOpen,
  ArrowRight,
  Play,
  ChevronDown,
  Cpu,
  MonitorPlay,
  Network,
  ListTree,
} from 'lucide-react';
import { GoogleUser } from '../types';

interface LandingPageProps {
  onLaunchDashboard: () => void;
  onSelectSample: (sampleId: string) => void;
  onOpenLogin?: () => void;
  user?: GoogleUser | null;
  theme?: 'dark' | 'light';
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchDashboard,
  onSelectSample,
  onOpenLogin,
  user,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const features = [
    {
      icon: MonitorPlay,
      title: 'Python Tutor Memory Visualizer (HIGHLIGHT)',
      description:
        'Step-by-step memory execution tracer. Inspect local stack frames, heap objects, global pointers, and array mutations in real-time.',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      highlight: true,
    },
    {
      icon: Layers,
      title: 'Line-by-Line Code Breakdown',
      description:
        'Deconstruct complex code line-by-line with exact scope impact, variable mutations, and statement explanations.',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      icon: Activity,
      title: 'Interactive Dry Run Simulator',
      description:
        'Step through code execution statement by statement. Watch variable values mutate live in sync with the editor.',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      icon: HelpCircle,
      title: 'AI Self-Test Quiz Generator',
      description:
        'Test your comprehension with 5-question multiple-choice quizzes, instant scoring, explanations, and celebrations.',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      icon: MessagesSquare,
      title: 'Technical Interview Prep & Answer Keys',
      description:
        'Prepare for technical interviews with realistic questions, candidate hints, key talking points, and model answer keys.',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      icon: BookOpen,
      title: 'Algorithmic Revision Exam Notes',
      description:
        'Auto-generate structured revision study notes with algorithm steps, pros/cons, time complexity, and real-world usage.',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
  ];

  const faqs = [
    {
      q: 'What is the Python Tutor Memory Visualizer feature?',
      a: 'The Python Tutor engine is the signature highlight of CodeXray AI. It breaks down code execution step-by-step with visual stack frames, global pointer tables, and array memory boxes so you can see exactly how variables and memory change over time.',
    },
    {
      q: 'Do I need a Google Account to use CodeXray AI?',
      a: 'You can explore all features right away! Signing in with your Google account lets you sync your code analysis history, saved Python Tutor traces, and custom revision notes across devices.',
    },
    {
      q: 'Which programming languages are supported?',
      a: 'CodeXray AI supports Java, Python, C, C++, JavaScript, TypeScript, SQL, Go, and Rust with syntax highlighting and language-tailored AI execution prompts.',
    },
  ];

  return (
    <div className={`space-y-20 pb-20 overflow-hidden transition-colors duration-200 ${
      isLight ? 'bg-slate-100 text-slate-800' : 'bg-[#0a0a0b] text-slate-100'
    }`}>
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute inset-0 top-10 flex justify-center pointer-events-none">
          <div className="w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-3xl opacity-70" />
        </div>

        <div className="text-center space-y-6 relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border text-xs shadow-md ${
            isLight
              ? 'bg-white border-slate-300 text-indigo-700'
              : 'bg-[#0e0e10] border-white/10 text-indigo-300'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>AI Code Understanding Studio</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          </div>

          {/* Headline */}
          <h1 className={`text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            Understand Code.{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 dark:from-indigo-300 dark:via-indigo-400 dark:to-indigo-200 bg-clip-text text-transparent font-serif italic">
              Don't Just Copy It.
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-base sm:text-lg leading-relaxed max-w-2xl mx-auto ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}>
            Deeply Xray any algorithm with our featured <strong className={isLight ? 'text-slate-900' : 'text-white'}>Python Tutor Memory Engine</strong>, stack frame diagrams, dry run traces, and interview prep.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onLaunchDashboard}
              className="flex items-center space-x-2.5 px-8 py-3.5 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-500/30 border border-indigo-400/40 backdrop-blur-md hover:scale-105 transition-all duration-200"
            >
              <span>Launch Code Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectSample('binary-search-java')}
              className={`flex items-center space-x-2 px-7 py-3.5 rounded-full border backdrop-blur-md font-medium text-sm shadow-sm transition-all ${
                isLight
                  ? 'bg-white/80 border-slate-300 text-slate-800 hover:bg-white'
                  : 'bg-white/5 border-white/15 text-slate-200 hover:bg-white/10'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" />
              <span>Try Binary Search Demo</span>
            </button>

            {!user && onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className={`flex items-center space-x-2 px-6 py-3.5 rounded-full font-semibold text-sm border backdrop-blur-md shadow-sm transition-all ${
                  isLight
                    ? 'bg-white/90 border-slate-300 text-slate-800 hover:bg-white'
                    : 'bg-white/10 border-white/15 text-slate-200 hover:bg-white/15'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.39 7.36 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.61 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Google Sign-In</span>
              </button>
            )}
          </div>
        </div>

        {/* FEATURED HIGHLIGHT SPOTLIGHT: Python Tutor Memory Visualizer */}
        <div className={`mt-12 max-w-5xl mx-auto rounded-2xl border p-6 sm:p-8 relative shadow-2xl overflow-hidden ${
          isLight
            ? 'bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border-indigo-200'
            : 'bg-gradient-to-br from-[#12121b] via-[#0e0e12] to-[#0a1218] border-indigo-500/30'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-left max-w-xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
                <MonitorPlay className="w-3.5 h-3.5" />
                <span>Featured Engine: Python Tutor Step Visualizer</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Visualize Code Execution with Memory Diagrams & Stack Frames
              </h2>
              <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                Python Tutor is the core highlight of CodeXray AI. It renders live memory diagrams, function stack frames, and array pointers at every single line execution step.
              </p>
              <div className="flex flex-wrap gap-2 text-xs pt-1">
                <span className={`px-2.5 py-1 rounded font-mono border ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-black/40 border-white/10 text-slate-300'
                }`}>
                  ⚡ Step Stack Frames
                </span>
                <span className={`px-2.5 py-1 rounded font-mono border ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-black/40 border-white/10 text-slate-300'
                }`}>
                  📊 Array Memory Diagrams
                </span>
                <span className={`px-2.5 py-1 rounded font-mono border ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-black/40 border-white/10 text-slate-300'
                }`}>
                  🔍 Pointer Heap Inspection
                </span>
              </div>
            </div>

            {/* Visualizer Interactive Badge */}
            <div className={`p-5 rounded-xl border text-center space-y-3 shrink-0 ${
              isLight ? 'bg-white border-slate-200 shadow-md' : 'bg-[#15151c] border-white/10'
            }`}>
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
                <Network className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="text-sm font-bold">Python Tutor Trace</div>
                <div className="text-[11px] text-slate-400">Step 1 of 12 Execution</div>
              </div>
              <button
                onClick={onLaunchDashboard}
                className="w-full py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                <MonitorPlay className="w-3.5 h-3.5" />
                <span>Open Visualizer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Code Xray Simulation Mockup */}
        <div className={`mt-12 max-w-5xl mx-auto rounded-xl border shadow-2xl overflow-hidden relative ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0d0d0f] border-white/10'
        }`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0e0e10] border-white/5'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className={`ml-3 text-xs font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                BinarySearch.java — Python Tutor & CodeXray Live Analysis
              </span>
            </div>
            <div className={`flex items-center space-x-2 text-xs font-mono px-2.5 py-1 rounded border ${
              isLight
                ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                : 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20'
            }`}>
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>O(log N) Time</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 text-xs font-mono">
            {/* Left code pane */}
            <div className={`p-4 border-r space-y-1 ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-800'
                : 'bg-[#0a0a0b] border-white/5 text-slate-300'
            }`}>
              <div className="text-slate-400">// Step 3 Active Execution</div>
              <div className={`p-1 rounded border-l-2 ${
                isLight
                  ? 'bg-indigo-50 text-indigo-900 border-indigo-600 font-semibold'
                  : 'bg-indigo-500/20 text-indigo-200 border-indigo-400'
              }`}>
                <span className="text-slate-400 mr-2">08:</span>
                int mid = left + (right - left) / 2;
              </div>
              <div className="p-1">
                <span className="text-slate-400 mr-2">09:</span>
                if (arr[mid] == target) return mid;
              </div>
              <div className="p-1">
                <span className="text-slate-400 mr-2">10:</span>
                if (arr[mid] &lt; target) left = mid + 1;
              </div>
            </div>

            {/* Right Xray result */}
            <div className={`p-4 space-y-3 font-sans ${
              isLight ? 'bg-white' : 'bg-[#0e0e10]/80'
            }`}>
              <div className={`flex items-center justify-between border-b pb-2 ${
                isLight ? 'border-slate-200' : 'border-white/5'
              }`}>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-xs uppercase tracking-wider flex items-center space-x-1">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Xray Variables Watch</span>
                </span>
                <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>mid = 4, target = 23</span>
              </div>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                <strong className={isLight ? 'text-slate-900' : 'text-white'}>Explanation: </strong>
                Calculates mid point index 4 (value 16). Since 16 &lt; 23, shifts search boundary rightward by setting <code className="text-indigo-600 dark:text-indigo-300 font-mono font-bold">left = 5</code>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className={`text-3xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            AI Superpowers & Python Tutor Memory Engine
          </h2>
          <p className={`text-sm max-w-2xl mx-auto ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Everything you need to analyze algorithms, inspect stack memory, prepare for interviews, and ace technical exams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-xl border transition-all duration-300 space-y-4 shadow-sm hover:shadow-md relative overflow-hidden ${
                  f.highlight
                    ? isLight
                      ? 'bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-300/50'
                      : 'bg-[#12121a] border-indigo-500/40 ring-1 ring-indigo-500/20'
                    : isLight
                      ? 'bg-white border-slate-200 hover:border-slate-300'
                      : 'bg-[#0e0e10] border-white/5 hover:border-white/10'
                }`}
              >
                {f.highlight && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 text-[9px] font-bold rounded uppercase bg-indigo-600 text-white shadow-sm">
                    HIGHLIGHT
                  </span>
                )}
                <div className={`w-10 h-10 rounded flex items-center justify-center border ${f.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className={`text-base font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{f.title}</h3>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQs Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Frequently Asked Questions</h2>
          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Got questions? We've got answers.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border overflow-hidden ${
                  isLight
                    ? 'bg-white border-slate-200'
                    : 'bg-[#0e0e10] border-white/5'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className={`w-full p-4 text-left font-semibold text-sm flex items-center justify-between transition-colors ${
                    isLight
                      ? 'text-slate-800 hover:bg-slate-50'
                      : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className={`p-4 border-t text-xs leading-relaxed ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-600'
                      : 'bg-[#0a0a0b] border-white/5 text-slate-400'
                  }`}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`p-10 rounded-2xl border shadow-xl text-center space-y-6 relative overflow-hidden ${
          isLight
            ? 'bg-white border-indigo-200 text-slate-900'
            : 'bg-[#0e0e10] border-indigo-500/20 text-white'
        }`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className={`text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Ready to Xray Your First Code Snippet?
          </h2>
          <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}>
            Jump into our interactive studio now. Paste any code, choose a sample, and experience instant Python Tutor step visualizer and AI code dissection.
          </p>
          <button
            onClick={onLaunchDashboard}
            className="inline-flex items-center space-x-2.5 px-8 py-3.5 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-500/30 border border-indigo-400/40 backdrop-blur-md hover:scale-105 transition-all"
          >
            <span>Launch Code Studio Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
