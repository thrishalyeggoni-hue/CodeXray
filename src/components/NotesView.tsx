import React, { useState } from 'react';
import { NotesResponse, DryRunResponse, ProgrammingLanguage } from '../types';
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
  MonitorPlay,
} from 'lucide-react';

interface NotesViewProps {
  notesData: NotesResponse | null;
  dryRunData?: DryRunResponse | null;
  code?: string;
  language?: ProgrammingLanguage;
  theme?: 'dark' | 'light';
}

export const NotesView: React.FC<NotesViewProps> = ({
  notesData,
  dryRunData,
  code,
  language,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [copied, setCopied] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  if (!notesData) {
    return (
      <div className={`p-8 text-center rounded-2xl border text-xs backdrop-blur-md ${
        isLight ? 'bg-slate-50/80 border-slate-200 text-slate-500' : 'bg-[#0e0e10]/80 border-white/10 text-slate-500'
      }`}>
        No study notes generated yet. Click "Analyze Code" to prepare exam revision notes with Python Tutor trace steps.
      </div>
    );
  }

  const pythonTutorLangMap: Record<string, string> = {
    python: '3',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    javascript: 'js',
    typescript: 'ts',
  };
  const ptLang = pythonTutorLangMap[language || 'java'] || 'java';
  const directTutorUrl = code
    ? `https://pythontutor.com/render.html#code=${encodeURIComponent(
        code
      )}&cumulative=false&py=${ptLang}&rawInputLstJSON=%5B%5D`
    : null;

  const escapeHtml = (str: string) =>
    String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const getPrintableHTML = () => {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(notesData.title || 'CodeXray AI - Exam Revision Notes')}</title>
    <style>
      @page { size: A4; margin: 12mm; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #0f172a;
        background: #ffffff;
        padding: 20px;
        line-height: 1.5;
        font-size: 12px;
        max-width: 850px;
        margin: 0 auto;
      }
      .header {
        border-bottom: 2px solid #4f46e5;
        padding-bottom: 10px;
        margin-bottom: 16px;
      }
      h1 { font-size: 20px; margin: 0 0 4px 0; color: #1e1b4b; font-weight: 800; }
      .badge {
        display: inline-block;
        padding: 3px 8px;
        background: #e0e7ff;
        color: #3730a3;
        font-size: 10px;
        font-weight: 700;
        border-radius: 9999px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      h2 {
        font-size: 13px;
        color: #4338ca;
        margin-top: 18px;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 800;
        border-bottom: 1px solid #e0e7ff;
        padding-bottom: 4px;
      }
      .box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 10px 14px;
        margin-bottom: 10px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        margin-bottom: 12px;
      }
      .grid-box {
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        padding: 8px;
        border-radius: 6px;
        text-align: center;
      }
      .grid-label { font-size: 9px; color: #64748b; font-weight: 700; text-transform: uppercase; }
      .grid-val { font-size: 11px; font-weight: 700; color: #0284c7; font-family: monospace; }
      .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      ul { margin: 0; padding-left: 18px; }
      li { margin-bottom: 3px; }
      .cheat-sheet {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: 8px;
        padding: 12px;
        color: #1e40af;
      }
      .trace-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 12px;
        font-size: 11px;
      }
      .trace-table th {
        background: #e0e7ff;
        color: #312e81;
        text-align: left;
        padding: 6px 8px;
        font-size: 10px;
        text-transform: uppercase;
        font-weight: 700;
        border-bottom: 2px solid #c7d2fe;
      }
      .trace-table td {
        padding: 6px 8px;
        border-bottom: 1px solid #e2e8f0;
        vertical-align: top;
      }
      .code-tag {
        font-family: monospace;
        background: #f1f5f9;
        padding: 2px 5px;
        border-radius: 4px;
        font-size: 10.5px;
        color: #312e81;
        font-weight: 600;
      }
      .var-tag {
        font-family: monospace;
        color: #047857;
        font-weight: 700;
        font-size: 10.5px;
      }
      .no-print-toolbar {
        margin-bottom: 20px;
        padding: 10px 16px;
        background: #1e1b4b;
        color: #fff;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      .btn {
        padding: 6px 16px;
        background: #4f46e5;
        color: #fff;
        border: none;
        border-radius: 9999px;
        font-weight: 700;
        cursor: pointer;
        font-size: 11px;
      }
      @media print {
        .no-print-toolbar { display: none !important; }
        body { padding: 0; }
      }
    </style>
  </head>
  <body>
    <div class="no-print-toolbar">
      <span style="font-weight: 700; font-size: 12px;">CodeXray AI - Printable Exam Sheet & Python Tutor Trace</span>
      <button class="btn" onclick="window.print()">Print / Save as PDF</button>
    </div>

    <div class="header">
      <span class="badge">Exam & Interview Revision Cheat Sheet</span>
      <h1>${escapeHtml(notesData.title || 'Algorithmic Revision Notes')}</h1>
    </div>

    <h2>1. Overview & Core Definition</h2>
    <div class="box">${escapeHtml(notesData.summary)}</div>

    <h2>2. Python Tutor Step-by-Step Memory & Variable Trace</h2>
    ${
      dryRunData && dryRunData.steps && dryRunData.steps.length > 0
        ? `
      <table class="trace-table">
        <thead>
          <tr>
            <th style="width: 45px; text-align: center;">Step</th>
            <th style="width: 50px; text-align: center;">Line</th>
            <th>Executed Code</th>
            <th>Variable Memory State</th>
            <th>Trace Explanation</th>
          </tr>
        </thead>
        <tbody>
          ${dryRunData.steps
            .map(
              (step) => `
            <tr style="background:${step.stepNumber % 2 === 0 ? '#f8fafc' : '#ffffff'};">
              <td style="text-align: center; font-weight: 800; color: #4f46e5;">#${step.stepNumber}</td>
              <td style="text-align: center; font-family: monospace; color: #64748b;">Line ${step.lineNumber}</td>
              <td><span class="code-tag">${escapeHtml(step.lineContent || '')}</span></td>
              <td>
                ${
                  step.variables && Object.keys(step.variables).length > 0
                    ? `<span class="var-tag">${Object.entries(step.variables)
                        .map(([k, v]) => `${escapeHtml(k)} = ${escapeHtml(JSON.stringify(v))}`)
                        .join(', ')}</span>`
                    : '<span style="color:#94a3b8; font-style:italic;">No variable changes</span>'
                }
              </td>
              <td style="color:#334155;">${escapeHtml(step.explanation || '')}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      ${
        dryRunData.finalOutput
          ? `<div class="box" style="background:#f0fdf4; border-color:#bbf7d0; color:#166534; font-family:monospace; font-size:11px;"><strong>Final Output Yield:</strong> ${escapeHtml(
              dryRunData.finalOutput
            )}</div>`
          : ''
      }
    `
        : `
      <div class="box" style="color:#64748b; font-style:italic;">
        General execution flow steps:
        <ul style="margin-top:6px;">
          ${notesData.algorithmSteps.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}
        </ul>
      </div>
    `
    }

    <h2>3. Algorithm Execution Logic</h2>
    <div class="space-y-1">
      ${notesData.algorithmSteps
        .map(
          (step) =>
            `<div class="box" style="font-family: monospace; font-size: 11px;">${escapeHtml(
              step
            )}</div>`
        )
        .join('')}
    </div>

    <h2>4. Complexity Bounds</h2>
    <div class="grid">
      <div class="grid-box">
        <div class="grid-label">Best</div>
        <div class="grid-val" style="color: #059669;">${escapeHtml(notesData.complexitySummary.best)}</div>
      </div>
      <div class="grid-box">
        <div class="grid-label">Average</div>
        <div class="grid-val" style="color: #2563eb;">${escapeHtml(notesData.complexitySummary.average)}</div>
      </div>
      <div class="grid-box">
        <div class="grid-label">Worst</div>
        <div class="grid-val" style="color: #d97706;">${escapeHtml(notesData.complexitySummary.worst)}</div>
      </div>
      <div class="grid-box">
        <div class="grid-label">Space Aux</div>
        <div class="grid-val" style="color: #7c3aed;">${escapeHtml(notesData.complexitySummary.space)}</div>
      </div>
    </div>

    <h2>5. Pros & Trade-offs</h2>
    <div class="two-col">
      <div class="box">
        <strong style="color: #059669;">Pros & Advantages:</strong>
        <ul style="margin-top: 6px;">${notesData.prosAndCons.pros
          .map((p) => `<li>${escapeHtml(p)}</li>`)
          .join('')}</ul>
      </div>
      <div class="box">
        <strong style="color: #dc2626;">Trade-offs & Cons:</strong>
        <ul style="margin-top: 6px;">${notesData.prosAndCons.cons
          .map((c) => `<li>${escapeHtml(c)}</li>`)
          .join('')}</ul>
      </div>
    </div>

    <h2>6. Real-World Applications</h2>
    <div class="box">
      ${notesData.realWorldApplications
        .map(
          (app) =>
            `<span style="display:inline-block; margin:2px 4px; padding:2px 8px; background:#e2e8f0; border-radius:4px; font-size:10px; font-weight:600;">${escapeHtml(
              app
            )}</span>`
        )
        .join('')}
    </div>

    <h2>7. High-Yield Exam Takeaways</h2>
    <div class="cheat-sheet">
      <strong>⚡ Revision Takeaway:</strong>
      <p style="margin: 4px 0 0 0;">${escapeHtml(notesData.cheatSheetSummary)}</p>
    </div>
  </body>
</html>`;
  };

  const handleCopyMarkdown = () => {
    let traceMd = '';
    if (dryRunData?.steps && dryRunData.steps.length > 0) {
      traceMd = `\n## Python Tutor Step-by-Step Memory Trace\n` +
        dryRunData.steps
          .map(
            (s) =>
              `- Step ${s.stepNumber} (Line ${s.lineNumber}): \`${s.lineContent}\` | Vars: ${
                s.variables ? JSON.stringify(s.variables) : 'None'
              } | ${s.explanation}`
          )
          .join('\n') +
        `\n`;
    }

    const text = `# ${notesData.title}

## Summary
${notesData.summary}
${traceMd}
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
      <div className={`p-4 rounded-2xl border backdrop-blur-md shadow-md flex flex-wrap items-center justify-between gap-4 ${
        isLight ? 'bg-white/80 border-slate-200/80 text-slate-800' : 'bg-[#0e0e10]/80 border-white/10 text-slate-200'
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
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border backdrop-blur-md shadow-sm ${
              isLight
                ? 'bg-white/80 border-slate-300 text-slate-800 hover:bg-slate-100'
                : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
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
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border backdrop-blur-md shadow-sm ${
              isLight
                ? 'bg-white/80 border-slate-300 text-slate-800 hover:bg-slate-100'
                : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
            }`}
            title="Open Clean Light Mode Print Sheet"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
            <span>Preview Sheet</span>
          </button>

          {/* Download HTML */}
          <button
            onClick={handleDownloadHtml}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border backdrop-blur-md shadow-sm ${
              isLight
                ? 'bg-white/80 border-slate-300 text-slate-800 hover:bg-slate-100'
                : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
            }`}
            title="Download printable HTML file for offline saving/printing"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Save HTML</span>
          </button>

          {/* Primary Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 border border-indigo-400/30 backdrop-blur-md transition-all"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Printable Notes Container */}
      <div className={`printable-notes p-6 rounded-2xl border space-y-6 shadow-md backdrop-blur-md ${
        isLight
          ? 'bg-white/80 border-slate-200/80 text-slate-800'
          : 'bg-[#0e0e10]/80 border-white/10 text-slate-300'
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

        {/* Python Tutor & Execution Trace Steps */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center space-x-2">
              <MonitorPlay className="w-4 h-4 text-cyan-500 dark:text-cyan-400 animate-pulse" />
              <span>2. Python Tutor Memory & Execution Trace Steps</span>
            </h4>
            {directTutorUrl && (
              <a
                href={directTutorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-md transition-all shadow-sm ${
                  isLight
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100'
                    : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'
                }`}
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open Interactive Python Tutor</span>
              </a>
            )}
          </div>

          {dryRunData && dryRunData.steps && dryRunData.steps.length > 0 ? (
            <div className="space-y-2">
              <div className={`overflow-x-auto rounded-xl border shadow-sm ${
                isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-black/40'
              }`}>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                      isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-white/5 text-slate-300 border-white/10'
                    }`}>
                      <th className="p-2.5 w-12 text-center">Step</th>
                      <th className="p-2.5 w-16 text-center">Line</th>
                      <th className="p-2.5">Executed Code</th>
                      <th className="p-2.5">Variable Memory State</th>
                      <th className="p-2.5">Trace Explanation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/5 font-mono text-[11px]">
                    {dryRunData.steps.map((step) => (
                      <tr
                        key={step.stepNumber}
                        className={`transition-colors ${
                          isLight ? 'hover:bg-indigo-50/50' : 'hover:bg-white/5'
                        }`}
                      >
                        <td className="p-2.5 text-center font-bold text-indigo-600 dark:text-cyan-400">
                          #{step.stepNumber}
                        </td>
                        <td className="p-2.5 text-center text-slate-500">
                          L{step.lineNumber}
                        </td>
                        <td className="p-2.5">
                          <code className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            isLight ? 'bg-slate-100 text-indigo-950 border border-slate-200' : 'bg-white/10 text-cyan-200 border border-white/10'
                          }`}>
                            {step.lineContent}
                          </code>
                        </td>
                        <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                          {step.variables && Object.keys(step.variables).length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(step.variables).map(([k, v]) => (
                                <span
                                  key={k}
                                  className={`px-2 py-0.5 rounded-full text-[10px] border font-mono ${
                                    isLight
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                      : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                                  }`}
                                >
                                  {k} = {JSON.stringify(v)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[10px] italic">No var changes</span>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-700 dark:text-slate-300 font-sans text-xs leading-normal">
                          {step.explanation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {dryRunData.finalOutput && (
                <div className={`p-3 rounded-xl border text-xs font-mono flex items-center space-x-2.5 ${
                  isLight
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                }`}>
                  <span className="font-bold uppercase tracking-wider text-[10px] px-2.5 py-0.5 bg-emerald-600 text-white rounded-full">
                    Final Output
                  </span>
                  <span>{dryRunData.finalOutput}</span>
                </div>
              )}
            </div>
          ) : (
            <div className={`p-4 rounded-xl border text-xs italic ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-black/30 border-white/5 text-slate-400'
            }`}>
              Python Tutor execution steps are being analyzed or fallback to high-level algorithm logic below.
            </div>
          )}
        </div>

        {/* Algorithm Steps */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center space-x-2">
            <FileText className="w-3.5 h-3.5" />
            <span>3. Step-by-Step Execution Logic</span>
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
            <span>4. Complexity Bounds</span>
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
            5. Real-World Applications & Use Cases
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
                  className="px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={handleDownloadHtml}
                  className="px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Save File</span>
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body - Paper Document */}
            <div className="p-8 overflow-y-auto space-y-6 text-xs bg-white text-slate-900 leading-relaxed">
              <div className="border-b-2 border-indigo-600 pb-3">
                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-full uppercase">
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

              {/* Python Tutor Trace Table in Modal */}
              {dryRunData && dryRunData.steps && dryRunData.steps.length > 0 && (
                <div>
                  <h3 className="font-bold text-indigo-600 text-xs uppercase mb-1">
                    2. Python Tutor Memory & Variable Trace
                  </h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-[11px]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-indigo-50 border-b border-indigo-100 text-[10px] font-bold uppercase text-indigo-900">
                          <th className="p-2 w-10 text-center">Step</th>
                          <th className="p-2 w-12 text-center">Line</th>
                          <th className="p-2">Code</th>
                          <th className="p-2">Variables</th>
                          <th className="p-2">Explanation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono">
                        {dryRunData.steps.map((step) => (
                          <tr key={step.stepNumber} className="hover:bg-slate-50">
                            <td className="p-2 text-center font-bold text-indigo-600">#{step.stepNumber}</td>
                            <td className="p-2 text-center text-slate-500">L{step.lineNumber}</td>
                            <td className="p-2 font-semibold text-indigo-900">{step.lineContent}</td>
                            <td className="p-2 text-emerald-700 font-semibold">
                              {step.variables ? JSON.stringify(step.variables) : 'None'}
                            </td>
                            <td className="p-2 text-slate-700 font-sans text-[11px]">{step.explanation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-bold text-indigo-600 text-xs uppercase mb-1">
                  3. Step-by-Step Logic
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
                  4. Complexity Bounds
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


