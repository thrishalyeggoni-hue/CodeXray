import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Editor from '@monaco-editor/react';
import {
  ProgrammingLanguage,
  AnalysisResponse,
  DryRunResponse,
  QuizResponse,
  InterviewResponse,
  NotesResponse,
  GoogleUser,
} from '../types';

import { SAMPLE_CODES } from '../data/sampleCodes';
import { LineByLineTable } from './LineByLineTable';
import { DryRunPlayer } from './DryRunPlayer';
import { ComplexityChart } from './ComplexityChart';
import { QuizView } from './QuizView';
import { InterviewView } from './InterviewView';
import { NotesView } from './NotesView';
import { PythonTutorViewer } from './PythonTutorViewer';
import { ChatGPTExplainerView } from './ChatGPTExplainerView';
import { CodeHistoryView } from './CodeHistoryView';
import { fetchApiWithLogging } from '../services/apiService';
import { sanitizeLaTeX, sanitizeObjectStrings } from '../utils/sanitize';
import {
  Sparkles,
  Play,
  RotateCcw,
  Copy,
  Upload,
  Download,
  Check,
  Layers,
  Activity,
  GitFork,
  TrendingUp,
  HelpCircle,
  MessagesSquare,
  BookOpen,
  Code2,
  FileCode,
  Zap,
  Loader2,
  AlertCircle,
  Clock,
  HardDrive,
  Lightbulb,
  MonitorPlay,
  FileText,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface DashboardProps {
  initialSampleId?: string;
  theme?: 'dark' | 'light';
  user?: GoogleUser | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ initialSampleId, theme = 'dark', user }) => {

  const isLight = theme === 'light';
  const [language, setLanguage] = useState<ProgrammingLanguage>('java');
  const [code, setCode] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  // Analysis States
  const [activeTab, setActiveTab] = useState<
    'chatgpt' | 'pythontutor' | 'xray' | 'dryrun' | 'complexity' | 'quiz' | 'interview' | 'notes' | 'history'
  >('chatgpt');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Data States
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [dryRunData, setDryRunData] = useState<DryRunResponse | null>(null);
  const [quizData, setQuizData] = useState<QuizResponse | null>(null);
  const [interviewData, setInterviewData] = useState<InterviewResponse | null>(null);
  const [notesData, setNotesData] = useState<NotesResponse | null>(null);
  const [chatgptExplanation, setChatGPTExplanation] = useState<string | null>(null);

  // Active line highlight in Monaco editor during dry run
  const [highlightLineNumber, setHighlightLineNumber] = useState<number | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isDryRunGenerating, setIsDryRunGenerating] = useState(false);

  // Monaco Editor References for Active Line Highlighting
  const editorRef = React.useRef<any>(null);
  const monacoRef = React.useRef<any>(null);
  const decorationsRef = React.useRef<string[]>([]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  // Synchronize active dry run line highlight with Monaco editor
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      if (highlightLineNumber && highlightLineNumber > 0) {
        try {
          editorRef.current.revealLineInCenter(highlightLineNumber);
          decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, [
            {
              range: new monacoRef.current.Range(highlightLineNumber, 1, highlightLineNumber, 1),
              options: {
                isWholeLine: true,
                className: 'active-dryrun-line-highlight',
                glyphMarginClassName: 'active-dryrun-line-glyph',
              },
            },
          ]);
        } catch (err) {
          console.warn('Monaco line highlight error:', err);
        }
      } else {
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
      }
    }
  }, [highlightLineNumber]);

  // Single Dry Run Trigger
  const handleSingleDryRun = async () => {
    if (!code || !code.trim()) {
      setAnalysisError('Please enter or select a code snippet first.');
      return;
    }
    setIsDryRunGenerating(true);
    try {
      const dryRunRes = await fetchApiWithLogging<DryRunResponse>('/api/dryrun', { code, language });
      if (dryRunRes) {
        setDryRunData(dryRunRes);
      }
    } catch (err) {
      console.error('Dry run failed:', err);
    } finally {
      setIsDryRunGenerating(false);
    }
  };

  // Auto-trigger dry run if switching to dryrun tab with empty dryRunData
  useEffect(() => {
    if (activeTab === 'dryrun' && !dryRunData && code && code.trim() && !isDryRunGenerating) {
      handleSingleDryRun();
    }
  }, [activeTab, dryRunData, code]);

  // Exit focus mode with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-load preset if passed
  useEffect(() => {
    if (initialSampleId) {
      if (initialSampleId === 'empty') {
        setCode('');
        setSelectedPreset('');
      } else {
        const found = SAMPLE_CODES.find((s) => s.id === initialSampleId);
        if (found) {
          setLanguage(found.language);
          setCode(found.code);
          setSelectedPreset(found.id);
        }
      }
    }
  }, [initialSampleId]);

  // Handle preset selector change
  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetId = e.target.value;
    setSelectedPreset(presetId);
    if (!presetId) return;
    const found = SAMPLE_CODES.find((s) => s.id === presetId);
    if (found) {
      setLanguage(found.language);
      setCode(found.code);
    }
  };

  // Run full analysis across all Gemini endpoints
  const handleAnalyze = async () => {
    if (!code || !code.trim()) {
      setAnalysisError('Please enter or select a code snippet first.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const [
        analyzeRes,
        dryRunRes,
        quizRes,
        interviewRes,
        notesRes,
        chatRes,
      ] = await Promise.all([
        fetchApiWithLogging<AnalysisResponse>('/api/analyze', { code, language }),
        fetchApiWithLogging<DryRunResponse>('/api/dryrun', { code, language }),
        fetchApiWithLogging<QuizResponse>('/api/quiz', { code, language }),
        fetchApiWithLogging<InterviewResponse>('/api/interview', { code, language }),
        fetchApiWithLogging<NotesResponse>('/api/notes', { code, language }),
        fetchApiWithLogging<{ answer?: string }>('/api/chat', {
          prompt: `Please give a complete, clear, step-by-step explanation of the following ${language.toUpperCase()} code for exam study notes. Break down the logic line by line, explain key variables, and note critical algorithmic concepts. CRITICAL FORMATTING INSTRUCTION: Do NOT use LaTeX math symbols, TeX commands, or dollar signs (e.g. do NOT write $9 - 2 = 7$, $i=0$, $O(N)$, \\le). Write all math as clean plain text.`,
          code,
          language,
          history: [],
        }),
      ]);

      if (analyzeRes) setAnalysisData(sanitizeObjectStrings(analyzeRes));
      if (dryRunRes) setDryRunData(sanitizeObjectStrings(dryRunRes));
      if (quizRes) setQuizData(sanitizeObjectStrings(quizRes));
      if (interviewRes) setInterviewData(sanitizeObjectStrings(interviewRes));
      if (notesRes) setNotesData(sanitizeObjectStrings(notesRes));
      if (chatRes?.answer) setChatGPTExplanation(sanitizeLaTeX(chatRes.answer));

      // Save item to Code Studio history
      try {
        const historyItem = {
          id: 'hist-' + Date.now(),
          timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          code,
          language,
          title: (analyzeRes as any)?.title || `${language.toUpperCase()} Analysis`,
          summary: analyzeRes?.summary || 'Analyzed code snippet in CodeXray',
        };
        const existingStr = localStorage.getItem('codexray_code_history');
        const existing = existingStr ? JSON.parse(existingStr) : [];
        const updated = [historyItem, ...existing.filter((item: any) => item.code !== code)].slice(0, 30);
        localStorage.setItem('codexray_code_history', JSON.stringify(updated));
      } catch {}
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setAnalysisError('Failed to analyze code. Please check your network or try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setCode(content);
        setSelectedPreset('');
      }
    };
    reader.readAsText(file);
  };

  // File Download
  const handleFileDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-snippet.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Copy code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-4rem)] max-w-[1700px] mx-auto px-2 sm:px-4 py-2 gap-3 overflow-hidden ${
      isLight ? 'bg-slate-100 text-slate-800' : 'bg-[#0a0a0b] text-slate-100'
    }`}>
      {/* Top Action Toolbar */}
      <div className={`p-3 rounded-2xl border backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        isLight
          ? 'bg-white/70 border-slate-200/80 text-slate-800 shadow-slate-200/50'
          : 'bg-[#0e0e10]/80 border-white/10 text-slate-100 shadow-xl'
      }`}>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Language selector widget */}
          <div className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border backdrop-blur-md text-xs shadow-sm transition-all ${
            isLight ? 'bg-white/80 border-slate-300/80 text-slate-800' : 'bg-white/5 border-white/10 text-slate-200'
          }`}>
            <Code2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className={`font-medium hidden sm:inline ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Lang:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as ProgrammingLanguage)}
              className={`bg-transparent font-semibold font-mono outline-none cursor-pointer uppercase text-xs ${
                isLight ? 'text-slate-900' : 'text-slate-200'
              }`}
            >
              <option value="java" className={isLight ? "bg-white text-slate-900" : "bg-[#0e0e10] text-slate-200"}>Java</option>
              <option value="python" className={isLight ? "bg-white text-slate-900" : "bg-[#0e0e10] text-slate-200"}>Python</option>
              <option value="cpp" className={isLight ? "bg-white text-slate-900" : "bg-[#0e0e10] text-slate-200"}>C++</option>
              <option value="c" className={isLight ? "bg-white text-slate-900" : "bg-[#0e0e10] text-slate-200"}>C</option>
              <option value="javascript" className={isLight ? "bg-white text-slate-900" : "bg-[#0e0e10] text-slate-200"}>JavaScript</option>
              <option value="typescript" className={isLight ? "bg-white text-slate-900" : "bg-[#0e0e10] text-slate-200"}>TypeScript</option>
              <option value="sql" className={isLight ? "bg-white text-slate-900" : "bg-[#0e0e10] text-slate-200"}>SQL</option>
              <option value="go" className={isLight ? "bg-white text-slate-900" : "bg-[#0e0e10] text-slate-200"}>Go</option>
              <option value="rust" className={isLight ? "bg-white text-slate-900" : "bg-[#0e0e10] text-slate-200"}>Rust</option>
            </select>
          </div>

          {/* Preset code dropdown widget */}
          <div className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border backdrop-blur-md text-xs shadow-sm transition-all ${
            isLight ? 'bg-white/80 border-slate-300/80 text-slate-800' : 'bg-white/5 border-white/10 text-slate-200'
          }`}>
            <FileCode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className={`font-medium hidden sm:inline ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Preset:</span>
            <select
              value={selectedPreset}
              onChange={handlePresetChange}
              className={`bg-transparent font-semibold outline-none cursor-pointer max-w-[140px] sm:max-w-[180px] truncate text-xs ${
                isLight ? 'text-slate-900' : 'text-slate-200'
              }`}
            >
              <option value="" className={isLight ? "bg-white text-slate-900" : "bg-[#0e0e10] text-slate-200"}>-- Custom Code --</option>
              {SAMPLE_CODES.map((s) => (
                <option key={s.id} value={s.id} className={isLight ? "bg-white text-slate-900" : "bg-[#0e0e10] text-slate-200"}>
                  {s.title} ({s.language})
                </option>
              ))}
            </select>
          </div>

          {/* Upload / Download / Copy widget pills */}
          <div className="flex items-center space-x-1.5">
            <label
              className={`p-2 rounded-full border backdrop-blur-md cursor-pointer transition-all shadow-sm ${
                isLight
                  ? 'bg-white/80 border-slate-300/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
              }`}
              title="Upload file"
            >
              <Upload className="w-3.5 h-3.5" />
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".java,.py,.cpp,.c,.js,.ts,.sql,.go,.rs,.txt"
                className="hidden"
              />
            </label>
            <button
              onClick={handleFileDownload}
              className={`p-2 rounded-full border backdrop-blur-md transition-all shadow-sm ${
                isLight
                  ? 'bg-white/80 border-slate-300/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
              }`}
              title="Download code file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCopyCode}
              className={`p-2 rounded-full border backdrop-blur-md transition-all shadow-sm ${
                isLight
                  ? 'bg-white/80 border-slate-300/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
              }`}
              title="Copy code to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                setCode('');
                setSelectedPreset('');
              }}
              className={`p-2 rounded-full border backdrop-blur-md transition-all shadow-sm ${
                isLight
                  ? 'bg-white/80 border-slate-300/80 text-slate-700 hover:text-rose-600 hover:bg-rose-50'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-rose-400 hover:bg-white/10'
              }`}
              title="Clear code editor"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFocusMode(true)}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all shadow-sm cursor-pointer ${
              isLight
                ? 'bg-white/80 border-slate-300/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Expand into Distraction-Free Side-by-Side Focus Mode"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span className="hidden sm:inline">Focus Mode</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('pythontutor')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all shadow-sm cursor-pointer ${
              isLight
                ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-300 hover:bg-blue-500/20'
            }`}
            title="Open Python Tutor Step-by-Step Memory Visualizer"
          >
            <MonitorPlay className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span>Python Tutor Trace</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium text-xs sm:text-sm shadow-md border border-indigo-500/30 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-indigo-200" />
                <span>Analyzing Xray Data...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Analyze with Gemini</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Main Split Content Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0 overflow-hidden">
        {/* Left: Monaco Editor Panel */}
        <div className={`lg:col-span-5 rounded-xl border flex flex-col overflow-hidden shadow-xl ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0d0d0f] border-white/5'
        }`}>
          <div className={`px-4 py-2 border-b flex items-center justify-between text-xs font-mono ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0e0e10] border-white/5 text-slate-400'
          }`}>
            <div className="flex items-center space-x-2">
              <Code2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>Source Editor</span>
            </div>
            <span>{code.split('\n').length} lines</span>
          </div>

          <div className="flex-1 min-h-[300px] lg:min-h-0 relative">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={(val) => setCode(val || '')}
              onMount={handleEditorDidMount}
              theme={isLight ? "vs-light" : "vs-dark"}
              options={{
                fontSize: 13,
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                roundedSelection: true,
                padding: { top: 12, bottom: 12 },
                tabSize: 2,
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Right: Multi-Tab Intelligence Hub */}
        <div className={`lg:col-span-7 rounded-2xl border flex flex-col overflow-hidden shadow-xl ${
          isLight ? 'bg-white/80 border-slate-200/80 backdrop-blur-md' : 'bg-[#0e0e10]/80 border-white/10 backdrop-blur-md'
        }`}>
          {/* Tab Navigation Header - Curved Glass Widget Pill Bar */}
          <div className={`p-2 border-b text-xs font-semibold overflow-x-auto no-scrollbar shrink-0 flex items-center gap-1.5 ${
            isLight ? 'bg-slate-100/80 border-slate-200' : 'bg-[#0a0a0d]/80 border-white/10'
          }`}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('chatgpt')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full border transition-all whitespace-nowrap font-medium text-xs backdrop-blur-md cursor-pointer ${
                activeTab === 'chatgpt'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-emerald-400 shadow-sm'
                  : isLight
                    ? 'bg-white/70 text-slate-700 border-slate-300/60 hover:bg-white hover:border-slate-300'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              <span>ChatGPT Code Explainer</span>
              <span className="ml-1 px-1.5 py-0.5 text-[9px] font-semibold rounded-full uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                AI STEP-BY-STEP
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('pythontutor')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full border transition-all whitespace-nowrap font-medium text-xs backdrop-blur-md cursor-pointer ${
                activeTab === 'pythontutor'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : isLight
                    ? 'bg-white/70 text-slate-700 border-slate-300/60 hover:bg-white hover:border-slate-300'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <MonitorPlay className="w-3.5 h-3.5 text-blue-400" />
              <span>Python Tutor Trace</span>
              <span className="ml-1 px-1.5 py-0.5 text-[9px] font-semibold rounded-full uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
                HOT
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('xray')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full border transition-all whitespace-nowrap font-medium text-xs backdrop-blur-md cursor-pointer ${
                activeTab === 'xray'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : isLight
                    ? 'bg-white/70 text-slate-700 border-slate-300/60 hover:bg-white hover:border-slate-300'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Summary</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('dryrun')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full border transition-all whitespace-nowrap font-medium text-xs backdrop-blur-md cursor-pointer ${
                activeTab === 'dryrun'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : isLight
                    ? 'bg-white/70 text-slate-700 border-slate-300/60 hover:bg-white hover:border-slate-300'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dry Run AI</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('complexity')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full border transition-all whitespace-nowrap font-medium text-xs backdrop-blur-md cursor-pointer ${
                activeTab === 'complexity'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : isLight
                    ? 'bg-white/70 text-slate-700 border-slate-300/60 hover:bg-white hover:border-slate-300'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Complexity</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full border transition-all whitespace-nowrap font-medium text-xs backdrop-blur-md cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : isLight
                    ? 'bg-white/70 text-slate-700 border-slate-300/60 hover:bg-white hover:border-slate-300'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
              <span>Self Quiz</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('interview')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full border transition-all whitespace-nowrap font-medium text-xs backdrop-blur-md cursor-pointer ${
                activeTab === 'interview'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : isLight
                    ? 'bg-white/70 text-slate-700 border-slate-300/60 hover:bg-white hover:border-slate-300'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <MessagesSquare className="w-3.5 h-3.5 text-pink-400" />
              <span>Interview Prep</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('notes')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full border transition-all whitespace-nowrap font-medium text-xs backdrop-blur-md cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : isLight
                    ? 'bg-white/70 text-slate-700 border-slate-300/60 hover:bg-white hover:border-slate-300'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exam Notes</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full border transition-all whitespace-nowrap font-medium text-xs backdrop-blur-md cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : isLight
                    ? 'bg-white/70 text-slate-700 border-slate-300/60 hover:bg-white hover:border-slate-300'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Code History</span>
            </motion.button>
          </div>


          {/* Tab Body View */}
          <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-6">
            {analysisError && (
              <div className="p-4 rounded-lg bg-rose-950/80 border border-rose-800/60 text-rose-200 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}

            {/* TAB 0: CHATGPT CODE EXPLAINER */}
            {activeTab === 'chatgpt' && (
              <ChatGPTExplainerView
                code={code}
                language={language}
                theme={theme}
              />
            )}

            {/* TAB 1: XRAY ANALYSIS */}
            {activeTab === 'xray' && (
              <div className="space-y-6">
                {/* Overview Banner */}
                {analysisData && (
                  <div className={`p-5 rounded-xl border space-y-3 ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-white/5 border-white/5 text-slate-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <h2 className={`text-xl ${
                        isLight ? 'font-bold text-slate-900' : 'font-serif italic text-white'
                      }`}>
                        Analysis Complete
                      </h2>
                      <div className="flex space-x-2 text-xs font-mono">
                        <span className={`px-2.5 py-1 rounded font-bold border ${
                          isLight
                            ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                            : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                        }`}>
                          {analysisData.timeComplexity} Time
                        </span>
                        <span className={`px-2.5 py-1 rounded font-bold border ${
                          isLight
                            ? 'bg-purple-50 text-purple-900 border-purple-200'
                            : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                        }`}>
                          {analysisData.spaceComplexity} Space
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-800 font-medium' : 'text-slate-300'}`}>
                      {analysisData.summary}
                    </p>
                    <p className={`text-xs leading-relaxed pt-2 border-t ${
                      isLight ? 'border-slate-200 text-slate-600' : 'border-white/5 text-slate-400'
                    }`}>
                      <strong className={isLight ? 'text-indigo-700 font-semibold' : 'text-indigo-300 font-medium'}>
                        Core Purpose:{' '}
                      </strong>
                      {analysisData.corePurpose}
                    </p>
                  </div>
                )}

                {/* ELI5 Beginner Analogy */}
                {analysisData?.beginnerAnalogy && (
                  <div className={`p-4 rounded-xl border text-xs space-y-1 ${
                    isLight
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-950'
                      : 'bg-indigo-950/20 border-indigo-500/20 text-slate-300'
                  }`}>
                    <div className="flex items-center space-x-1.5 text-indigo-700 dark:text-indigo-300 font-semibold">
                      <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Beginner-Friendly Analogy (ELI5)</span>
                    </div>
                    <p className="leading-relaxed italic">
                      {analysisData.beginnerAnalogy}
                    </p>
                  </div>
                )}

                {/* Line-by-Line Table */}
                <LineByLineTable
                  lines={analysisData?.lineByLine || []}
                  highlightLine={highlightLineNumber}
                  theme={theme}
                />

                {/* CS Key Concepts & Pitfalls */}
                {analysisData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className={`p-4 rounded-xl border space-y-2 ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                        : 'bg-white/5 border-white/5 text-slate-300'
                    }`}>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[11px]">
                        Key CS Concepts Used
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisData.keyConcepts.map((concept, idx) => (
                          <span
                            key={idx}
                            className={`px-2.5 py-1 rounded font-mono border ${
                              isLight
                                ? 'bg-white border-slate-200 text-slate-800 font-medium'
                                : 'bg-black/40 border-white/5 text-slate-300'
                            }`}
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl border space-y-2 ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                        : 'bg-white/5 border-white/5 text-slate-300'
                    }`}>
                      <span className="font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider text-[11px]">
                        Common Pitfalls to Avoid
                      </span>
                      <ul className="list-disc list-inside space-y-1">
                        {analysisData.commonMistakes.map((mistake, idx) => (
                          <li key={idx}>{mistake}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: DRY RUN TRACER */}
            {activeTab === 'dryrun' && (
              <DryRunPlayer
                dryRunData={dryRunData}
                onStepChange={(line) => setHighlightLineNumber(line)}
                onRunDryRun={handleSingleDryRun}
                isGenerating={isDryRunGenerating}
                theme={theme}
              />
            )}

            {/* TAB 4: COMPLEXITY */}
            {activeTab === 'complexity' && (
              <ComplexityChart
                timeComplexity={analysisData?.timeComplexity || 'O(N)'}
                spaceComplexity={analysisData?.spaceComplexity || 'O(1)'}
                reasoning={analysisData?.complexityReasoning || ''}
                optimizations={analysisData?.optimizations || []}
                theme={theme}
              />
            )}

            {/* TAB: PYTHON TUTOR VISUALIZER */}
            {activeTab === 'pythontutor' && (
              <PythonTutorViewer code={code} language={language} theme={theme} />
            )}

            {/* TAB 5: QUIZ */}
            {activeTab === 'quiz' && <QuizView quizData={quizData} theme={theme} />}

            {/* TAB 6: INTERVIEW */}
            {activeTab === 'interview' && (
              <InterviewView interviewData={interviewData} theme={theme} />
            )}

            {/* TAB 7: NOTES */}
            {activeTab === 'notes' && (
              <NotesView
                notesData={notesData}
                dryRunData={dryRunData}
                analysisData={analysisData}
                chatgptExplanation={chatgptExplanation}
                code={code}
                language={language}
                theme={theme}
                onBackToStudio={() => setActiveTab('xray')}
              />
            )}

            {/* TAB 8: CODE STUDIO HISTORY */}
            {activeTab === 'history' && (
              <CodeHistoryView
                onLoadCode={(loadedCode, loadedLang) => {
                  if (loadedLang) setLanguage(loadedLang as ProgrammingLanguage);
                  setCode(loadedCode);
                  setActiveTab('xray');
                }}
                onExplainWithChatGPT={(loadedCode, loadedLang) => {
                  if (loadedLang) setLanguage(loadedLang as ProgrammingLanguage);
                  setCode(loadedCode);
                  setActiveTab('chatgpt');
                }}
                theme={theme}
              />
            )}
          </div>
        </div>
      </div>

      {/* Professional Watermark Footer Bar */}
      <div className={`py-1.5 px-4 rounded-lg border flex items-center justify-between text-[11px] font-mono shrink-0 select-none ${
        isLight
          ? 'bg-slate-200/70 border-slate-300 text-slate-600'
          : 'bg-[#0e0e10] border-white/5 text-slate-500'
      }`}>
        <div className="flex items-center space-x-2">
          <Code2 className="w-3.5 h-3.5 text-indigo-500" />
          <span className="font-bold tracking-wider uppercase">CodeXray AI Studio</span>
          <span>•</span>
          <span className="font-medium">Enterprise Code Intelligence</span>
        </div>
        <div className="hidden sm:flex items-center space-x-3">
          <span>Powered by Gemini 2.0 & Python Tutor Engine</span>
          <span>•</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide">CONFIDENTIAL & SECURE</span>
        </div>
      </div>

      {/* FULL-SCREEN FOCUS MODE OVERLAY */}
      {isFocusMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="fixed inset-0 z-50 p-4 sm:p-6 bg-[#08080c] text-slate-100 flex flex-col backdrop-blur-3xl overflow-hidden"
        >
          {/* Focus Mode Top Bar */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
                <Maximize2 className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  ⚡ CodeXray Immersive Focus Mode
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                    ESC to Exit
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Distraction-free side-by-side IDE with synchronized step-by-step memory trace
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 bg-white/5 border border-white/10 p-1 rounded-full text-xs">
                <button
                  onClick={() => setActiveTab('pythontutor')}
                  className={`px-3 py-1 rounded-full transition-all ${
                    activeTab === 'pythontutor'
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Python Tutor
                </button>
                <button
                  onClick={() => setActiveTab('dryrun')}
                  className={`px-3 py-1 rounded-full transition-all ${
                    activeTab === 'dryrun'
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dry Run AI
                </button>
                <button
                  onClick={() => setActiveTab('xray')}
                  className={`px-3 py-1 rounded-full transition-all ${
                    activeTab === 'xray'
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Summary
                </button>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold hover:scale-105 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                {isAnalyzing ? 'Analyzing...' : 'Re-Analyze'}
              </button>

              <button
                onClick={() => setIsFocusMode(false)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-all text-xs font-semibold"
                title="Exit Full-Screen Focus Mode"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Focus Mode</span>
              </button>
            </div>
          </div>

          {/* Focus Mode Side-by-Side Split Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
            {/* Left Monaco Code Editor (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#0e0e12] flex flex-col overflow-hidden shadow-2xl">
              <div className="px-4 py-2 border-b border-white/10 bg-[#121218] flex items-center justify-between text-xs font-mono text-slate-300">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-bold text-white">Monaco Code Editor</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-400">{language.toUpperCase()}</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px]">
                    {code.split('\n').length} lines
                  </span>
                </div>
              </div>
              <div className="flex-1 min-h-0 relative">
                <Editor
                  height="100%"
                  language={language === 'cpp' ? 'cpp' : language}
                  value={code}
                  onChange={(val) => setCode(val || '')}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    fontFamily: 'JetBrains Mono, Fira Code, monospace',
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    roundedSelection: true,
                    padding: { top: 12, bottom: 12 },
                    tabSize: 2,
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>

            {/* Right Visualizer & Step Player Panel (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0e0e12] flex flex-col overflow-hidden shadow-2xl p-4 overflow-y-auto">
              {activeTab === 'pythontutor' && (
                <PythonTutorViewer code={code} language={language} theme={theme} />
              )}
              {activeTab === 'dryrun' && (
                <DryRunPlayer
                  dryRunData={dryRunData}
                  onStepChange={(line) => setHighlightLineNumber(line)}
                  theme={theme}
                />
              )}
              {activeTab === 'xray' && analysisData && (
                <div className="space-y-4 text-xs font-mono">
                  <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/20 space-y-2">
                    <h4 className="font-bold text-indigo-400 text-sm">Code Summary</h4>
                    <p className="text-slate-300 leading-relaxed">{analysisData.summary}</p>
                  </div>
                  <LineByLineTable explanations={analysisData.lineByLine} theme={theme} />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
