# 🔬 CodeXray AI — Intelligent Code Visualizer & Exam Prep Studio

[![Live Demo](https://img.shields.io/badge/Live_Demo-CodeXray_AI-6366F1?style=for-the-badge&logo=google-chrome&logoColor=white)](https://codexray-yxmt.onrender.com/)
[![GitHub](https://img.shields.io/badge/GitHub-CodeXray-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/thrishalyeggoni-hue/CodeXray)
[![Tech Stack](https://img.shields.io/badge/Stack-React_18_|_TypeScript_|_Tailwind_|_Express_|_Gemini-0EA5E9?style=for-the-badge)](https://github.com/thrishalyeggoni-hue/CodeXray)
[![License: MIT](https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **Transforming cryptic source code into line-by-line visual X-rays, interactive memory stack traces, instant exam revision cheat sheets, and adaptive AI mock interviews.**

---

## 🎯 Problem Statement

When learning computer science and algorithms, **copying code is easy — but understanding execution logic is hard**. 

1. **The "Black Box" Execution Gap:** Standard IDEs execute code in milliseconds or require multi-step debugger configurations (breakpoints, call stacks, watch variables) that overwhelm beginners.
2. **Lack of Visual Memory Models:** Concepts like pointer manipulation (e.g., Two-Pointers, Sliding Window), recursion stack frames, and array mutations are difficult to visualize purely from text descriptions.
3. **Time-Consuming Revision Preparation:** Before computer science exams or technical coding interviews, students spend hours manually writing cheat sheets, Big-O tables, and tracing sample inputs on paper.

---

## 💡 Solution & Hackathon Vision

**CodeXray AI** is an intelligent visual studio designed to illuminate code execution. Instead of just returning a static AI text explanation, CodeXray AI parses code into **interactive visual frames**, **line-by-line execution matrices**, **memory pointer state diagrams**, and **exportable printable exam cheat sheets**.

It provides instant visual clarity for **Python, JavaScript, TypeScript, C++, Java, and Go**.

---

## 🌐 Live Demo

- 🚀 **Live Production Application:** [https://codexray-yxmt.onrender.com/](https://codexray-yxmt.onrender.com/)

---

## 📸 Visual UI Architecture & Interface Mockups

CodeXray AI features a sleek, high-contrast dark/light studio interface designed for long study sessions and high visual legibility.

### 1. Main Studio & Code X-Ray Interface
```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🔬 CodeXray AI Studio  [Python 3.10 ▼] [Theme 🌙] [Examples ▼]                         [Back to Studio]│
├──────────────────────────────────────────┬─────────────────────────────────────────────────────────────┤
│ 📝 Code Editor                           │ 🔍 Visual Line-by-Line X-Ray Analysis                       │
│ 1: def binary_search(arr, target):       │ ┌─────────────────────────────────────────────────────────┐ │
│ 2:   low, high = 0, len(arr) - 1         │ │ Line 2 Executed: low = 0, high = 5                        │ │
│ 3:   while low <= high:                  │ │ ➔ Active Variables: arr=[2, 5, 8, 12, 16], target=12      │ │
│ 4:     mid = (low + high) // 2           │ └─────────────────────────────────────────────────────────┘ │
│ 5:     if arr[mid] == target:            │ 📊 Execution State:                                         │
│ 6:       return mid                      │ • Iteration 1: mid=2 (val=8)  ➔ target > 8, low shifts to 3 │
│ 7:   return -1                           │ • Iteration 2: mid=4 (val=16) ➔ target < 16, high shifts 3 │
│                                          │ • Iteration 3: mid=3 (val=12) ➔ MATCH FOUND at Index 3!    │
├──────────────────────────────────────────┴─────────────────────────────────────────────────────────────┤
│ 🛠️ Tools: [Line-by-Line] [Python Tutor Trace] [Dry Run] [AI Explainer] [Exam Notes] [Quiz] [Interview]│
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2. Python Tutor Memory Stack & Heap Pointer Visualizer
```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🧠 Stack Frames & Heap Memory Tracer                                                                  │
├──────────────────────────────────────────┬─────────────────────────────────────────────────────────────┤
│ 📦 Call Stack Frames                     │ 💾 Heap Memory & Pointer Diagram                            │
│ ┌──────────────────────────────────────┐ │ ┌─────────────────────────────────────────────────────────┐ │
│ │ Global Frame                         │ │ │ Array Index:  [ 0 ]   [ 1 ]   [ 2 ]   [ 3 ]   [ 4 ]     │ │
│ │   arr  ────────────────────────────┼─┼─┼─► Array Values: [  2  ] [  5  ] [  8  ] [ 12  ] [ 16  ]    │ │
│ │   target ➔ 12                        │ │ └─────────────────────────────────────────────────────────┘ │
│ ├──────────────────────────────────────┤ │                     ▲               ▲                       │
│ │ binary_search(arr, target)           │ │                    low             high                     │
│ │   low  ➔ 3                           │ │                    (3)              (4)                     │
│ │   high ➔ 3                           │ │                            ▲                                │
│ │   mid  ➔ 3                           │ │                           mid                               │
│ └──────────────────────────────────────┘ │                           (3)                               │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 In-Depth Feature List (Point-by-Point)

Here is everything a student or developer can do using **CodeXray AI**:

### 1. 🧠 Python Tutor Memory Trace (2-Line Highlight)
> **Python Tutor Trace visualizes execution step-by-step by rendering call stack frames, variable scopes, and heap memory pointers in real-time.**
> **It helps students instantly grasp pointer shifts, array mutations, and recursion call stack depth across Python, Java, C++, JavaScript, and Go.**

### 2. 🤖 ChatGPT & Gemini Code Explainer
- **Generate Step-by-Step Logic Walkthroughs:** Click a button to get a full line-by-line explanation of how your code executes from start to finish.
- **Interactive AI Chat:** Ask follow-up questions like *"Explain line 4"*, *"How to handle empty arrays?"*, or *"Optimize this loop"*.
- **One-Click Code Transfer:** Click **"Load in Studio Editor"** on any code block generated in the AI chat to paste it directly into your Monaco Editor workspace.

### 3. 🌓 Visually Appealing Light & Dark Studio Modes
- **Seamless Theme Switcher:** Toggle between a high-contrast dark twilight studio theme (ideal for night study sessions) and a crisp glassmorphism light theme.
- **Eye-Safe Reading & Legibility:** Carefully calibrated color ratios pass WCAG AA contrast standards for effortless long-term reading.

### 4. 🖨️ Downloadable & Printable Exam Notes Cheat Sheet
- **Instant Revision Generator:** Creates an instant exam cheat sheet containing Big-O time/space complexity matrices, code walk-throughs, and key algorithmic takeaways.
- **Print & PDF Export:** Click **"Print / Export PDF Notes"** to print or save a clean, professional PDF study document formatted specifically for exams.

### 5. 📐 Interactive Resizable Window Workspace & Font Controls
- **Drag-to-Resize Panel Splitter:** Click and drag the vertical divider bar between the Code Editor and Visualizer panels to adjust panel widths in real-time.
- **Quick Split Presets:** Jump instantly between preset layout ratios (`30/70`, `40/60`, `50/50`, `60/40`, `70/30`).
- **Editor Font Size Adjuster:** Scale code font size up or down (`11px` to `22px`) with a single click.
- **Adjustable Chat Window Height:** Toggle ChatGPT window height between `Normal (400px)`, `Tall (600px)`, and `Expanded (800px)`.

### 6. ⚡ Interactive Memory Dry-Run Simulator
- **Step-by-Step Media Player:** Step forward and backward through execution using `[⏮ Step Back]`, `[⏯ Play/Pause]`, `[⏭ Step Forward]`, and `[🔄 Reset]`.
- **Live Monaco Line Highlighting:** The code editor automatically scrolls and highlights the active line being executed during dry runs.
- **Simulated Terminal & Variable Table:** Live tracking of variable changes and standard output streams.

### 7. 🎯 AI Diagnostic Self-Quizzes & Technical Interview Prep
- **Interactive Multiple-Choice Quizzes:** Test your understanding with auto-generated questions tailored to your exact code snippet.
- **Mock Technical Interview Prompts:** Practice answering tricky edge-case interview questions with sample answer breakdowns.

### 8. 📜 Saved Code Snippet History & Preset Library
- **Pre-loaded Algorithm Library:** Select standard interview algorithms (Binary Search, Two Sum, QuickSort, MergeSort, Merge Intervals, Linked List Reversal, Fibonacci) across 8+ languages.
- **Local History Tracker:** Automatically saves past code analyses so you can reload any previous snippet with a single click.

---

## 🏗️ System Architecture & Data Flow

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│                             USER BROWSER / CLIENT                              │
│                                                                                │
│  ┌─────────────────────────┐    ┌──────────────────┐    ┌───────────────────┐  │
│  │   Monaco/Code Editor    │    │ React Studio UI  │    │  Framer Motion    │  │
│  └────────────┬────────────┘    └────────┬─────────┘    └─────────┬─────────┘  │
└───────────────┼──────────────────────────┼────────────────────────┼────────────┘
                │                          │                        │
                │ REST API Requests        │ State Management       │ UI Render
                ▼                          ▼                        ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                            EXPRESS.JS SERVER (PORT 3000)                       │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                      API Gateway & Middleware Routing                    │  │
│  └────────────────────────────────────┬─────────────────────────────────────┘  │
│                                       │                                        │
│          ┌────────────────────────────┴──────────────────────────┐             │
│          ▼                                                       ▼             │
│  ┌─────────────────────────────────┐           ┌────────────────────────────┐  │
│  │   Gemini Multi-Model AI Router  │           │ Local Rule-Based Analytical│  │
│  │   - gemini-3.6-flash            │           │ Engine (Fallback Pipeline) │  │
│  │   - gemini-3.1-pro-preview      │           │ - Syntax Parser            │  │
│  │   - gemini-flash-latest         │           │ - Memory State Tracer      │  │
│  │   - gemini-3.1-flash-lite       │           │ - Static Complexity Matrix │  │
│  └────────────────┬────────────────┘           └──────────────┬─────────────┘  │
└───────────────────┼───────────────────────────────────────────┼────────────────┘
                    │                                           │
                    ▼                                           ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                          STRUCTURED JSON RESPONSE                              │
│  (Line-by-Line Traces, Memory Frames, Cheat Sheets, Quizzes, LaTeX Cleaned)    │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Usage & Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18 & TypeScript** | Component-driven UI architecture with full type safety |
| **Styling & Motion** | **Tailwind CSS & Framer Motion** | Glassmorphism studio themes, responsive grids, fluid animations |
| **Iconography** | **Lucide React** | Consistent studio UI control icons |
| **Backend Runtime** | **Node.js & Express.js** | Server-side API endpoints (`/api/analyze`, `/api/dryrun`, etc.) |
| **Server Bundler** | **esbuild & tsx** | Fast CommonJS server bundling (`dist/server.cjs`) |
| **AI Integration** | **Google Gemini API (`@google/genai`)** | Multi-model intelligent analysis & quiz generation |
| **Build System** | **Vite** | Fast frontend development and production asset bundling |

---

## 📁 Project Directory Structure

```text
.
├── README.md                  # Hackathon product documentation & architecture guide
├── server.ts                  # Express server, Gemini AI integration & fallback router
├── index.html                 # HTML entry point with viewport configuration
├── metadata.json              # Applet configuration metadata
├── package.json               # Dependencies, build scripts & server launcher
├── tsconfig.json              # TypeScript compilation settings
├── vite.config.ts             # Vite configuration with Tailwind CSS support
└── src/
    ├── main.tsx               # React DOM root entry point
    ├── App.tsx                # Main container shell & global state manager
    ├── index.css              # Tailwind imports & custom scrollbar styles
    ├── types.ts               # Global TypeScript definitions & data interfaces
    └── components/            # Studio components
        ├── Dashboard.tsx      # Core studio interface with tab navigation
        ├── CodeEditor.tsx     # Syntax-highlighted code editor with language selector
        ├── LineByLineView.tsx # Visual execution path & line-by-line analyzer
        ├── PythonTutorView.tsx# Call stack frames & heap memory pointer tracer
        ├── DryRunView.tsx     # Interactive step-by-step memory simulator
        ├── NotesView.tsx      # Exam cheat sheet generator & printable PDF exporter
        ├── QuizView.tsx       # AI diagnostic comprehension quiz generator
        ├── InterviewPrepView.tsx # Edge-case technical interview prompt simulator
        ├── CodeHistoryView.tsx# Saved snippet history & one-click editor loader
        └── Header.tsx         # Studio header bar with theme toggle & language dropdown
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** installed on your system.
- An optional **Google Gemini API key** (rule-based fallback engines guarantee full studio functionality even without an API key).

### Local Installation & Running

1. **Clone the repository:**
   ```bash
   git clone https://github.com/thrishalyeggoni-hue/CodeXray.git
   cd CodeXray
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (or use `.env.example`):
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

5. **Build and Launch Production Server:**
   ```bash
   npm run build
   npm start
   ```

---

## 🔮 Future Roadmap & Enhancements

- 🔌 **VS Code & JetBrains Extension:** Bring CodeXray AI line-by-line execution highlights directly into your local IDE editor.
- 🧩 **LeetCode & HackerRank One-Click Import:** Enter any problem URL to fetch its code and automatically construct test case execution traces.
- 📁 **Full Repository AST Parsing:** Extend visualization beyond single files to multi-module class dependencies and module import graphs.
- 👥 **Real-Time Multiplayer Peer Debugging:** Live collaborative study rooms with synchronized step-by-step dry-run pointers.

---

## 👤 Team & Author

**Thrishal Yeggoni**  
*B.Tech Computer Science & Engineering (Cybersecurity)*  
*VNR Vignana Jyothi Institute of Engineering and Technology (VNR VJIET)*  

---

## 🙏 Acknowledgements

- **Google DeepMind & Gemini API** for algorithmic reasoning capabilities.
- **React & Tailwind CSS** for UI design and layout mechanics.
- **Lucide Icons & Framer Motion** for studio controls and smooth visual transitions.

---

## 📄 License

Distributed under the **MIT License**. Created for accessible computer science education, algorithmic visualization, and exam preparation.
