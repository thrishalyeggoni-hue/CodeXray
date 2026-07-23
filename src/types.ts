export type ProgrammingLanguage =
  | 'java'
  | 'python'
  | 'c'
  | 'cpp'
  | 'javascript'
  | 'typescript'
  | 'sql'
  | 'go'
  | 'rust';

export interface CodeRequest {
  code: string;
  language: ProgrammingLanguage;
}

export interface LineExplanation {
  lineNumber: number;
  code: string;
  explanation: string;
  variableChanges?: string;
}

export interface AnalysisResponse {
  summary: string;
  corePurpose: string;
  lineByLine: LineExplanation[];
  timeComplexity: string;
  spaceComplexity: string;
  complexityReasoning: string;
  optimizations: string[];
  beginnerAnalogy: string;
  interviewQuestions: string[];
  commonMistakes: string[];
  keyConcepts: string[];
}

export interface DryRunStep {
  stepNumber: number;
  lineNumber: number;
  lineContent: string;
  explanation: string;
  variables: Record<string, string | number | boolean | null | string[]>;
  consoleOutput?: string;
}

export interface DryRunResponse {
  totalSteps: number;
  steps: DryRunStep[];
  finalOutput: string;
}

export interface FlowchartResponse {
  mermaidCode: string;
  explanation: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  codeSnippet?: string;
}

export interface QuizResponse {
  title: string;
  questions: QuizQuestion[];
}

export interface InterviewQuestion {
  id: number;
  category: 'Technical' | 'HR/Behavioral' | 'Follow-up' | 'Edge Case';
  question: string;
  hints: string[];
  sampleAnswer: string;
  keyPointsToMention: string[];
}

export interface InterviewResponse {
  topic: string;
  questions: InterviewQuestion[];
}

export interface NotesResponse {
  title: string;
  summary: string;
  algorithmSteps: string[];
  prosAndCons: {
    pros: string[];
    cons: string[];
  };
  complexitySummary: {
    best: string;
    average: string;
    worst: string;
    space: string;
  };
  realWorldApplications: string[];
  cheatSheetSummary: string;
}

export interface SampleCode {
  id: string;
  title: string;
  language: ProgrammingLanguage;
  code: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}
