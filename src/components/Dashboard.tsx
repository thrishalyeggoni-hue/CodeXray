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
} from '../types';
import { SAMPLE_CODES } from '../data/sampleCodes';
import { LineByLineTable } from './LineByLineTable';
import { DryRunPlayer } from './DryRunPlayer';
import { FlowchartViewer } from './FlowchartViewer';
import { ComplexityChart } from './ComplexityChart';
import { QuizView } from './QuizView';
import { InterviewView } from './InterviewView';
import { NotesView } from './NotesView';
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
} from 'lucide-react';

interface DashboardProps {
  initialSampleId?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ initialSampleId }) => {
  const [language, setLanguage] = useState<ProgrammingLanguage>('java');
  const [code, setCode] = useState<string>(SAMPLE_CODES[0].code);
  const [selectedPreset, setSelectedPreset] = useState<string>(SAMPLE_CODES[0].id);

  // Analysis States
  const [activeTab, setActiveTab] = useState<
    'xray' | 'dryrun' | 'flowchart' | 'complexity' | 'quiz' | 'interview' | 'notes'
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
      const safeFetch = async (endpoint: string) => {
        try {
          const r = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language }),
          });
          if (!r.ok) return null;
          return await r.json();
        } catch {
          return null;
        }
      };

      const [
        analyzeRes,
        dryRunRes,
        flowchartRes,
        quizRes,
        interviewRes,
        notesRes,
      ] = await Promise.all([
        safeFetch('/api/analyze'),
        safeFetch('/api/dryrun'),
        safeFetch('/api/flowchart'),
        safeFetch('/api/quiz'),
        safeFetch('/api/interview'),
        safeFetch('/api/notes'),
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
      const res = await fetch('/api/flowchart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data) setFlowchartData(data);
      }
    } catch (err) {
      console.error('Failed to regenerate flowchart:', err);
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
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-[1700px] mx-auto px-2 sm:px-4 py-2 gap-3 overflow-hidden bg-[#0a0a0b]">
      {/* Top Action Toolbar */}
      <div className="p-3 rounded-xl bg-[#0e0e10] border border-white/5 shadow-xl flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Language selector */}
          <div className="flex items-center space-x-1.5 bg-black/40 px-3 py-1.5 rounded-md border border-white/5 text-xs">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 font-medium hidden sm:inline">Lang:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as ProgrammingLanguage)}
              className="bg-transparent text-slate-200 font-semibold font-mono outline-none cursor-pointer uppercase text-xs"
            >
              <option value="java" className="bg-[#0e0e10]">Java</option>
              <option value="python" className="bg-[#0e0e10]">Python</option>
              <option value="cpp" className="bg-[#0e0e10]">C++</option>
              <option value="c" className="bg-[#0e0e10]">C</option>
              <option value="javascript" className="bg-[#0e0e10]">JavaScript</option>
              <option value="typescript" className="bg-[#0e0e10]">TypeScript</option>
              <option value="sql" className="bg-[#0e0e10]">SQL</option>
              <option value="go" className="bg-[#0e0e10]">Go</option>
              <option value="rust" className="bg-[#0e0e10]">Rust</option>
            </select>
          </div>

          {/* Preset code dropdown */}
          <div className="flex items-center space-x-1.5 bg-black/40 px-3 py-1.5 rounded-md border border-white/5 text-xs">
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 font-medium hidden sm:inline">Preset:</span>
            <select
              value={selectedPreset}
              onChange={handlePresetChange}
              className="bg-transparent text-slate-200 font-semibold outline-none cursor-pointer max-w-[140px] sm:max-w-[180px] truncate text-xs"
            >
              <option value="" className="bg-[#0e0e10]">-- Custom Code --</option>
              {SAMPLE_CODES.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0e0e10]">
                  {s.title} ({s.language})
                </option>
              ))}
            </select>
          </div>

          {/* Upload / Download / Copy */}
          <div className="flex items-center space-x-1">
            <label
              className="p-1.5 rounded bg-black/40 border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5 cursor-pointer transition-colors"
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
              className="p-1.5 rounded bg-black/40 border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              title="Download code file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCopyCode}
              className="p-1.5 rounded bg-black/40 border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              title="Copy code to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                setCode('');
                setSelectedPreset('');
              }}
              className="p-1.5 rounded bg-black/40 border border-white/5 text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
              title="Clear code editor"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Primary Analyze CTA Button */}
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

      {/* Main Split Content Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0 overflow-hidden">
        {/* Left: Monaco Editor Panel */}
        <div className="lg:col-span-5 rounded-xl bg-[#0d0d0f] border border-white/5 shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-2 bg-[#0e0e10] border-b border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center space-x-2">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-slate-200">Source Editor</span>
            </div>
            <span>{code.split('\n').length} lines</span>
          </div>

          <div className="flex-1 min-h-[300px] lg:min-h-0 relative">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-dark"
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
        <div className="lg:col-span-7 rounded-xl bg-[#0e0e10] border border-white/5 shadow-2xl flex flex-col overflow-hidden">
          {/* Tab Navigation Header */}
          <div className="flex items-center overflow-x-auto border-b border-white/5 bg-[#0a0a0b] text-[11px] font-bold uppercase tracking-widest no-scrollbar shrink-0">
            <button
              onClick={() => setActiveTab('xray')}
              className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'xray'
                  ? 'text-indigo-400 border-indigo-400 bg-indigo-500/10'
                  : 'text-slate-500 hover:text-slate-300 border-transparent'
              }`}
            >
              Summary
            </button>

            <button
              onClick={() => setActiveTab('dryrun')}
              className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'dryrun'
                  ? 'text-indigo-400 border-indigo-400 bg-indigo-500/10'
                  : 'text-slate-500 hover:text-slate-300 border-transparent'
              }`}
            >
              Dry Run AI
            </button>

            <button
              onClick={() => setActiveTab('flowchart')}
              className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'flowchart'
                  ? 'text-indigo-400 border-indigo-400 bg-indigo-500/10'
                  : 'text-slate-500 hover:text-slate-300 border-transparent'
              }`}
            >
              Flowchart
            </button>

            <button
              onClick={() => setActiveTab('complexity')}
              className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'complexity'
                  ? 'text-indigo-400 border-indigo-400 bg-indigo-500/10'
                  : 'text-slate-500 hover:text-slate-300 border-transparent'
              }`}
            >
              Complexity
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'quiz'
                  ? 'text-indigo-400 border-indigo-400 bg-indigo-500/10'
                  : 'text-slate-500 hover:text-slate-300 border-transparent'
              }`}
            >
              Self Quiz
            </button>

            <button
              onClick={() => setActiveTab('interview')}
              className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'interview'
                  ? 'text-indigo-400 border-indigo-400 bg-indigo-500/10'
                  : 'text-slate-500 hover:text-slate-300 border-transparent'
              }`}
            >
              Interview Prep
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'notes'
                  ? 'text-indigo-400 border-indigo-400 bg-indigo-500/10'
                  : 'text-slate-500 hover:text-slate-300 border-transparent'
              }`}
            >
              Exam Notes
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
                  <div className="p-5 rounded-xl bg-white/5 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="font-serif italic text-xl text-white">
                        Analysis Complete
                      </h2>
                      <div className="flex space-x-2 text-xs font-mono">
                        <span className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
                          {analysisData.timeComplexity} Time
                        </span>
                        <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                          {analysisData.spaceComplexity} Space
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {analysisData.summary}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-white/5">
                      <strong className="text-indigo-300 font-medium">Core Purpose: </strong>
                      {analysisData.corePurpose}
                    </p>
                  </div>
                )}

                {/* ELI5 Beginner Analogy */}
                {analysisData?.beginnerAnalogy && (
                  <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 text-indigo-300 font-semibold">
                      <Lightbulb className="w-4 h-4 text-indigo-400" />
                      <span>Beginner-Friendly Analogy (ELI5)</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed italic">
                      {analysisData.beginnerAnalogy}
                    </p>
                  </div>
                )}

                {/* Line-by-Line Table */}
                <LineByLineTable
                  lines={analysisData?.lineByLine || []}
                  highlightLine={highlightLineNumber}
                />

                {/* CS Key Concepts & Pitfalls */}
                {analysisData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                      <span className="font-semibold text-indigo-400 uppercase tracking-wider text-[11px]">
                        Key CS Concepts Used
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisData.keyConcepts.map((concept, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded bg-black/40 border border-white/5 text-slate-300 font-mono"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                      <span className="font-semibold text-rose-400 uppercase tracking-wider text-[11px]">
                        Common Pitfalls to Avoid
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
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
              />
            )}

            {/* TAB 3: FLOWCHART */}
            {activeTab === 'flowchart' && (
              <FlowchartViewer
                flowchartData={flowchartData}
                onRegenerate={handleRegenerateFlowchart}
                isRegenerating={isRegeneratingFlowchart}
              />
            )}

            {/* TAB 4: COMPLEXITY */}
            {activeTab === 'complexity' && (
              <ComplexityChart
                timeComplexity={analysisData?.timeComplexity || 'O(N)'}
                spaceComplexity={analysisData?.spaceComplexity || 'O(1)'}
                reasoning={analysisData?.complexityReasoning || ''}
                optimizations={analysisData?.optimizations || []}
              />
            )}

            {/* TAB 5: QUIZ */}
            {activeTab === 'quiz' && <QuizView quizData={quizData} />}

            {/* TAB 6: INTERVIEW */}
            {activeTab === 'interview' && (
              <InterviewView interviewData={interviewData} />
            )}

            {/* TAB 7: NOTES */}
            {activeTab === 'notes' && <NotesView notesData={notesData} />}
          </div>
        </div>
      </div>
    </div>
  );
};
