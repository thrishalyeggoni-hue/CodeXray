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
  Cpu,
  Layers,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Trash2,
  Terminal,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileCode,
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
}) => {
  const isLight = theme === 'light';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [showCodePreview, setShowCodePreview] = useState(false);
  const [activeCode, setActiveCode] = useState(code);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync active code whenever prop code changes
  useEffect(() => {
    setActiveCode(code);
  }, [code]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-generate step-by-step explanation if code exists and chat is empty
  useEffect(() => {
    if (activeCode && activeCode.trim() && messages.length === 0) {
      handleGenerateExplanation(activeCode);
    }
  }, [activeCode]);

  const handleCopyCode = () => {
    if (!activeCode) return;
    navigator.clipboard.writeText(activeCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Helper to sanitize TeX/LaTeX math symbols ($O(N)$, $\le$, etc.) into clean readable text
  const sanitizeLaTeX = (str: string): string => {
    if (!str) return str;
    return str
      .replace(/\\le/g, '<=')
      .replace(/\\ge/g, '>=')
      .replace(/\\rightarrow/g, '->')
      .replace(/\\leftarrow/g, '<-')
      .replace(/\\times/g, 'x')
      .replace(/\\cdot/g, '*')
      .replace(/\\log/g, 'log')
      .replace(/\\dots/g, '...')
      .replace(/\$([^\$]+)\$/g, '$1')
      .replace(/\$\$([^\$]+)\$\$/g, '$1');
  };

  const handleGenerateExplanation = async (codeToExplain?: string) => {
    const targetCode = codeToExplain || activeCode;
    if (!targetCode || !targetCode.trim()) return;

    const systemPrompt = `Please give a complete, clear, step-by-step explanation of the following ${language.toUpperCase()} code that was pasted into CodeXRay.

CRITICAL FORMATTING INSTRUCTION: Do NOT use LaTeX math symbols, TeX commands, or dollar signs (e.g. do NOT write $O(N)$, $\\le$, $i+1$). Use clean standard plain text math (e.g. O(N), <=, O(N^2), i + 1, ->).

Break it down as follows:
1. **Overview & Goal**: What does this code do in plain English?
2. **Step-by-Step Logic Breakdown**: Walk through line by line or section by section explaining how it executes.
3. **Key Variables & Memory State**: Highlight critical variables, loop counters, array indices, or pointers.
4. **Time & Space Complexity (Big-O)**: Explain why it runs in O(...) time and memory using clean Markdown tables/text without dollar signs.
5. **Edge Cases & Best Practices**: Point out potential bugs or optimizations.`;

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
        language: language,
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
        text: 'Sorry, I encountered an error connecting to ChatGPT explanation service. Please try again.',
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
      const historyFormatted = messages.map((m) => ({
        sender: m.sender === 'user' ? 'user' : 'assistant',
        text: m.text,
        codeSnippet: m.codeSnippet,
      }));

      const res = await fetchApiWithLogging<{ answer?: string; error?: string }>('/api/chat', {
        prompt: promptToSend,
        code: activeCode,
        language: language,
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
        text: 'Sorry, I encountered an error. Please try again.',
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

  return (
    <div className="space-y-4">
      {/* CodeXRay Synced Code Banner */}
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

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCodePreview(!showCodePreview)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-500" />
              <span>{showCodePreview ? 'Hide Snippet' : 'View Snippet'}</span>
              {showCodePreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleCopyCode}
              disabled={!activeCode}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer disabled:opacity-40"
              title="Copy code to clipboard"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleGenerateExplanation()}
              disabled={isLoading || !activeCode}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
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
              className="pt-2"
            >
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 max-h-60 overflow-y-auto whitespace-pre leading-relaxed">
                {activeCode || '// No code pasted in CodeXRay editor yet.'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Prompt Suggestion Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
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

      {/* ChatGPT Message Thread */}
      <div
        className={`p-4 sm:p-6 rounded-2xl border min-h-[420px] max-h-[600px] overflow-y-auto space-y-6 shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-white/10'
        }`}
      >
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Bot className="w-10 h-10 animate-bounce" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Welcome to ChatGPT Code Explainer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste your code into the CodeXRay editor on the left, then click any prompt chip above or hit "Re-explain Code" to generate a step-by-step breakdown!
              </p>
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
                className={`max-w-[92%] sm:max-w-[85%] space-y-3 rounded-2xl p-4 sm:p-5 text-sm sm:text-[15px] leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md'
                    : isLight
                    ? 'bg-slate-100/90 text-slate-800 border border-slate-200/80'
                    : 'bg-slate-950/90 text-slate-200 border border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold opacity-80 pb-2 border-b border-white/10 dark:border-slate-800">
                  <span>{isUser ? 'You' : 'ChatGPT Assistant'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                {msg.codeSnippet && isUser && (
                  <div className="p-3 bg-black/40 rounded-xl font-mono text-xs text-cyan-200 max-h-40 overflow-y-auto border border-white/10 leading-relaxed">
                    <pre>{msg.codeSnippet}</pre>
                  </div>
                )}

                <div className={`chatgpt-markdown ${isLight ? 'chatgpt-markdown-light' : ''}`}>
                  <Markdown>{msg.text}</Markdown>
                </div>

                {!isUser && (
                  <div className="flex items-center justify-end space-x-2 pt-2.5 border-t border-slate-800/60">
                    <button
                      onClick={() => handleCopyMessage(msg.text, msg.id)}
                      className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
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
