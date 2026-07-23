import React, { useState } from 'react';
import { NotesResponse } from '../types';
import {
  BookOpen,
  Copy,
  Check,
  Printer,
  FileText,
  CheckCircle2,
  Bookmark,
  ExternalLink,
  Download,
  Eye,
  X,
} from 'lucide-react';

interface NotesViewProps {
  notesData: NotesResponse | null;
  theme?: 'dark' | 'light';
}

export const NotesView: React.FC<NotesViewProps> = ({ notesData, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const [copied, setCopied] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  if (!notesData) {
    return (
      <div className={`p-8 text-center rounded-xl border text-xs ${
        isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#0e0e10] border-white/5 text-slate-500'
      }`}>
        No study notes generated yet. Click "Analyze Code" to prepare exam revision notes.
      </div>
    );
  }

  const getPrintableHTML = () => {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${notesData.title || 'CodeXray AI - Exam Revision Notes'}</title>
    <style>
      @page { size: A4; margin: 15mm; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #0f172a;
        background: #ffffff;
        padding: 24px;
        line-height: 1.6;
        font-size: 13px;
        max-width: 800px;
        margin: 0 auto;
      }
      .header {
        border-bottom: 2px solid #3b82f6;
        padding-bottom: 12px;
        margin-bottom: 20px;
      }
      h1 { font-size: 22px; margin: 0 0 6px 0; color: #1e293b; }
      .badge {
        display: inline-block;
        padding: 3px 8px;
        background: #e0e7ff;
        color: #3730a3;
        font-size: 11px;
        font-weight: 600;
        border-radius: 4px;
        text-transform: uppercase;
      }
      h2 {
        font-size: 14px;
        color: #2563eb;
        margin-top: 20px;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 12px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        margin-bottom: 16px;
      }
      .grid-box {
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        padding: 8px;
        border-radius: 6px;
        text-align: center;
      }
      .grid-label { font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; }
      .grid-val { font-size: 12px; font-weight: 700; color: #0284c7; font-family: monospace; }
      .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      ul { margin: 0; padding-left: 20px; }
      li { margin-bottom: 4px; }
      .cheat-sheet {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: 8px;
        padding: 14px;
        color: #1e40af;
      }
      .no-print-toolbar {
        margin-bottom: 24px;
        padding: 12px 16px;
        background: #1e293b;
        color: #fff;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .btn {
        padding: 8px 16px;
        background: #2563eb;
        color: #fff;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 12px;
      }
      @media print {
        .no-print-toolbar { display: none !important; }
        body { padding: 0; }
      }
    </style>
  </head>
  <body>
    <div class="no-print-toolbar">
      <span>CodeXray AI - Printable Exam Sheet</span>
      <button class="btn" onclick="window.print()">Print / Save as PDF</button>
    </div>

    <div class="header">
      <span class="badge">Exam & Interview Revision Notes</span>
      <h1>${notesData.title || 'Algorithmic Revision Notes'}</h1>
    </div>

    <h2>1. Overview & Core Definition</h2>
    <div class="box">${notesData.summary}</div>

    <h2>2. Step-by-Step Logic</h2>
    ${notesData.algorithmSteps.map((step) => `<div class="box font-mono" style="font-family: monospace; font-size: 12px;">${step}</div>`).join('')}

    <h2>3. Complexity Bounds</h2>
    <div class="grid">
      <div class="grid-box">
        <div class="grid-label">Best</div>
        <div class="grid-val" style="color: #059669;">${notesData.complexitySummary.best}</div>
      </div>
      <div class="grid-box">
        <div class="grid-label">Average</div>
        <div class="grid-val" style="color: #2563eb;">${notesData.complexitySummary.average}</div>
      </div>
      <div class="grid-box">
        <div class="grid-label">Worst</div>
        <div class="grid-val" style="color: #d97706;">${notesData.complexitySummary.worst}</div>
      </div>
      <div class="grid-box">
        <div class="grid-label">Space Aux</div>
        <div class="grid-val" style="color: #7c3aed;">${notesData.complexitySummary.space}</div>
      </div>
    </div>

    <h2>4. Pros & Trade-offs</h2>
    <div class="two-col">
      <div class="box">
        <strong style="color: #059669;">Pros & Advantages:</strong>
        <ul style="margin-top: 6px;">${notesData.prosAndCons.pros.map((p) => `<li>${p}</li>`).join('')}</ul>
      </div>
      <div class="box">
        <strong style="color: #dc2626;">Trade-offs & Cons:</strong>
        <ul style="margin-top: 6px;">${notesData.prosAndCons.cons.map((c) => `<li>${c}</li>`).join('')}</ul>
      </div>
    </div>

    <h2>5. Real-World Applications</h2>
    <div class="box">
      ${notesData.realWorldApplications.map((app) => `<span style="display:inline-block; margin:2px 4px; padding:2px 8px; background:#e2e8f0; border-radius:4px; font-size:11px;">${app}</span>`).join('')}
    </div>

    <h2>6. High-Yield Exam Takeaways</h2>
    <div class="cheat-sheet">
      <strong>⚡ Revision Takeaway:</strong>
      <p style="margin: 4px 0 0 0;">${notesData.cheatSheetSummary}</p>
    </div>
  </body>
</html>`;
  };

  const handleCopyMarkdown = () => {
    const text = `# ${notesData.title}

## Summary
${notesData.summary}

## Algorithm Logic
${notesData.algorithmSteps.map((s) => `- ${s}`).join('\n')}

## Complexity
- Best Case: ${notesData.complexitySummary.best}
- Average Case: ${notesData.complexitySummary.average}
- Worst Case: ${notesData.complexitySummary.worst}
- Auxiliary Space: ${notesData.complexitySummary.space}

## Pros & Cons
### Pros
${notesData.prosAndCons.pros.map((p) => `- ${p}`).join('\n')}

### Cons
${notesData.prosAndCons.cons.map((c) => `- ${c}`).join('\n')}

## Real-World Applications
${notesData.realWorldApplications.map((a) => `- ${a}`).join('\n')}

## Revision Cheat Sheet
${notesData.cheatSheetSummary}
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('Native window.print() failed, opening preview modal:', e);
      setShowPreviewModal(true);
    }
  };

  const handleOpenBlobTab = () => {
    try {
      const htmlContent = getPrintableHTML();
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win) {
        // Popups blocked, download html file instead
        handleDownloadHtml();
      }
    } catch (e) {
      console.error('Failed to open print tab:', e);
      handleDownloadHtml();
    }
  };

  const handleDownloadHtml = () => {
    const htmlContent = getPrintableHTML();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(notesData.title || 'Exam_Notes').replace(/\s+/g, '_')}_Revision.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className={`p-4 rounded-xl border shadow-sm flex flex-wrap items-center justify-between gap-4 ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0e0e10] border-white/5 text-slate-200'
      }`}>
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Exam & Interview Revision Cheat Sheet</span>
          </div>
          <h3 className={`text-lg font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {notesData.title || 'Algorithmic Study Notes'}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {/* Copy Markdown */}
          <button
            onClick={handleCopyMarkdown}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-white/5 hover:bg-white/10 text-slate-200 border-transparent'
            }`}
            title="Copy Markdown representation"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            )}
            <span>{copied ? 'Copied' : 'Copy MD'}</span>
          </button>

          {/* Print Preview Modal Toggle */}
          <button
            onClick={() => setShowPreviewModal(true)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-white/5 hover:bg-white/10 text-slate-200 border-transparent'
            }`}
            title="Open Clean Light Mode Print Sheet"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
            <span>Preview Sheet</span>
          </button>

          {/* Download HTML */}
          <button
            onClick={handleDownloadHtml}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-white/5 hover:bg-white/10 text-slate-200 border-transparent'
            }`}
            title="Download printable HTML file for offline saving/printing"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Save HTML</span>
          </button>

          {/* Primary Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Printable Notes Container */}
      <div className={`printable-notes p-6 rounded-xl border space-y-6 ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
          : 'bg-[#0e0e10] border-white/5 text-slate-300'
      }`}>
        {/* Definition Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center space-x-2">
            <Bookmark className="w-3.5 h-3.5" />
            <span>1. Core Definition & Overview</span>
          </h4>
          <p className={`text-xs leading-relaxed p-4 rounded-xl border ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-900'
              : 'bg-black/40 border-white/5 text-slate-200'
          }`}>
            {notesData.summary}
          </p>
        </div>

        {/* Algorithm Steps */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center space-x-2">
            <FileText className="w-3.5 h-3.5" />
            <span>2. Step-by-Step Execution Logic</span>
          </h4>
          <div className="space-y-2 text-xs">
            {notesData.algorithmSteps.map((step, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border font-mono text-[11px] ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900'
                    : 'bg-black/40 border-white/5 text-slate-200'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Complexity Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>3. Complexity Bounds</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className={`p-3 rounded-xl border text-center ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/5'
            }`}>
              <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Best Case</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                {notesData.complexitySummary.best}
              </div>
            </div>
            <div className={`p-3 rounded-xl border text-center ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/5'
            }`}>
              <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Average Case</div>
              <div className="text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">
                {notesData.complexitySummary.average}
              </div>
            </div>
            <div className={`p-3 rounded-xl border text-center ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/5'
            }`}>
              <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Worst Case</div>
              <div className="text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                {notesData.complexitySummary.worst}
              </div>
            </div>
            <div className={`p-3 rounded-xl border text-center ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/5'
            }`}>
              <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Space Aux</div>
              <div className="text-purple-600 dark:text-purple-400 font-bold mt-0.5">
                {notesData.complexitySummary.space}
              </div>
            </div>
          </div>
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className={`p-4 rounded-xl border space-y-2 ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-black/40 border-white/5 text-slate-300'
          }`}>
            <h5 className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[11px]">
              Pros & Advantages
            </h5>
            <ul className="list-disc list-inside space-y-1">
              {notesData.prosAndCons.pros.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
          </div>
          <div className={`p-4 rounded-xl border space-y-2 ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-black/40 border-white/5 text-slate-300'
          }`}>
            <h5 className="font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider text-[11px]">
              Trade-offs & Cons
            </h5>
            <ul className="list-disc list-inside space-y-1">
              {notesData.prosAndCons.cons.map((c, idx) => (
                <li key={idx}>{c}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Real World Applications */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            4. Real-World Applications & Use Cases
          </h4>
          <div className="flex flex-wrap gap-2 text-xs">
            {notesData.realWorldApplications.map((app, idx) => (
              <span
                key={idx}
                className={`px-3 py-1.5 rounded-lg border ${
                  isLight
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-medium'
                    : 'bg-black/40 border-white/5 text-slate-300'
                }`}
              >
                {app}
              </span>
            ))}
          </div>
        </div>

        {/* High Yield Takeaways */}
        <div className={`p-4 rounded-xl border space-y-1 text-xs ${
          isLight
            ? 'bg-indigo-50 border-indigo-200 text-indigo-950'
            : 'bg-indigo-950/20 border-indigo-500/20 text-slate-300'
        }`}>
          <div className="font-bold text-indigo-800 dark:text-indigo-300">⚡ Last-Minute Exam Takeaways</div>
          <p className="leading-relaxed">
            {notesData.cheatSheetSummary}
          </p>
        </div>
      </div>

      {/* In-App Clean Print Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Print / Save PDF Preview
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={handleDownloadHtml}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Save File</span>
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body - Paper Document */}
            <div className="p-8 overflow-y-auto space-y-6 text-xs bg-white text-slate-900 leading-relaxed">
              <div className="border-b-2 border-indigo-600 pb-3">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded uppercase">
                  Exam & Interview Revision Notes
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">
                  {notesData.title || 'Algorithmic Revision Notes'}
                </h2>
              </div>

              <div>
                <h3 className="font-bold text-indigo-600 text-xs uppercase mb-1">
                  1. Core Definition & Overview
                </h3>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
                  {notesData.summary}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-indigo-600 text-xs uppercase mb-1">
                  2. Step-by-Step Logic
                </h3>
                <div className="space-y-1.5">
                  {notesData.algorithmSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-[11px]"
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-indigo-600 text-xs uppercase mb-1">
                  3. Complexity Bounds
                </h3>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-slate-100 border border-slate-200 rounded">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Best</div>
                    <div className="text-emerald-700 font-bold font-mono text-xs">{notesData.complexitySummary.best}</div>
                  </div>
                  <div className="p-2 bg-slate-100 border border-slate-200 rounded">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Average</div>
                    <div className="text-indigo-700 font-bold font-mono text-xs">{notesData.complexitySummary.average}</div>
                  </div>
                  <div className="p-2 bg-slate-100 border border-slate-200 rounded">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Worst</div>
                    <div className="text-amber-700 font-bold font-mono text-xs">{notesData.complexitySummary.worst}</div>
                  </div>
                  <div className="p-2 bg-slate-100 border border-slate-200 rounded">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Space</div>
                    <div className="text-purple-700 font-bold font-mono text-xs">{notesData.complexitySummary.space}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <strong className="text-emerald-700 text-xs uppercase block mb-1">
                    Pros & Advantages
                  </strong>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                    {notesData.prosAndCons.pros.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <strong className="text-rose-700 text-xs uppercase block mb-1">
                    Trade-offs & Cons
                  </strong>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                    {notesData.prosAndCons.cons.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <strong className="text-blue-900 text-xs block mb-0.5">
                  ⚡ Revision Takeaway:
                </strong>
                <p className="text-blue-950 text-[11px] leading-relaxed">
                  {notesData.cheatSheetSummary}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

