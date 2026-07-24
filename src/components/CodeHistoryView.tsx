import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Clock,
  Code2,
  Trash2,
  Play,
  ArrowRight,
  Sparkles,
  FileCode,
  Search,
  Check,
  Copy,
  BookOpen,
} from 'lucide-react';
import { ProgrammingLanguage } from '../types';

export interface HistoryItem {
  id: string;
  timestamp: string;
  code: string;
  language: ProgrammingLanguage | string;
  title?: string;
  summary?: string;
}

interface CodeHistoryViewProps {
  onLoadCode: (code: string, language?: ProgrammingLanguage) => void;
  onExplainWithChatGPT: (code: string, language?: ProgrammingLanguage) => void;
  theme?: 'dark' | 'light';
}

export const CodeHistoryView: React.FC<CodeHistoryViewProps> = ({
  onLoadCode,
  onExplainWithChatGPT,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('codexray_code_history');
      if (saved !== null) {
        setHistory(JSON.parse(saved));
      } else {
        // Seed initial history item if user has never saved or visited history
        const defaultHistory: HistoryItem[] = [
          {
            id: 'hist-1',
            timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            language: 'java',
            title: 'Two Sum Pointer Hash Search',
            code: `public class TwoSum {\n    public static int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[] {};\n    }\n}`,
            summary: 'O(N) Time complexity using HashMap lookup for target complement.',
          },
          {
            id: 'hist-2',
            timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            language: 'python',
            title: 'Recursive Fibonacci with Memoization',
            code: `def fib(n, memo={}):\n    if n in memo:\n        return memo[n]\n    if n <= 1:\n        return n\n    memo[n] = fib(n-1, memo) + fib(n-2, memo)\n    return memo[n]\n\nprint("Fib(10) =", fib(10))`,
            summary: 'O(N) Time and O(N) auxiliary stack space with dynamic programming memo table.',
          }
        ];
        setHistory(defaultHistory);
        localStorage.setItem('codexray_code_history', JSON.stringify(defaultHistory));
      }
    } catch {
      setHistory([]);
    }
  }, []);

  const handleClearAll = () => {
    setHistory([]);
    localStorage.setItem('codexray_code_history', JSON.stringify([]));
    setShowClearModal(false);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem('codexray_code_history', JSON.stringify(updated));
  };

  const handleCopyCode = (code: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredHistory = history.filter(
    (item) =>
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div
        className={`p-4 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'
        }`}
      >
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Code Studio Analysis History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {history.length} saved code sessions in local storage
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-1 max-w-xs">
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border w-full ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="bg-transparent text-xs outline-none w-full text-slate-800 dark:text-slate-200 placeholder-slate-400"
            />
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => setShowClearModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-semibold border border-rose-500/20 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Clear History Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}>
            <div className="flex items-center space-x-3 text-rose-500">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Clear Code History?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This will permanently delete all {history.length} saved code sessions from your local storage.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                Yes, Clear All History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Grid List */}
      {filteredHistory.length === 0 ? (
        <div
          className={`p-12 text-center rounded-2xl border space-y-3 ${
            isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-slate-900/50 border-white/10 text-slate-400'
          }`}
        >
          <Clock className="w-10 h-10 mx-auto text-slate-400 animate-pulse" />
          <div className="font-bold text-sm text-slate-700 dark:text-slate-200">
            No code history found
          </div>
          <p className="text-xs max-w-sm mx-auto text-slate-500 dark:text-slate-400">
            Paste or analyze code in Code Studio to automatically save it into your history log.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHistory.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => onLoadCode(item.code, item.language as ProgrammingLanguage)}
              className={`p-4 rounded-2xl border shadow-sm space-y-3 transition-all flex flex-col justify-between cursor-pointer group ${
                isLight
                  ? 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'
                  : 'bg-slate-900/90 border-white/10 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 font-mono">
                      {item.language}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleCopyCode(item.code, item.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Copy Code"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-400 transition-colors">
                  {item.title || `${item.language.toUpperCase()} Code Snippet`}
                </h4>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 max-h-32 overflow-y-auto whitespace-pre leading-relaxed hover:border-indigo-500/30 transition-colors">
                  {item.code}
                </div>

                {item.summary && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic leading-normal">
                    {item.summary}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                <span className="text-[10px] text-indigo-400 font-semibold hidden sm:inline">
                  Click card to load in Studio
                </span>

                <div className="flex items-center space-x-2 ml-auto">
                  <button
                    onClick={() => onLoadCode(item.code, item.language as ProgrammingLanguage)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Load in Studio Editor</span>
                  </button>

                  <button
                    onClick={() => onExplainWithChatGPT(item.code, item.language as ProgrammingLanguage)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Explain with ChatGPT</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
