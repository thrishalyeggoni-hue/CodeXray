import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import {
  Bot,
  Send,
  Code2,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Zap,
  MessageSquare,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileCode,
  ArrowUpRight,
  Maximize2,
  Minimize2,
  Type,
} from 'lucide-react';
import { fetchApiWithLogging } from '../services/apiService';
import { sanitizeLaTeX } from '../utils/sanitize';

interface ChatGPTExplainerViewProps {
  code: string;
  language: string;
  theme?: 'dark' | 'light';
  onLoadCodeToStudio?: (code: string, language?: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  codeSnippet?: string;
}

export const ChatGPTExplainerView: React.FC<ChatGPTExplainerViewProps> = ({
  code,
  language,
  theme = 'dark',
  onLoadCodeToStudio,
}) => {
  const isLight = theme === 'light';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [copiedChunk, setCopiedChunk] = useState<string | null>(null);
  const [showCodePreview, setShowCodePreview] = useState(false);
  const [activeCode, setActiveCode] = useState(code);

  // Window Resize & Display Controls
  const [windowHeight, setWindowHeight] = useState<'normal' | 'tall' | 'full'>('normal');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasAutoExplainedRef = useRef<boolean>(false);

  // Sync active code prop without firing automated requests while user is typing
  useEffect(() => {
    setActiveCode(code);
  }, [code]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initial auto-explain ONCE when code is present and messages are empty
  useEffect(() => {
    if (activeCode && activeCode.trim() && messages.length === 0 && !hasAutoExplainedRef.current) {
      hasAutoExplainedRef.current = true;
      handleGenerateExplanation(activeCode);
    }
  }, []);

  const handleCopyCode = () => {
    if (!activeCode) return;
    navigator.clipboard.writeText(activeCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleCopyChunk = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChunk(text);
    setTimeout(() => setCopiedChunk(null), 2000);
  };

  const handleGenerateExplanation = async (codeToExplain?: string) => {
    const targetCode = codeToExplain || activeCode;
    if (!targetCode || !targetCode.trim()) return;

    const systemPrompt = `Please give a complete, clear, step-by-step explanation of the following ${language.toUpperCase()} code pasted into CodeXRay.

CRITICAL NO-PIPES RULE: Do NOT use markdown tables or pipe characters '|' anywhere in your response (e.g. do NOT write "| Iteration | Variable |" or "| :--- |"). Express all tables, memory states, and variable trace histories as clean bulleted lists, numbered steps, or key-value items.
CRITICAL FORMATTING INSTRUCTION: Do NOT use LaTeX math symbols, TeX commands, or dollar signs (e.g. do NOT write $O(N)$, $\\le$, $i+1$). Use clean standard plain text math (e.g. O(N), <=, O(N^2), i + 1, ->).

Break down the response logically:
1. 💡 **High-Level Concept & Purpose**: 2-3 sentences explaining what this code does in simple plain English and why it works.
2. 🔄 **Execution Control Flowchart**: Provide a clean ASCII flowchart/diagram showing the program flow step by step using standard text characters (e.g. [Start] -> [Loop] -> [End]).
3. 🔍 **Line-by-Line Execution Breakdown**: Walk through line by line explaining what each line does, why it is necessary, and how variables change.
4. 📊 **Key Variables & Memory State**: Trace variable updates step-by-step using descriptive bullet points or key-value items (NO markdown pipe tables).
5. ⚡ **Time & Space Complexity (Big-O)**: Explain mathematical time and space complexity with clear text reasoning.
6. 🐛 **Edge Cases & Practical Tips**: Point out potential boundary conditions or optimizations.`;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: `Explain this ${language.toUpperCase()} code step by step:`,
      codeSnippet: targetCode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([userMessage]);
    setIsLoading(true);

    try {
      const res = await fetchApiWithLogging<{ answer?: string; error?: string }>('/api/chat', {
        prompt: systemPrompt,
        code: targetCode,
        language,
        history: [],
      });

      const rawText = res?.answer || res?.error || 'Unable to generate step-by-step explanation.';
      const answerText = sanitizeLaTeX(rawText);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Sorry, I encountered an error connecting to the ChatGPT explanation service. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPrompt = async (promptTextText?: string) => {
    const promptToSend = promptTextText || inputPrompt;
    if (!promptToSend.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // Limit chat history payload to prevent token overhead
      const historyFormatted = messages.slice(-8).map((m) => ({
        sender: m.sender === 'user' ? 'user' : 'assistant',
        text: m.text,
        codeSnippet: m.codeSnippet,
      }));

      const res = await fetchApiWithLogging<{ answer?: string; error?: string }>('/api/chat', {
        prompt: promptToSend,
        code: activeCode,
        language,
        history: historyFormatted,
      });

      const rawText = res?.answer || res?.error || 'No response generated.';
      const answerText = sanitizeLaTeX(rawText);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Sorry, I encountered an error processing your query. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const promptChips = [
    { label: '🚀 Full Step-by-Step Explanation', prompt: 'Provide a complete step-by-step logic breakdown of this code snippet.' },
    { label: '⚡ Optimize Code Performance', prompt: 'How can this code be optimized for better time and space efficiency?' },
    { label: '🔍 Explain Line-by-Line', prompt: 'Explain what happens line by line in this code snippet.' },
    { label: '🐛 Spot Potential Edge Cases & Bugs', prompt: 'What edge cases or potential bugs exist in this code?' },
    { label: '📊 Big-O Complexity Breakdown', prompt: 'Break down the time and space complexity of this code with mathematical reasoning.' },
    { label: '🔄 Convert to Python / C++', prompt: 'Convert this code snippet into clean, idiomatic Python and C++.' },
  ];

  // Dynamic Window Container Height Class
  const containerHeightClass =
    windowHeight === 'full'
      ? 'min-h-[650px] max-h-[900px] h-[80vh]'
      : windowHeight === 'tall'
      ? 'min-h-[550px] max-h-[750px]'
      : 'min-h-[400px] max-h-[550px]';

  // Dynamic Text Class
  const textScaleClass =
    fontSize === 'lg' ? 'text-base sm:text-lg leading-relaxed' : fontSize === 'sm' ? 'text-xs sm:text-sm leading-normal' : 'text-sm sm:text-[15px] leading-relaxed';

  return (
    <div className="space-y-4">
      {/* CodeXRay Synced Code Banner & Window Resize Controls */}
      <div
        className={`p-4 rounded-2xl border shadow-sm space-y-3 transition-all ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Bot className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  ChatGPT Code Explainer & Assistant
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  GPT-4o / Gemini
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pasted Code Context: <strong className="text-slate-700 dark:text-slate-200 uppercase">{language}</strong> ({activeCode ? activeCode.split('\n').length : 0} lines)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Window Height Resizer */}
            <div className={`flex items-center space-x-1 p-1 rounded-xl border text-xs font-semibold ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800/80 border-white/10 text-slate-300'
            }`}>
              <span className="text-[10px] uppercase font-mono px-1.5 text-slate-400">Height:</span>
              <button
                onClick={() => setWindowHeight('normal')}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  windowHeight === 'normal' ? 'bg-emerald-600 text-white font-bold' : 'hover:text-white'
                }`}
                title="Normal Window Height (400px)"
              >
                Normal
              </button>
              <button
                onClick={() => setWindowHeight('tall')}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  windowHeight === 'tall' ? 'bg-emerald-600 text-white font-bold' : 'hover:text-white'
                }`}
                title="Tall Window Height (600px)"
              >
                Tall
              </button>
              <button
                onClick={() => setWindowHeight('full')}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  windowHeight === 'full' ? 'bg-emerald-600 text-white font-bold' : 'hover:text-white'
                }`}
                title="Expanded Full Window Height (800px)"
              >
                Expanded
              </button>
            </div>

            {/* Font Size Selector */}
            <div className={`flex items-center space-x-1 p-1 rounded-xl border text-xs font-semibold ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800/80 border-white/10 text-slate-300'
            }`}>
              <Type className="w-3.5 h-3.5 text-emerald-500" />
              <button
                onClick={() => setFontSize('sm')}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  fontSize === 'sm' ? 'bg-emerald-600 text-white font-bold' : 'hover:text-white'
                }`}
              >
                S
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  fontSize === 'base' ? 'bg-emerald-600 text-white font-bold' : 'hover:text-white'
                }`}
              >
                M
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  fontSize === 'lg' ? 'bg-emerald-600 text-white font-bold' : 'hover:text-white'
                }`}
              >
                L
              </button>
            </div>

            {/* Snippet Preview Toggle */}
            <button
              onClick={() => setShowCodePreview(!showCodePreview)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-500" />
              <span>{showCodePreview ? 'Hide Snippet' : 'View Snippet'}</span>
              {showCodePreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Re-explain CTA */}
            <button
              onClick={() => handleGenerateExplanation()}
              disabled={isLoading || !activeCode}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Re-explain Code</span>
            </button>
          </div>
        </div>

        {/* Expandable Code Drawer */}
        <AnimatePresence>
          {showCodePreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-2 space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Pasted Code Preview</span>
                <button
                  onClick={handleCopyCode}
                  className="text-emerald-400 hover:underline flex items-center space-x-1"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy All'}</span>
                </button>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 max-h-60 overflow-y-auto whitespace-pre leading-relaxed">
                {activeCode || '// No code pasted in CodeXRay editor yet.'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Prompt Suggestion Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendPrompt(chip.prompt)}
            disabled={isLoading || !activeCode}
            className={`flex-none px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer disabled:opacity-40 ${
              isLight
                ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/10'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* ChatGPT Message Thread Container */}
      <div
        className={`p-4 sm:p-6 rounded-2xl border ${containerHeightClass} overflow-y-auto space-y-6 shadow-sm transition-all duration-300 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-white/10'
        }`}
      >
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Bot className="w-10 h-10 animate-bounce" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                Welcome to ChatGPT Code Explainer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Paste your code into the CodeXRay editor, then click any prompt chip above or hit "Re-explain Code" to generate a complete step-by-step logic breakdown!
              </p>
              <button
                onClick={() => handleGenerateExplanation()}
                disabled={!activeCode}
                className="mt-3 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-40"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Generate Step-by-Step Breakdown</span>
              </button>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex-none p-2 rounded-xl bg-emerald-600 text-white h-fit shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[95%] sm:max-w-[88%] space-y-3 rounded-2xl p-4 sm:p-5 ${textScaleClass} shadow-sm ${
                  isUser
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md'
                    : isLight
                    ? 'bg-slate-100/90 text-slate-800 border border-slate-200/80'
                    : 'bg-slate-950/90 text-slate-200 border border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold opacity-80 pb-2 border-b border-white/10 dark:border-slate-800">
                  <span className="flex items-center gap-1">
                    {isUser ? 'You' : 'ChatGPT AI Assistant'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {msg.codeSnippet && isUser && (
                  <div className="p-3 bg-black/40 rounded-xl font-mono text-xs text-cyan-200 max-h-40 overflow-y-auto border border-white/10 leading-relaxed">
                    <pre>{msg.codeSnippet}</pre>
                  </div>
                )}

                <div className={`chatgpt-markdown ${isLight ? 'chatgpt-markdown-light' : ''}`}>
                  <Markdown
                    components={{
                      pre({ children }: any) {
                        return <>{children}</>;
                      },
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeStr = String(children).replace(/\n$/, '');
                        if (!inline && codeStr) {
                          return (
                            <div className="my-3 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-md">
                              <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                                <span>{match ? match[1].toUpperCase() : 'CODE'}</span>
                                <div className="flex items-center space-x-2">
                                  {onLoadCodeToStudio && (
                                    <button
                                      onClick={() => onLoadCodeToStudio(codeStr, match ? match[1] : language)}
                                      className="flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all text-[11px] font-bold cursor-pointer"
                                      title="Load this code block directly into the CodeXRay editor"
                                    >
                                      <ArrowUpRight className="w-3 h-3" />
                                      <span>Load in Studio Editor</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleCopyChunk(codeStr)}
                                    className="flex items-center space-x-1 text-slate-400 hover:text-white transition-all text-[11px] cursor-pointer"
                                  >
                                    {copiedChunk === codeStr ? (
                                      <span className="text-emerald-400 font-bold">Copied!</span>
                                    ) : (
                                      <span>Copy</span>
                                    )}
                                  </button>
                                </div>
                              </div>
                              <pre className="p-3 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                                <code>{codeStr}</code>
                              </pre>
                            </div>
                          );
                        }
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.text}
                  </Markdown>
                </div>

                {!isUser && (
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/60 text-xs">
                    <span className="text-[11px] text-slate-400">
                      Response generated using Gemini / GPT-4o Engine
                    </span>
                    <button
                      onClick={() => handleCopyText(msg.text, msg.id)}
                      className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedMsgId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Answer</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="flex-none p-2 rounded-xl bg-indigo-600 text-white h-fit shadow-md">
                  <MessageSquare className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          );
        })}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-3 text-xs text-slate-400"
          >
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-md">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center space-x-2">
              <span className="animate-pulse font-medium text-emerald-400">
                ChatGPT is analyzing code & generating step-by-step breakdown...
              </span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Prompt Controls */}
      <div
        className={`p-3 rounded-2xl border flex items-center space-x-3 shadow-md ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'
        }`}
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendPrompt()}
          placeholder="Ask ChatGPT any question about this code (e.g. 'Explain line 4', 'How to handle empty array?')..."
          className="flex-1 bg-transparent text-sm sm:text-[15px] text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none px-3 py-1"
        />

        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800/50 transition-colors cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => handleSendPrompt()}
          disabled={isLoading || !inputPrompt.trim()}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md disabled:opacity-40 transition-all cursor-pointer"
        >
          <span>Ask GPT</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

