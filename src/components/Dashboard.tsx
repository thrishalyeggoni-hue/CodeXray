import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  ProgrammingLanguage,
  AnalysisResponse,
  DryRunResponse,
  FlowchartResponse,
  QuizResponse,
  InterviewResponse,
  NotesResponse,
  GoogleUser,
} from '../types';

import { SAMPLE_CODES } from '../data/sampleCodes';
import { LineByLineTable } from './LineByLineTable';
import { DryRunPlayer } from './DryRunPlayer';
import { FlowchartViewer } from './FlowchartViewer';
import { ComplexityChart } from './ComplexityChart';
import { QuizView } from './QuizView';
import { InterviewView } from './InterviewView';
import { NotesView } from './NotesView';
import { PythonTutorViewer } from './PythonTutorViewer';
import { fetchApiWithLogging } from '../services/apiService';
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
} from 'lucide-react';

interface DashboardProps {
  initialSampleId?: string;
  theme?: 'dark' | 'light';
  user?: GoogleUser | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ initialSampleId, theme = 'dark', user }) => {

  const isLight = theme === 'light';
  const [language, setLanguage] = useState<ProgrammingLanguage>('java');
  const [code, setCode] = useState<string>(SAMPLE_CODES[0].code);
  const [selectedPreset, setSelectedPreset] = useState<string>(SAMPLE_CODES[0].id);

  // Analysis States
  const [activeTab, setActiveTab] = useState<
    'xray' | 'dryrun' | 'flowchart' | 'complexity' | 'pythontutor' | 'quiz' | 'interview' | 'notes'
  >('xray');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRegeneratingFlowchart, setIsRegeneratingFlowchart] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Data States
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [dryRunData, setDryRunData] = useState<DryRunResponse | null>(null);
  const [flowchartData, setFlowchartData] = useState<FlowchartResponse | null>(null);
  const [quizData, setQuizData] = useState<QuizResponse | null>(null);
  const [interviewData, setInterviewData] = useState<InterviewResponse | null>(null);
  const [notesData, setNotesData] = useState<NotesResponse | null>(null);

  // Active line highlight in Monaco editor during dry run
  const [highlightLineNumber, setHighlightLineNumber] = useState<number | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  // Auto-load preset if passed
  useEffect(() => {
    if (initialSampleId) {
      const found = SAMPLE_CODES.find((s) => s.id === initialSampleId);
      if (found) {
        setLanguage(found.language);
        setCode(found.code);
        setSelectedPreset(found.id);
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

  // Run full analysis across all 6 Gemini endpoints
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
        flowchartRes,
        quizRes,
        interviewRes,
        notesRes,
      ] = await Promise.all([
        fetchApiWithLogging<AnalysisResponse>('/api/analyze', { code, language }),
        fetchApiWithLogging<DryRunResponse>('/api/dryrun', { code, language }),
        fetchApiWithLogging<FlowchartResponse>('/api/flowchart', { code, language }),
        fetchApiWithLogging<QuizResponse>('/api/quiz', { code, language }),
        fetchApiWithLogging<InterviewResponse>('/api/interview', { code, language }),
        fetchApiWithLogging<NotesResponse>('/api/notes', { code, language }),
      ]);

      if (analyzeRes) setAnalysisData(analyzeRes);
      if (dryRunRes) setDryRunData(dryRunRes);
      if (flowchartRes) setFlowchartData(flowchartRes);
      if (quizRes) setQuizData(quizRes);
      if (interviewRes) setInterviewData(interviewRes);
      if (notesRes) setNotesData(notesRes);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setAnalysisError('Failed to analyze code. Please check your network or try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRegenerateFlowchart = async () => {
    setIsRegeneratingFlowchart(true);
    try {
      const data = await fetchApiWithLogging<FlowchartResponse>('/api/flowchart', { code, language });
      if (data && data.mermaidCode) {
        setFlowchartData(data);
      }
    } catch (err) {
      console.error('[Client Network Error] Failed to regenerate flowchart:', err);
    } finally {
      setIsRegeneratingFlowchart(false);
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
      <div className={`p-3 rounded-xl border shadow-xl flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
          : 'bg-[#0e0e10] border-white/5 text-slate-100 shadow-xl'
      }`}>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Language selector */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md border text-xs ${
            isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-black/40 border-white/5 text-slate-200'
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

          {/* Preset code dropdown */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md border text-xs ${
            isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-black/40 border-white/5 text-slate-200'
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

          {/* Upload / Download / Copy */}
          <div className="flex items-center space-x-1">
            <label
              className={`p-1.5 rounded border cursor-pointer transition-colors ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  : 'bg-black/40 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5'
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
              className={`p-1.5 rounded border transition-colors ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  : 'bg-black/40 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              title="Download code file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCopyCode}
              className={`p-1.5 rounded border transition-colors ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  : 'bg-black/40 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5'
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
              className={`p-1.5 rounded border transition-colors ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-700 hover:text-rose-600 hover:bg-rose-50'
                  : 'bg-black/40 border-white/5 text-slate-400 hover:text-rose-400 hover:bg-white/5'
              }`}
              title="Clear code editor"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('pythontutor')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-md bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-md transition-all border border-indigo-400/30"
            title="Open Python Tutor Step-by-Step Memory Visualizer"
          >
            <MonitorPlay className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span>🔥 Python Tutor Trace</span>
          </button>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Xray Data...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Analyze Code</span>
              </>
            )}
          </button>
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
        <div className={`lg:col-span-7 rounded-xl border flex flex-col overflow-hidden shadow-xl ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0e0e10] border-white/5'
        }`}>
          {/* Tab Navigation Header */}
          <div className={`flex items-center overflow-x-auto border-b text-xs font-semibold no-scrollbar shrink-0 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0a0a0b] border-white/10'
          }`}>
            <button
              onClick={() => setActiveTab('pythontutor')}
              className={`flex items-center space-x-1.5 px-3.5 py-3 border-b-2 transition-all whitespace-nowrap font-bold ${
                activeTab === 'pythontutor'
                  ? isLight
                    ? 'text-indigo-900 border-indigo-600 bg-indigo-100/90 shadow-sm'
                    : 'text-cyan-300 border-cyan-400 bg-cyan-500/20 shadow-sm'
                  : isLight
                    ? 'text-indigo-700 hover:bg-indigo-50 border-transparent'
                    : 'text-indigo-300 hover:bg-white/5 border-transparent'
              }`}
            >
              <MonitorPlay className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 animate-pulse" />
              <span>Python Tutor Trace</span>
              <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold rounded uppercase bg-indigo-600 text-white shadow-sm">
                HIGHLIGHT
              </span>
            </button>

            <button
              onClick={() => setActiveTab('xray')}
              className={`flex items-center space-x-1.5 px-3.5 py-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'xray'
                  ? isLight
                    ? 'text-indigo-700 border-indigo-600 bg-indigo-50 font-bold'
                    : 'text-indigo-400 border-indigo-500 bg-indigo-500/10 font-bold'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border-transparent'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Summary</span>
            </button>

            <button
              onClick={() => setActiveTab('dryrun')}
              className={`flex items-center space-x-1.5 px-3.5 py-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'dryrun'
                  ? isLight
                    ? 'text-indigo-700 border-indigo-600 bg-indigo-50 font-bold'
                    : 'text-indigo-400 border-indigo-500 bg-indigo-500/10 font-bold'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border-transparent'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-white/5'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Dry Run AI</span>
            </button>

            <button
              onClick={() => setActiveTab('flowchart')}
              className={`flex items-center space-x-1.5 px-3.5 py-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'flowchart'
                  ? isLight
                    ? 'text-indigo-700 border-indigo-600 bg-indigo-50 font-bold'
                    : 'text-indigo-400 border-indigo-500 bg-indigo-500/10 font-bold'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border-transparent'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-white/5'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Flowchart</span>
            </button>

            <button
              onClick={() => setActiveTab('complexity')}
              className={`flex items-center space-x-1.5 px-3.5 py-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'complexity'
                  ? isLight
                    ? 'text-indigo-700 border-indigo-600 bg-indigo-50 font-bold'
                    : 'text-indigo-400 border-indigo-500 bg-indigo-500/10 font-bold'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border-transparent'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Complexity</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center space-x-1.5 px-3.5 py-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'quiz'
                  ? isLight
                    ? 'text-indigo-700 border-indigo-600 bg-indigo-50 font-bold'
                    : 'text-indigo-400 border-indigo-500 bg-indigo-500/10 font-bold'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border-transparent'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-white/5'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Self Quiz</span>
            </button>

            <button
              onClick={() => setActiveTab('interview')}
              className={`flex items-center space-x-1.5 px-3.5 py-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'interview'
                  ? isLight
                    ? 'text-indigo-700 border-indigo-600 bg-indigo-50 font-bold'
                    : 'text-indigo-400 border-indigo-500 bg-indigo-500/10 font-bold'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border-transparent'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-white/5'
              }`}
            >
              <MessagesSquare className="w-3.5 h-3.5" />
              <span>Interview Prep</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center space-x-1.5 px-3.5 py-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'notes'
                  ? isLight
                    ? 'text-indigo-700 border-indigo-600 bg-indigo-50 font-bold'
                    : 'text-indigo-400 border-indigo-500 bg-indigo-500/10 font-bold'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border-transparent'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Exam Notes</span>
            </button>
          </div>


          {/* Tab Body View */}
          <div className="flex-1 p-5 overflow-y-auto space-y-6">
            {analysisError && (
              <div className="p-4 rounded-lg bg-rose-950/80 border border-rose-800/60 text-rose-200 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{analysisError}</span>
              </div>
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
                theme={theme}
              />
            )}

            {/* TAB 3: FLOWCHART */}
            {activeTab === 'flowchart' && (
              <FlowchartViewer
                flowchartData={flowchartData}
                onRegenerate={handleRegenerateFlowchart}
                isRegenerating={isRegeneratingFlowchart}
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
            {activeTab === 'notes' && <NotesView notesData={notesData} theme={theme} />}
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
    </div>
  );
};
