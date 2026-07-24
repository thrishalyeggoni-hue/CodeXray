import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import {
  Sparkles,
  Send,
  Code2,
  Cpu,
  Layers,
  HelpCircle,
  Paperclip,
  Mic,
  MicOff,
  Globe,
  Bot,
  User,
  Copy,
  Check,
  Play,
  Terminal,
  RefreshCw,
  Zap,
  ArrowRight,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { GoogleUser } from '../types';
import { sanitizeLaTeX } from '../utils/sanitize';

interface GeminiChatViewProps {
  onLoadCodeToStudio: (code: string, language?: string) => void;
  user?: GoogleUser | null;
  theme?: 'dark' | 'light';
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  codeSnippet?: string;
  language?: string;
  timestamp: string;
}

export const GeminiChatView: React.FC<GeminiChatViewProps> = ({
  onLoadCodeToStudio,
  user,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [codeContext, setCodeContext] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [modelName, setModelName] = useState('Gemini 3.6 Flash');
  const [isSearchGrounding, setIsSearchGrounding] = useState(true);
  const [showCodeInputModal, setShowCodeInputModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Speech Recognition setup if supported
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser environment.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const promptText = textToSend || inputPrompt;
    if (!promptText.trim() && !codeContext.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: promptText,
      codeSnippet: codeContext || undefined,
      language: selectedLanguage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          code: codeContext || undefined,
          language: selectedLanguage,
          history: messages,
          model: modelName,
          enableSearch: isSearchGrounding,
        }),
      });

      const data = await res.json();
      const answerText = data.answer || data.error || 'No response generated.';

      const geminiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'gemini',
        text: answerText,
        codeSnippet: codeContext || undefined,
        language: selectedLanguage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, geminiMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'gemini',
        text: err?.message || 'Sorry, I encountered an issue connecting to Gemini. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const promptCards = [
    {
      title: 'Trace Stack & Pointer Memory',
      description: 'Run Python Tutor step-by-step visualizer to inspect heap & stack frame mutations',
      icon: Code2,
      prompt: 'Can you show me a step-by-step memory pointer trace of Binary Search?',
      codeSample: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

numbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
result = binary_search(numbers, 23)
print(f"Target found at index: {result}")`,
      color: 'from-blue-500/20 via-indigo-500/10 to-purple-500/20 text-blue-400 border-blue-500/30',
    },
    {
      title: 'Analyze Time & Space Big-O',
      description: 'Break down runtime execution bottlenecks, time O(N log N), and memory allocations',
      icon: Cpu,
      prompt: 'Analyze the Big-O time and space complexity of Quick Sort vs Merge Sort.',
      codeSample: `def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

data = [3, 6, 8, 10, 1, 2, 1]
print(quicksort(data))`,
      color: 'from-purple-500/20 via-pink-500/10 to-blue-500/20 text-purple-400 border-purple-500/30',
    },
    {
      title: 'Line-by-Line Execution Xray',
      description: 'Deconstruct code logic statement by statement with variable scope updates',
      icon: Layers,
      prompt: 'Explain line-by-line how a Two-Pointer technique finds two numbers summing to k.',
      codeSample: `def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        current_sum = arr[left] + arr[right]
        if current_sum == target:
            return [left, right]
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    return []

print(two_sum_sorted([1, 2, 4, 6, 8, 11], 10))`,
      color: 'from-cyan-500/20 via-blue-500/10 to-purple-500/20 text-cyan-400 border-cyan-500/30',
    },
    {
      title: 'Technical Interview Practice',
      description: 'Generate real LeetCode-style interview questions, hints, and model answer keys',
      icon: HelpCircle,
      prompt: 'Generate 3 technical interview follow-up questions for Linked List Cycle detection.',
      codeSample: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False`,
      color: 'from-pink-500/20 via-rose-500/10 to-purple-500/20 text-pink-400 border-pink-500/30',
    },
  ];

  const handleSelectCard = (card: typeof promptCards[0]) => {
    setCodeContext(card.codeSample);
    handleSendMessage(card.prompt);
  };

  const userName = user?.name ? user.name.split(' ')[0] : 'Developer';

  return (
    <div className="max-w-5xl mx-auto min-h-[85vh] flex flex-col justify-between px-3 sm:px-6 py-4">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between pb-4 mb-2 border-b border-white/10 shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-r from-[#1a73e8]/20 via-[#a142f4]/20 to-[#e91e63]/20 border border-blue-400/30 shadow-md">
            <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Google Gemini AI Studio
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-blue-500/20 text-cyan-300 border border-blue-400/30">
                v3.6 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive AI Assistant & CodeXray Visualizer Engine
            </p>
          </div>
        </div>

        {/* Model Selector Pill */}
        <div className="flex items-center space-x-2">
          <select
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className={`text-xs px-3 py-1.5 rounded-full border font-mono font-semibold transition-all focus:outline-none cursor-pointer ${
              isLight
                ? 'bg-white border-slate-300 text-slate-700 shadow-sm'
                : 'bg-[#12131e] border-white/15 text-slate-200 hover:border-white/30'
            }`}
          >
            <option value="Gemini 3.6 Flash">✨ Gemini 3.6 Flash</option>
            <option value="Gemini 3.1 Pro">⚡ Gemini 3.1 Pro</option>
          </select>

          <button
            onClick={() => setIsSearchGrounding(!isSearchGrounding)}
            className={`hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isSearchGrounding
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
            title="Google Search Grounding"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Search Grounding</span>
          </button>
        </div>
      </div>

      {/* Main Conversation Canvas or Welcome Screen */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6 min-h-0 pr-1">
        {messages.length === 0 ? (
          <div className="space-y-8 my-auto pt-6">
            {/* Animated Gradient Greeting (Authentic Gemini Style) */}
            <div className="space-y-3 text-left">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-5xl font-extrabold tracking-tight"
              >
                <span className="bg-gradient-to-r from-[#1a73e8] via-[#8ab4f8] via-[#a142f4] via-[#e91e63] to-[#00e5ff] bg-clip-text text-transparent animate-gemini-aurora">
                  Hello, {userName}
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`text-2xl sm:text-3xl font-semibold ${
                  isLight ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Where would you like to start today?
              </motion.p>
            </div>

            {/* 4 Interactive Gemini Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {promptCards.map((card, idx) => {
                const IconComp = card.icon;
                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + idx * 0.08 }}
                    onClick={() => handleSelectCard(card)}
                    className={`p-4 sm:p-5 rounded-2xl border backdrop-blur-xl transition-all cursor-pointer group hover:scale-[1.02] shadow-lg ${
                      isLight
                        ? 'bg-white/80 border-slate-200 hover:border-blue-400 hover:shadow-xl'
                        : `bg-gradient-to-br ${card.color} hover:border-cyan-400/50`
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 shrink-0 group-hover:scale-110 transition-transform">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="mt-4 space-y-1">
                      <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {card.title}
                      </h3>
                      <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {card.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Messages Stream */
          <div className="space-y-6">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 sm:gap-4 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'gemini' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a73e8] via-[#a142f4] to-[#e91e63] p-0.5 shrink-0 shadow-md">
                    <div className="w-full h-full rounded-full bg-[#0d0e15] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-cyan-300" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 sm:p-5 space-y-3 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-lg'
                      : isLight
                      ? 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-md'
                      : 'bg-[#12131e] border border-white/10 text-slate-100 rounded-bl-none shadow-xl'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] opacity-75 font-mono">
                    <span className="font-bold">
                      {msg.sender === 'user' ? (user?.name || 'You') : 'Google Gemini AI'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className="chatgpt-markdown text-sm sm:text-base leading-relaxed font-sans space-y-2">
                    <Markdown>{sanitizeLaTeX(msg.text)}</Markdown>
                  </div>

                  {msg.codeSnippet && (
                    <div className="rounded-xl bg-[#090a10] border border-white/15 p-3 space-y-2 font-mono text-xs overflow-x-auto">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-white/10 pb-1.5">
                        <span className="uppercase text-cyan-400 font-bold">{msg.language || 'python'}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCopyText(msg.codeSnippet!, msg.id)}
                            className="flex items-center space-x-1 hover:text-white transition-colors"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>Copy</span>
                          </button>

                          <button
                            onClick={() => onLoadCodeToStudio(msg.codeSnippet!, msg.language)}
                            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all"
                          >
                            <Play className="w-3 h-3 text-amber-300" />
                            <span>Inspect Memory</span>
                          </button>
                        </div>
                      </div>
                      <pre className="text-slate-200">{msg.codeSnippet}</pre>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
                    {user?.picture ? (
                      <img src={user.picture} alt="" className="w-full h-full rounded-full" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                )}
              </motion.div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-3 text-slate-400 text-xs font-mono py-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-0.5 animate-pulse">
                  <div className="w-full h-full bg-[#0d0e15] rounded-full flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
                  </div>
                </div>
                <span>Gemini AI is analyzing code & memory traces...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Code Context Preview Chip if attached */}
      {codeContext && (
        <div className="mb-2 p-2.5 rounded-xl bg-[#12131e] border border-blue-500/30 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2 truncate">
            <Code2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-slate-300 truncate font-semibold">
              Attached Code Context ({codeContext.split('\n').length} lines)
            </span>
          </div>
          <button
            onClick={() => setCodeContext('')}
            className="text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/5 text-[10px]"
          >
            Clear
          </button>
        </div>
      )}

      {/* Gemini Command Input Capsule Bar (Sleek Gemini Aesthetic) */}
      <div className="sticky bottom-0 pt-2 bg-transparent z-20">
        <div
          className={`p-2.5 sm:p-3 rounded-2xl border backdrop-blur-2xl transition-all shadow-2xl ${
            isLight
              ? 'bg-white/90 border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'
              : 'bg-[#12131e]/95 border-white/15 focus-within:border-cyan-400/60 focus-within:ring-2 focus-within:ring-cyan-500/20'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCodeInputModal(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
              title="Attach or Paste Code Snippet"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask Gemini AI anything about algorithms, memory stack, Big-O, or interview prep..."
              className={`flex-1 bg-transparent text-sm focus:outline-none ${
                isLight ? 'text-slate-800 placeholder:text-slate-400' : 'text-slate-100 placeholder:text-slate-500'
              }`}
            />

            <button
              onClick={toggleSpeechRecognition}
              className={`p-2 rounded-xl transition-all shrink-0 ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title="Voice Input (Speech-to-Text)"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || (!inputPrompt.trim() && !codeContext.trim())}
              className="p-2.5 rounded-xl bg-gradient-to-r from-[#1a73e8] via-[#7c3aed] to-[#db2777] text-white hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-40 disabled:hover:scale-100 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Attach Code Modal */}
      <AnimatePresence>
        {showCodeInputModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-lg p-5 rounded-2xl border shadow-2xl space-y-4 ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#12131e] border-white/15 text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-sm">Attach Code Snippet to Gemini Prompt</h3>
                </div>
                <button
                  onClick={() => setShowCodeInputModal(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-black/30 border border-white/10 text-slate-200 font-mono"
                >
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="javascript">JavaScript</option>
                  <option value="c">C</option>
                </select>

                <textarea
                  value={codeContext}
                  onChange={(e) => setCodeContext(e.target.value)}
                  rows={8}
                  placeholder="Paste your code snippet here..."
                  className="w-full p-3 rounded-xl bg-[#090a10] border border-white/15 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowCodeInputModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCodeInputModal(false)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold shadow-md"
                >
                  Attach Snippet
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
