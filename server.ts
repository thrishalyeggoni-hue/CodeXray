import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "2mb" }));

// Initialize Google GenAI lazily
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not configured in process.env. Using fallback generator.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper to extract clean json from response text
function cleanJsonText(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

// Helper to convert markdown table pipe syntax into clean plain-text bullet points
function convertPipeTablesToText(markdown: string): string {
  if (!markdown || typeof markdown !== 'string' || !markdown.includes('|')) return markdown;

  const lines = markdown.split('\n');
  const resultLines: string[] = [];
  let inCodeBlock = false;
  let inTable = false;
  let headers: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      if (inTable) {
        inTable = false;
        headers = [];
      }
      resultLines.push(line);
      continue;
    }

    if (inCodeBlock) {
      resultLines.push(line);
      continue;
    }

    if (trimmed.startsWith('|') && (trimmed.endsWith('|') || trimmed.includes('|'))) {
      const rawCells = trimmed.split('|').map(c => c.trim());
      const cells = rawCells.filter((c, idx, arr) => {
        if ((idx === 0 || idx === arr.length - 1) && c === '') return false;
        return true;
      });

      if (cells.length >= 2) {
        const isSeparator = cells.every(c => /^[:\-\s]+$/.test(c));
        if (isSeparator) {
          inTable = true;
          continue;
        }

        if (!inTable) {
          headers = cells;
          inTable = true;
          continue;
        } else {
          if (headers.length > 0) {
            const formattedCells = cells.map((cell, idx) => {
              const header = headers[idx] || `Step ${idx + 1}`;
              return `**${header}**: ${cell}`;
            }).join('  •  ');
            resultLines.push(`- ${formattedCells}`);
          } else {
            resultLines.push(`- ${cells.join('  •  ')}`);
          }
          continue;
        }
      }
    }

    if (inTable) {
      inTable = false;
      headers = [];
    }
    resultLines.push(line);
  }

  return resultLines.join('\n');
}

// Helper to strip LaTeX math symbols, TeX commands, dollar signs ($...$), and table pipes (|) into clean plain text
function sanitizeLaTeX(str: string): string {
  if (!str || typeof str !== 'string') return str || '';
  const cleanedMath = str
    .replace(/\\le(q)?/g, '<=')
    .replace(/\\ge(q)?/g, '>=')
    .replace(/\\rightarrow/g, '->')
    .replace(/\\leftarrow/g, '<-')
    .replace(/\\times/g, 'x')
    .replace(/\\cdot/g, '*')
    .replace(/\\log/g, 'log')
    .replace(/\\dots|\\ldots/g, '...')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\(mathcal|text|mathbf|rm|mathrm)\{([^}]+)\}/g, '$2')
    .replace(/\$\$([\s\S]*?)\$\$/g, '$1')  // Block math $$ ... $$ -> inner text
    .replace(/\$([^\$\n]+)\$/g, '$1')      // Inline math $ ... $ -> inner text
    .replace(/\$/g, '');                   // Strip any leftover orphan dollar signs

  return convertPipeTablesToText(cleanedMath);
}

function sanitizeObjectStrings<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    return sanitizeLaTeX(data) as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeObjectStrings(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    const result: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      result[key] = sanitizeObjectStrings((data as Record<string, any>)[key]);
    }
    return result as T;
  }
  return data;
}

function logModelFailure(tag: string, model: string, err: any) {
  const msg = err?.message || String(err);
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || err?.status === 429) {
    console.warn(`[${tag}] Model ${model} rate limited (429). Trying fallback...`);
  } else {
    console.warn(`[${tag}] Model ${model} error: ${msg.slice(0, 100)}... Trying fallback...`);
  }
}

// 1. Core Code Analysis API
app.post("/api/analyze", async (req, res) => {
  const { code, language } = req.body || {};
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Code snippet is required." });
  }

  const ai = getGenAI();
  if (!ai) {
    return res.json(generateFallbackAnalysis(code, language));
  }

  const prompt = `Analyze the following ${language || "code"} snippet thoroughly with mathematical precision and return a structured JSON response.

Code snippet:
\`\`\`${language || "text"}
${code}
\`\`\`

CRITICAL MATHEMATICAL ACCURACY RULES:
1. Determine EXACT Big-O Time Complexity (e.g. O(1), O(log N), O(N), O(N log N), O(N^2), O(N^3), O(2^N), O(N!)). Carefully count loop nesting depth, recursive call tree branching, helper method costs (e.g. .sort() is O(N log N), slice/includes inside a loop makes it O(N^2)).
2. Determine EXACT Big-O Space Complexity (e.g. O(1) auxiliary, O(N) memory/stack).
3. Do NOT use LaTeX math dollar signs ($O(N)$ or $\\le$). Use clean plain text Big-O like O(N), O(N^2), O(log N), <=, >=.

Provide:
1. summary: A high-level 2-sentence explanation of what the code does.
2. corePurpose: The primary problem this code solves.
3. lineByLine: An array of objects where each object has:
   - lineNumber: line number (starting at 1)
   - code: exact code on that line
   - explanation: clear explanation of what this line does
   - variableChanges: optional string describing variables mutated or initialized on this line
4. timeComplexity: Big-O time complexity notation (e.g. O(N), O(N^2), O(log N)).
5. spaceComplexity: Big-O space complexity notation (e.g. O(1), O(N)).
6. complexityReasoning: 2-3 sentences explaining why it has this time and space complexity based on loop nestings, branching, and memory allocations.
7. optimizations: array of 2-3 specific optimization suggestions or alternative data structures.
8. beginnerAnalogy: A creative, relatable real-world ELI5 (Explain Like I'm 5) analogy.
9. interviewQuestions: array of 3 key questions an interviewer might ask about this implementation.
10. commonMistakes: array of 2-3 common bugs or anti-patterns beginners make with this code.
11. keyConcepts: array of 3-5 computer science or language concepts used (e.g. Recursion, Hash Map, Binary Search).`;

  const config = {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        corePurpose: { type: Type.STRING },
        lineByLine: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              lineNumber: { type: Type.INTEGER },
              code: { type: Type.STRING },
              explanation: { type: Type.STRING },
              variableChanges: { type: Type.STRING },
            },
            required: ["lineNumber", "code", "explanation"],
          },
        },
        timeComplexity: { type: Type.STRING },
        spaceComplexity: { type: Type.STRING },
        complexityReasoning: { type: Type.STRING },
        optimizations: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        beginnerAnalogy: { type: Type.STRING },
        interviewQuestions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        commonMistakes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        keyConcepts: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: [
        "summary",
        "corePurpose",
        "lineByLine",
        "timeComplexity",
        "spaceComplexity",
        "complexityReasoning",
        "optimizations",
        "beginnerAnalogy",
        "interviewQuestions",
        "commonMistakes",
        "keyConcepts",
      ],
    },
  };

  // Multi-model fallback sequence for highest availability
  const modelsToTry = ["gemini-3.6-flash", "gemini-3.1-pro-preview", "gemini-flash-latest", "gemini-3.1-flash-lite"];

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });

      const text = response?.text;
      if (text) {
        const parsed = JSON.parse(cleanJsonText(text));
        return res.json(sanitizeObjectStrings(parsed));
      }
    } catch (err: any) {
      logModelFailure("Gemini Analyze", model, err);
    }
  }

  console.warn("[Gemini API Quota/Rate Limit] Serving rule-based code analysis engine.");
  return res.json(sanitizeObjectStrings(generateFallbackAnalysis(code, language)));
});

// 2. Gemini Conversational AI Chat API
app.post("/api/chat", async (req, res) => {
  const { prompt, code, language, history, enableSearch = true } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required." });
  }

  const ai = getGenAI();

  // Dynamic system date context
  const now = new Date();
  const dateFormatted = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (!ai) {
    return res.json({
      answer: sanitizeLaTeX(getLocalChatAnswer(prompt, dateFormatted, code, language)),
    });
  }

  const systemInstruction = `You are Google Gemini, an expert Computer Science educator and AI Coding Assistant.
Today's Date: ${dateFormatted} (${now.toISOString().split("T")[0]}).

YOUR GOAL: Help the user COMPLETELY AND EFFORTLESSLY understand any code snippet, regardless of the programming language (Python, C++, Java, JavaScript, TypeScript, Go, Rust, C#, SQL, C, Assembly, etc.).

RESPONSE STRUCTURE:
1. 💡 **High-Level Concept & Purpose**: 2-3 sentences explaining what this code does in simple plain English and why it works.
2. 🔄 **Execution Control Flowchart**: Provide a clean ASCII flowchart/diagram showing the program flow step by step (e.g. Start ➔ Setup ➔ Loop/Conditions ➔ Return/End). Use standard text characters (e.g. ┌──┐, │, ▼, ➔, ├─►).
3. 🔍 **Line-by-Line Execution Breakdown**: Walk through key lines or blocks. Explain WHAT each line does, WHY it is necessary, and HOW variables change.
4. 📊 **Key Variables & Memory State**: Clearly list variables, array pointers, or stack states and how they evolve.
5. ⚡ **Time & Space Complexity**: Mathematical Big-O bounds with plain reasoning.
6. 🐛 **Edge Cases & Practical Tips**: List empty inputs, boundary cases, or performance considerations.

CRITICAL FORMATTING RULES:
- Do NOT use LaTeX math symbols, TeX commands, or dollar signs (e.g. write "O(N)", "i = 0", "low <= high", NOT $O(N)$ or $i=0$).
- Do NOT wrap every section in excessive nested boxes. Use clean Markdown typography (headers ###, bullet points, bold text, code blocks).
- Make language-specific details (e.g. pointers in C++, lists vs tuples in Python, memory allocation in Rust) clear to anyone.`;

  // Build content array with multi-turn conversation history
  const contents: any[] = [];
  if (Array.isArray(history) && history.length > 0) {
    history.forEach((h: { sender: string; text: string; codeSnippet?: string }) => {
      const role = h.sender === "user" ? "user" : "model";
      let contentText = h.text;
      if (h.codeSnippet) {
        contentText += `\n\nAttached Code:\n\`\`\`\n${h.codeSnippet}\n\`\`\``;
      }
      contents.push({ role, parts: [{ text: contentText }] });
    });
  }

  let currentText = prompt;
  if (code) {
    currentText = `User query: ${prompt}\n\nAttached Code (${language || "auto"}):\n\`\`\`${language || "text"}\n${code}\n\`\`\``;
  }
  contents.push({ role: "user", parts: [{ text: currentText }] });

  const modelsToTry = ["gemini-3.6-flash", "gemini-3.1-pro-preview", "gemini-flash-latest", "gemini-3.1-flash-lite"];

  // 1. First attempt with search grounding across models
  if (enableSearch) {
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            tools: [{ googleSearch: {} }],
          },
        });
        if (response?.text) {
          return res.json({ answer: sanitizeLaTeX(response.text) });
        }
      } catch (err: any) {
        logModelFailure("Gemini Chat Grounded", model, err);
      }
    }
  }

  // 2. Second attempt without search tools across models
  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: { systemInstruction },
      });
      if (response?.text) {
        return res.json({ answer: sanitizeLaTeX(response.text) });
      }
    } catch (err: any) {
      logModelFailure("Gemini Chat Standard", model, err);
    }
  }

  // 3. Intelligent fallback if Gemini API free quota is temporarily reached (429)
  return res.json({
    answer: sanitizeLaTeX(getLocalChatAnswer(prompt, dateFormatted, code, language)),
  });
});

// 3. Dry Run Simulation Trace API
app.post("/api/dryrun", async (req, res) => {
  const { code, language } = req.body || {};
  if (!code || !code.trim()) {
    return res.status(400).json({ error: "Code snippet is required." });
  }

  const ai = getGenAI();
  if (!ai) {
    return res.json(generateFallbackDryRun(code, language));
  }

  const prompt = `You are a high-precision code execution tracer & dry run engine.
Perform an accurate, step-by-step dry run simulation of executing this ${language || "code"} snippet.
Trace between 8 to 20 key execution steps sequentially from initialization to return/exit.

For EACH step:
1. Identify the EXACT 1-based line number currently executed in the snippet.
2. Provide lineContent (the exact code on that line).
3. Provide a clear, educational explanation of what evaluates or mutates on this line.
4. Provide variables: a JSON key-value map of ALL active local variables in scope at this exact step.
   IMPORTANT for arrays and pointers:
   - If there is an array, formatted as JSON string or array, e.g., "arr": "[2, 5, 8, 12, 16, 23, 38]" or [2, 5, 8, 12, 16].
   - Numerical index variables like "low", "high", "mid", "i", "j", "head", "tail" MUST have integer values so the UI pointer visualizer can animate pointer arrows pointing directly to array indices!
   - Include comparison or condition outcomes where applicable (e.g., "arr[mid] == target" => "8 < 12 (true)").
5. Provide consoleOutput: string ONLY if this specific step printed output to stdout (e.g., System.out.println / console.log / print). Otherwise leave empty or omit.

Code snippet:
\`\`\`${language || "text"}
${code}
\`\`\`

Return valid JSON with:
- totalSteps: total number of execution steps
- finalOutput: concise final return value or terminal output yielded at program completion (e.g. "Returned index 3" or "3")
- steps: array of objects as described above.`;

  const config = {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        totalSteps: { type: Type.INTEGER },
        finalOutput: { type: Type.STRING },
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              stepNumber: { type: Type.INTEGER },
              lineNumber: { type: Type.INTEGER },
              lineContent: { type: Type.STRING },
              explanation: { type: Type.STRING },
              variables: { type: Type.OBJECT },
              consoleOutput: { type: Type.STRING },
            },
            required: ["stepNumber", "lineNumber", "lineContent", "explanation", "variables"],
          },
        },
      },
      required: ["totalSteps", "finalOutput", "steps"],
    },
  };

  const modelsToTry = ["gemini-3.6-flash", "gemini-3.1-pro-preview", "gemini-flash-latest", "gemini-3.1-flash-lite"];

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });

      const text = response?.text;
      if (text) {
        const parsed = JSON.parse(cleanJsonText(text));
        return res.json(sanitizeObjectStrings(parsed));
      }
    } catch (err: any) {
      logModelFailure("Gemini DryRun", model, err);
    }
  }

  console.warn("[Gemini API Quota/Rate Limit] Serving rule-based dry run simulator.");
  return res.json(sanitizeObjectStrings(generateFallbackDryRun(code, language)));
});

// 4. AI Quiz Generator API
app.post("/api/quiz", async (req, res) => {
  const { code, language } = req.body || {};
  if (!code) {
    return res.status(400).json({ error: "Code snippet is required." });
  }

  const ai = getGenAI();
  if (!ai) {
    return res.json(sanitizeObjectStrings(generateFallbackQuiz(code)));
  }

  const prompt = `Generate a 5-question multiple-choice interactive quiz to test comprehension of this ${language || "code"} snippet.
CRITICAL FORMATTING INSTRUCTION: Do NOT use LaTeX math symbols, TeX commands, or dollar signs (e.g. do NOT write $9 - 2 = 7$, $i=0$, $O(N)$, \\le). Write all math as clean plain text.

Code:
\`\`\`
${code}
\`\`\`

Return JSON:
- title: Quiz title
- questions: array of 5 objects:
  - id: 1..5
  - question: clear question text
  - options: array of 4 multiple-choice string options
  - correctAnswerIndex: 0-based index of correct option
  - explanation: thorough explanation why that option is correct`;

  const config = {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
            },
            required: ["id", "question", "options", "correctAnswerIndex", "explanation"],
          },
        },
      },
      required: ["title", "questions"],
    },
  };

  const modelsToTry = ["gemini-3.6-flash", "gemini-3.1-pro-preview", "gemini-flash-latest", "gemini-3.1-flash-lite"];

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });

      const text = response?.text;
      if (text) {
        const parsed = JSON.parse(cleanJsonText(text));
        return res.json(sanitizeObjectStrings(parsed));
      }
    } catch (err: any) {
      logModelFailure("Gemini Quiz", model, err);
    }
  }

  console.warn("[Gemini API Quota/Rate Limit] Serving rule-based quiz generator.");
  return res.json(sanitizeObjectStrings(generateFallbackQuiz(code)));
});

// 5. Interview Preparation API
app.post("/api/interview", async (req, res) => {
  const { code, language } = req.body || {};
  if (!code) {
    return res.status(400).json({ error: "Code snippet is required." });
  }

  const ai = getGenAI();
  if (!ai) {
    return res.json(sanitizeObjectStrings(generateFallbackInterview(code)));
  }

  const prompt = `Generate a set of 5 interview questions (Technical, Behavioral/HR, Follow-up, Edge Cases) based on this ${language || "code"}.
CRITICAL FORMATTING INSTRUCTION: Do NOT use LaTeX math symbols, TeX commands, or dollar signs (e.g. do NOT write $9 - 2 = 7$, $i=0$, $O(N)$, \\le). Write all math as clean plain text.

Code:
\`\`\`
${code}
\`\`\`

Return JSON:
- topic: Main algorithmic topic or concept
- questions: array of objects:
  - id: number
  - category: "Technical" | "HR/Behavioral" | "Follow-up" | "Edge Case"
  - question: realistic interviewer question
  - hints: array of 2 bullet hints
  - sampleAnswer: comprehensive model answer
  - keyPointsToMention: array of 3 key points the candidate should articulate`;

  const config = {
    responseMimeType: "application/json",
  };

  const modelsToTry = ["gemini-3.6-flash", "gemini-3.1-pro-preview", "gemini-flash-latest", "gemini-3.1-flash-lite"];

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });

      const text = response?.text;
      if (text) {
        const parsed = JSON.parse(cleanJsonText(text));
        return res.json(sanitizeObjectStrings(parsed));
      }
    } catch (err: any) {
      logModelFailure("Gemini Interview", model, err);
    }
  }

  console.warn("[Gemini API Quota/Rate Limit] Serving rule-based interview prep module.");
  return res.json(sanitizeObjectStrings(generateFallbackInterview(code)));
});

// 6. Exam Notes Generator API
app.post("/api/notes", async (req, res) => {
  const { code, language } = req.body || {};
  if (!code) {
    return res.status(400).json({ error: "Code snippet is required." });
  }

  const ai = getGenAI();
  if (!ai) {
    return res.json(sanitizeObjectStrings(generateFallbackNotes(code)));
  }

  const prompt = `Generate structured, exam-ready study notes for this ${language || "code"} implementation.
CRITICAL FORMATTING INSTRUCTION: Do NOT use LaTeX math symbols, TeX commands, or dollar signs (e.g. do NOT write $9 - 2 = 7$, $i=0$, $O(N)$, \\le). Write all math expressions, equation steps, and variables as clean plain text or inline code ticks (e.g. "9 - 2 = 7", "i = 0", "O(N)", "<=").

Code:
\`\`\`
${code}
\`\`\`

Return JSON:
- title: Algorithm / Code Topic Title
- summary: 2-sentence formal definition
- algorithmSteps: step-by-step numbered algorithm logic
- prosAndCons: object with pros: string[] and cons: string[]
- complexitySummary: object with best, average, worst, space string properties
- realWorldApplications: string[]
- cheatSheetSummary: 3 bullet high-yield key takeaways for rapid review`;

  const config = {
    responseMimeType: "application/json",
  };

  const modelsToTry = ["gemini-3.6-flash", "gemini-3.1-pro-preview", "gemini-flash-latest", "gemini-3.1-flash-lite"];

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });

      const text = response?.text;
      if (text) {
        const parsed = JSON.parse(cleanJsonText(text));
        return res.json(sanitizeObjectStrings(parsed));
      }
    } catch (err: any) {
      logModelFailure("Gemini Notes", model, err);
    }
  }

  console.warn("[Gemini API Quota/Rate Limit] Serving rule-based exam notes generator.");
  return res.json(sanitizeObjectStrings(generateFallbackNotes(code)));
});

// Helper for static code analysis & mathematical Big-O determination
function computeAccurateComplexity(code: string) {
  const lower = code.toLowerCase();

  // 1. Check for sorting calls
  const containsSort =
    lower.includes('.sort(') ||
    lower.includes('arrays.sort') ||
    lower.includes('collections.sort') ||
    lower.includes('std::sort') ||
    lower.includes('qsort');

  // 2. Count loop depth & logarithmic behavior
  const lines = code.split('\n');
  let maxLoopDepth = 0;
  let currentLoopDepth = 0;
  let isLogarithmic = false;

  for (const l of lines) {
    const trimmed = l.trim().toLowerCase();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*')) continue;

    if (
      trimmed.includes('for ') ||
      trimmed.includes('for(') ||
      trimmed.includes('while ') ||
      trimmed.includes('while(') ||
      trimmed.includes('.foreach') ||
      trimmed.includes('.map(')
    ) {
      currentLoopDepth++;
      if (currentLoopDepth > maxLoopDepth) maxLoopDepth = currentLoopDepth;

      if (
        trimmed.includes('/=') ||
        trimmed.includes('*=') ||
        trimmed.includes('>>=') ||
        trimmed.includes('mid') ||
        trimmed.includes('/ 2') ||
        trimmed.includes('/2')
      ) {
        isLogarithmic = true;
      }
    }

    if (trimmed.includes('}')) {
      if (currentLoopDepth > 0) currentLoopDepth--;
    }
  }

  // 3. Check recursion
  let isRecursive = false;
  let recursiveBranching = false;
  const fnMatch = code.match(
    /(?:function|def|int|void|double|string|const|let)\s+([a-zA-Z0-9_]+)\s*[\(=]/i
  );
  if (fnMatch) {
    const fnName = fnMatch[1];
    if (fnName && fnName.length > 1) {
      const regex = new RegExp(`\\b${fnName}\\b`, 'g');
      const matches = code.match(regex);
      if (matches && matches.length >= 2) {
        isRecursive = true;
        if (matches.length >= 3) {
          recursiveBranching = true;
        }
      }
    }
  }

  let timeComplexity = "O(N)";
  let spaceComplexity = "O(1)";
  let complexityReasoning = "Processes input elements sequentially in a single pass.";

  if (recursiveBranching) {
    timeComplexity = "O(2^N)";
    spaceComplexity = "O(N)";
    complexityReasoning =
      "Binary/multi-branching recursive call tree generates exponential O(2^N) time complexity and recursive call stack depth of O(N).";
  } else if (isRecursive) {
    timeComplexity = isLogarithmic ? "O(log N)" : "O(N)";
    spaceComplexity = "O(N)";
    complexityReasoning = `Linear recursive function with call stack depth allocation proportional to O(N) input depth executing in ${timeComplexity} time.`;
  } else if (containsSort) {
    timeComplexity = "O(N log N)";
    spaceComplexity = "O(N)";
    complexityReasoning =
      "Uses comparison-based sorting requiring O(N log N) average and worst-case time complexity.";
  } else if (maxLoopDepth >= 3) {
    timeComplexity = "O(N^3)";
    spaceComplexity = "O(1)";
    complexityReasoning =
      "Contains 3 deeply nested loop iterations resulting in cubic O(N^3) total operation steps.";
  } else if (maxLoopDepth === 2) {
    timeComplexity = "O(N^2)";
    spaceComplexity = "O(1)";
    complexityReasoning =
      "Contains nested loop structures resulting in quadratic O(N^2) total comparisons.";
  } else if (maxLoopDepth === 1) {
    if (isLogarithmic) {
      timeComplexity = "O(log N)";
      spaceComplexity = "O(1)";
      complexityReasoning =
        "Loop boundary or pointer halves/doubles in each iteration resulting in logarithmic O(log N) execution time.";
    } else {
      timeComplexity = "O(N)";
      spaceComplexity = "O(1)";
      complexityReasoning =
        "Single loop iterates linearly over N elements in O(N) time with O(1) auxiliary space.";
    }
  } else {
    timeComplexity = "O(1)";
    spaceComplexity = "O(1)";
    complexityReasoning =
      "Executes direct sequential instructions with no loops or variable iterations in constant O(1) time.";
  }

  if (
    lower.includes('new array') ||
    lower.includes('new int[') ||
    lower.includes('new map') ||
    lower.includes('new set') ||
    lower.includes('vector<') ||
    lower.includes('.push(') ||
    lower.includes('[]')
  ) {
    if (spaceComplexity === "O(1)" && timeComplexity !== "O(1)") {
      spaceComplexity = "O(N)";
      complexityReasoning += " Data structures allocate additional proportional O(N) auxiliary memory.";
    }
  }

  return { timeComplexity, spaceComplexity, complexityReasoning };
}

// Fallback Generators (so app works seamlessly even without API key or network glitch)
function generateFallbackAnalysis(code: string, language: string) {
  const lines = code.split("\n");
  const lineByLine = lines.map((line, idx) => ({
    lineNumber: idx + 1,
    code: line,
    explanation: line.trim()
      ? `Statement: ${line.trim().slice(0, 60)}`
      : "Blank line for structure.",
    variableChanges: line.includes("=") ? "Mutates scope variable" : undefined,
  }));

  const staticComplexity = computeAccurateComplexity(code);

  return {
    summary: `This ${language || "code"} snippet processes input structures using statement execution and conditional logic.`,
    corePurpose: "Executes an algorithmic task transforming state step by step.",
    lineByLine,
    timeComplexity: staticComplexity.timeComplexity,
    spaceComplexity: staticComplexity.spaceComplexity,
    complexityReasoning: staticComplexity.complexityReasoning,
    optimizations: [
      "Use hash-based sets or maps for O(1) average lookup performance.",
      "Incorporate early break or return statements when target condition is satisfied.",
      "Avoid redundant allocations inside hot loop execution paths.",
    ],
    beginnerAnalogy: "Like reading a step-by-step recipe, updating your counter at each step until complete.",
    interviewQuestions: [
      `What is the exact time complexity of this code and why is it ${staticComplexity.timeComplexity}?`,
      "How would you optimize the memory consumption of this implementation?",
      "What edge cases (e.g. empty inputs, nulls, negative numbers) should be tested?",
    ],
    commonMistakes: [
      "Off-by-one errors at loop boundary conditions.",
      "Unchecked null or undefined variables.",
      "Missing return values or termination checks.",
    ],
    keyConcepts: ["Control Flow", "Algorithmic Complexity", "Variable Scope", "Data Structures"],
  };
}

function generateFallbackDryRun(code: string, language?: string) {
  const rawLines = code.split("\n");
  const validLines: Array<{ lineNumber: number; content: string }> = [];

  rawLines.forEach((l, idx) => {
    const trimmed = l.trim();
    if (trimmed && !trimmed.startsWith("//") && !trimmed.startsWith("/*") && !trimmed.startsWith("*")) {
      validLines.push({ lineNumber: idx + 1, content: trimmed });
    }
  });

  if (validLines.length === 0) {
    validLines.push({ lineNumber: 1, content: code.trim() || "// Execution line" });
  }

  // Extract variables declared in the user's snippet
  const activeVars: Record<string, any> = {};
  
  // Try finding array declarations in code
  const arrayMatch = code.match(/(?:let|const|var|int\[\]|vector<int>)\s+([a-zA-Z0-9_]+)\s*=\s*[\{\[](.*?)[\}\]]/);
  let arrayVar = "arr";
  let arrayElements = [2, 5, 8, 12, 16, 23, 38];
  if (arrayMatch) {
    arrayVar = arrayMatch[1];
    const rawItems = arrayMatch[2].split(",").map((s) => s.trim()).filter(Boolean);
    const parsedNums = rawItems.map((n) => Number(n)).filter((n) => !isNaN(n));
    if (parsedNums.length > 0) {
      arrayElements = parsedNums;
    }
  }
  activeVars[arrayVar] = JSON.stringify(arrayElements);

  // Extract primitive variables e.g. let sum = 0, target = 12
  const varMatches = code.matchAll(/(?:let|const|var|int|double|float)\s+([a-zA-Z0-9_]+)\s*=\s*([^;,\)\}\n]+)/g);
  for (const match of varMatches) {
    const name = match[1];
    const rawVal = match[2].trim();
    if (name && name !== arrayVar && !isNaN(Number(rawVal))) {
      activeVars[name] = Number(rawVal);
    } else if (name && name !== arrayVar) {
      activeVars[name] = rawVal;
    }
  }

  const steps: Array<{
    stepNumber: number;
    lineNumber: number;
    lineContent: string;
    explanation: string;
    variables: Record<string, any>;
    consoleOutput?: string;
  }> = [];

  let stepCount = 1;

  // Step 1: Program entry on line 1
  const line1 = validLines[0];
  steps.push({
    stepNumber: stepCount++,
    lineNumber: line1.lineNumber,
    lineContent: line1.content,
    explanation: `Program entry: Initializing execution frame and scope environment.`,
    variables: { ...activeVars },
  });

  // Step through lines 2..N sequentially
  validLines.forEach((item, idx) => {
    if (idx === 0) return; // already done line 1

    const text = item.content;
    const currentVars = { ...activeVars };

    let explanation = `Executing line ${item.lineNumber}: ${text}`;
    let consoleOutput: string | undefined = undefined;

    if (text.includes("print") || text.includes("console.log") || text.includes("System.out.println")) {
      consoleOutput = `> Printed line output at line ${item.lineNumber}`;
      explanation = `Standard Output: Evaluating print expression and sending output to stdout.`;
    } else if (text.includes("for") || text.includes("while")) {
      explanation = `Loop Header: Checking loop iteration condition on line ${item.lineNumber}.`;
      currentVars["i"] = currentVars["i"] !== undefined ? Number(currentVars["i"]) + 1 : 0;
    } else if (text.includes("if")) {
      explanation = `Conditional Evaluation: Checking branch condition expression on line ${item.lineNumber}.`;
    } else if (text.includes("return")) {
      explanation = `Return Statement: Yielding control and returning result from function on line ${item.lineNumber}.`;
      currentVars["status"] = "TERMINATED";
    } else if (text.includes("=")) {
      explanation = `State Mutation: Assigning variable value on line ${item.lineNumber}.`;
    }

    steps.push({
      stepNumber: stepCount++,
      lineNumber: item.lineNumber,
      lineContent: item.content,
      explanation,
      variables: currentVars,
      consoleOutput,
    });
  });

  const lastLine = validLines[validLines.length - 1] || line1;
  const finalOutputStr = `Finished executing ${validLines.length} statements cleanly.`;

  return {
    totalSteps: steps.length,
    finalOutput: finalOutputStr,
    steps,
  };
}

function generateFallbackQuiz(code: string) {
  return {
    title: "Code Comprehension Self-Test",
    questions: [
      {
        id: 1,
        question: "What is the primary function of loop iteration in this code snippet?",
        options: [
          "To repeat execution until a target condition is met",
          "To allocate additional memory on the heap",
          "To compile the source code into bytecode",
          "To perform asynchronous network calls",
        ],
        correctAnswerIndex: 0,
        explanation: "Loops are used to repeatedly execute a block of code while a specific condition remains true.",
      },
      {
        id: 2,
        question: "What is the worst-case space complexity of this snippet?",
        options: ["O(1)", "O(N)", "O(N²)", "O(log N)"],
        correctAnswerIndex: 0,
        explanation: "Only a fixed set of primitive counter variables are maintained in memory.",
      },
      {
        id: 3,
        question: "How should edge cases like empty inputs be handled in production?",
        options: [
          "With explicit boundary validation at the top of the function",
          "By ignoring them and assuming valid inputs",
          "By increasing CPU priority",
          "By re-compiling the code",
        ],
        correctAnswerIndex: 0,
        explanation: "Input validation protects against unexpected runtime null-pointer or index-out-of-bound crashes.",
      },
      {
        id: 4,
        question: "Which data structure provides O(1) average lookup time if we optimized searching?",
        options: ["Hash Map / Dictionary", "Sorted Array", "Binary Search Tree", "Linked List"],
        correctAnswerIndex: 0,
        explanation: "Hash maps allow key-value access in constant O(1) average time complexity.",
      },
      {
        id: 5,
        question: "Why is variable scoping important in this algorithm?",
        options: [
          "To prevent unintended variable mutation and variable shadowing",
          "To speed up line compilation",
          "To change the color of syntax highlighting",
          "To force garbage collection instantly",
        ],
        correctAnswerIndex: 0,
        explanation: "Proper scope constraints limit variables to where they are needed, reducing side effects.",
      },
    ],
  };
}

function generateFallbackInterview(code: string) {
  return {
    topic: "Core Data Structure & Algorithm Analysis",
    questions: [
      {
        id: 1,
        category: "Technical",
        question: "Walk me through the time complexity analysis of this algorithm.",
        hints: ["Identify loop nesting levels", "Check if problem size divides each step"],
        sampleAnswer: "The algorithm iterates through input elements sequentially. Each step performs constant-time O(1) operations, resulting in an overall O(N) time complexity.",
        keyPointsToMention: ["Linear O(N) traversal", "Constant time O(1) inner ops", "Best vs Worst case behavior"],
      },
      {
        id: 2,
        category: "Edge Case",
        question: "How does your solution perform with duplicate values or empty input arrays?",
        hints: ["Check initialization values", "Verify index bounds"],
        sampleAnswer: "An empty array returns early or safely yields -1/empty. Duplicates are handled according to indexing rules without causing infinite loops.",
        keyPointsToMention: ["Null checks", "Empty collection safety", "Duplicate element stability"],
      },
      {
        id: 3,
        category: "Follow-up",
        question: "How would you scale this to process billions of records that don't fit in RAM?",
        hints: ["External sorting", "MapReduce / Stream processing"],
        sampleAnswer: "We would use external memory chunk sorting or stream processing engines like Apache Spark to process partitions independently.",
        keyPointsToMention: ["Memory mapping", "Distributed chunking", "Disk I/O bottlenecks"],
      },
    ],
  };
}

function generateFallbackNotes(code: string) {
  return {
    title: "Algorithmic Analysis Study Notes",
    summary: "Comprehensive breakdown of key logic, memory constraints, and runtime characteristics for revision.",
    algorithmSteps: [
      "1. Initialize starting pointers or state variables.",
      "2. Iterate over input elements sequentially or recursively.",
      "3. Evaluate decision criteria on each element.",
      "4. Update output state or return result index.",
    ],
    prosAndCons: {
      pros: ["Simple and intuitive to implement", "Minimal auxiliary memory required", "Deterministic runtime"],
      cons: ["May scale linearly on large inputs", "Requires pre-sorted input for log N strategies"],
    },
    complexitySummary: {
      best: "O(1)",
      average: "O(N)",
      worst: "O(N)",
      space: "O(1)",
    },
    realWorldApplications: [
      "Database indexing and query execution plans",
      "In-memory searching and filtering in web applications",
      "Real-time stream data filtering",
    ],
    cheatSheetSummary: "Always validate edge cases (empty inputs, single element, duplicates). Memory overhead is O(1). Easily parallelizable if dataset is split into chunks.",
  };
}

function getLocalChatAnswer(prompt: string, dateFormatted: string, code?: string, language?: string): string {
  const p = prompt.toLowerCase();

  if (p.includes("date") || p.includes("today") || p.includes("time") || p.includes("day")) {
    return `Today's date is **${dateFormatted}**.`;
  }

  if (p.includes("hi") || p.includes("hello") || p.includes("hey") || p.includes("greetings")) {
    return `Hello! I am Google Gemini AI Assistant. How can I assist you with your code, algorithms, memory analysis, or interview preparation today?`;
  }

  if (code && code.trim()) {
    const lines = code.split("\n");
    const langUpper = (language || "code").toUpperCase();
    const staticComplexity = computeAccurateComplexity(code);

    const lineBreakdown = lines
      .slice(0, 18)
      .map((l, idx) => {
        const lineNum = idx + 1;
        const trimmed = l.trim();
        if (!trimmed) return null;
        return `- **Line ${lineNum}** \`${trimmed.slice(0, 55)}\`\n  └─► *Logic*: Executes statement, updating memory state or evaluating conditions.`;
      })
      .filter(Boolean)
      .join("\n");

    return `### 💡 High-Level Concept & Purpose
This ${langUpper} program processes data inputs sequentially, using conditional control flow and variable assignments to compute results step-by-step.

---

### 🔄 Program Execution Control Flowchart
\`\`\`
  [Program Entry / Start]
            │
            ▼
 ┌─────────────────────────────┐
 │ Variable & Memory Setup     │
 └──────────┬──────────────────┘
            │
            ▼
 ┌─────────────────────────────┐
 │ Loop / Branch Condition     │◄───┐
 └──────────┬──────────────────┘    │
            │                       │
            ├─► [Condition Met] ────┘
            │
            ▼
   [Condition Terminated]
            │
            ▼
  [Return Yield / Program Exit]
\`\`\`

---

### 🔍 Step-by-Step Line Breakdown

${lineBreakdown || "- Sequentially executes statements in scope."}

---

### 📊 Key Variables & Memory State
- **Iteration Counters / Pointers**: Tracks loop bounds and active frame state.
- **Data Collections / Values**: Holds input parameters and return values in memory.

---

### ⚡ Time & Space Complexity (Big-O)
- **Time Complexity**: **${staticComplexity.timeComplexity}** — ${staticComplexity.complexityReasoning}
- **Space Complexity**: **${staticComplexity.spaceComplexity}** — Auxiliary stack frames or allocations during runtime.

---

### 🐛 Edge Cases & Best Practices
- **Empty / Null Input**: Always validate collection length before executing loops.
- **Boundary Conditions**: Ensure pointers stay within valid index bounds.

\`\`\`${language || "text"}
${code}
\`\`\`
`;
  }

  return `### Gemini Assistant Response

Regarding your query: **"${prompt}"**

Here is a structured explanation:
1. **Algorithmic Strategy**: Ensure base cases and loop termination invariants are strictly defined.
2. **Memory Overhead**: Prefer constant auxiliary space O(1) unless secondary structures like hash tables are required.
3. **Execution Safety**: Validate input constraints to prevent null pointer or array index exceptions.

Feel free to paste any code snippet into the left editor to perform dry runs, complexity evaluations, or step-by-step memory frame traces!`;
}

// Start server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CodeXray AI server running on http://localhost:${PORT}`);
  });
}

startServer();
