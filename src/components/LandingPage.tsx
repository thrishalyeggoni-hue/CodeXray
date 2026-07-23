import React, { useState } from 'react';
import {
  Code2,
  Sparkles,
  Zap,
  Layers,
  Activity,
  GitFork,
  HelpCircle,
  MessagesSquare,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Play,
  Terminal,
  ShieldCheck,
  ChevronDown,
  Cpu,
} from 'lucide-react';

interface LandingPageProps {
  onLaunchDashboard: () => void;
  onSelectSample: (sampleId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchDashboard,
  onSelectSample,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const features = [
    {
      icon: Layers,
      title: 'Line-by-Line Execution Breakdown',
      description:
        'Deconstruct complex code line-by-line with exact scope impact, variable mutations, and statement explanations.',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      icon: Activity,
      title: 'Interactive Dry Run Simulator',
      description:
        'Step through code execution statement by statement. Watch variable values mutate live in sync with the code editor.',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      icon: GitFork,
      title: 'Mermaid Control Flowcharts',
      description:
        'Automatically generate interactive Mermaid.js flowcharts with zoom, pan, direction toggles, and SVG export.',
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
      title: 'Technical Interview Prep',
      description:
        'Prepare for tech interviews with realistic questions, candidate hints, key talking points, and model answer keys.',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      icon: BookOpen,
      title: 'Exam-Ready Study Notes',
      description:
        'Generate structured study cheat sheets with algorithms, complexity bounds, pros & cons, and printable revision notes.',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
  ];

  const faqs = [
    {
      q: 'What is CodeXray AI?',
      a: 'CodeXray AI is an intelligent developer learning studio powered by Google Gemini 2.0. It visually dissects code snippets in Java, Python, C++, JS, SQL, and Go into line-by-line breakdowns, interactive dry-run simulations, flowcharts, quizzes, and interview prep.',
    },
    {
      q: 'How does the Interactive Dry Run feature work?',
      a: 'The dry run tracer simulates step-by-step code execution. You can play, pause, step forward/backward, and watch how local variables change line by line while highlighting the exact line inside the editor.',
    },
    {
      q: 'Can I export flowcharts and study notes?',
      a: 'Yes! Flowcharts can be exported as scalable vector graphics (SVG) or copied as Mermaid.js code. Study notes can be copied as Markdown or printed directly.',
    },
    {
      q: 'Which programming languages are supported?',
      a: 'CodeXray AI supports Java, Python, C, C++, JavaScript, TypeScript, SQL, Go, and Rust, with syntax highlighting and language-tailored AI prompts.',
    },
  ];

  return (
    <div className="space-y-20 pb-20 overflow-hidden bg-[#0a0a0b]">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute inset-0 top-10 flex justify-center pointer-events-none">
          <div className="w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-3xl opacity-70" />
        </div>

        <div className="text-center space-y-6 relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#0e0e10] border border-white/10 text-xs text-indigo-300 shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>AI Code Understanding Studio v2.0</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Understand Code.{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-indigo-200 bg-clip-text text-transparent font-serif italic">
              Don't Just Copy It.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Deeply Xray any algorithm or code snippet. Get line-by-line breakdowns, step-through dry run traces, Mermaid flowcharts, self-test quizzes, and technical interview answer keys.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onLaunchDashboard}
              className="flex items-center space-x-2.5 px-7 py-3.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all duration-200"
            >
              <span>Launch Code Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectSample('binary-search-java')}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-md bg-[#0e0e10] border border-white/10 text-slate-200 font-medium text-sm hover:bg-white/5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
              <span>Try Binary Search Demo</span>
            </button>
          </div>
        </div>

        {/* Hero Code Xray Simulation Mockup */}
        <div className="mt-16 max-w-5xl mx-auto rounded-xl border border-white/10 bg-[#0d0d0f] shadow-2xl overflow-hidden relative">
          <div className="px-4 py-3 bg-[#0e0e10] border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              <span className="ml-3 text-xs font-mono text-slate-400">
                BinarySearch.java — CodeXray Live Analysis
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>O(log N) Time</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 text-xs font-mono">
            {/* Left code pane */}
            <div className="p-4 bg-[#0a0a0b] border-r border-white/5 space-y-1 text-slate-300">
              <div className="text-slate-500">// Step 3 Active Execution</div>
              <div className="p-1 rounded bg-indigo-500/20 text-indigo-200 border-l-2 border-indigo-400">
                <span className="text-slate-600 mr-2">08:</span>
                int mid = left + (right - left) / 2;
              </div>
              <div className="p-1">
                <span className="text-slate-600 mr-2">09:</span>
                if (arr[mid] == target) return mid;
              </div>
              <div className="p-1">
                <span className="text-slate-600 mr-2">10:</span>
                if (arr[mid] &lt; target) left = mid + 1;
              </div>
            </div>

            {/* Right Xray result */}
            <div className="p-4 bg-[#0e0e10]/80 space-y-3 font-sans">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="font-semibold text-indigo-400 text-xs uppercase tracking-wider flex items-center space-x-1">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Xray Variables Watch</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">mid = 4, target = 23</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                <strong className="text-white">Explanation: </strong>
                Calculates mid point index 4 (value 16). Since 16 &lt; 23, shifts search boundary rightward by setting <code className="text-indigo-300 font-mono">left = 5</code>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            6 AI Superpowers to Master Any Codebase
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Everything you need to analyze algorithms, prepare for interviews, and ace technical exams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-xl bg-[#0e0e10] border border-white/5 hover:border-white/10 transition-all duration-300 space-y-4 shadow-lg"
              >
                <div className={`w-10 h-10 rounded flex items-center justify-center border ${f.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
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
          <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400">
            Got questions? We've got answers.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-[#0e0e10] border border-white/5 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-semibold text-slate-200 text-sm flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="p-4 bg-[#0a0a0b] border-t border-white/5 text-xs text-slate-400 leading-relaxed">
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
        <div className="p-10 rounded-2xl bg-[#0e0e10] border border-indigo-500/20 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl font-extrabold text-white">
            Ready to Xray Your First Code Snippet?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Jump into our interactive studio now. Paste any code, choose a sample, and experience instant AI code dissection.
          </p>
          <button
            onClick={onLaunchDashboard}
            className="inline-flex items-center space-x-2.5 px-8 py-3.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all"
          >
            <span>Launch Code Studio Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
