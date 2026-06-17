export type Difficulty = 'easy' | 'medium' | 'hard';

export type Severity = 'high' | 'medium' | 'low';

export type ExamStatus = 'idle' | 'configuring' | 'ongoing' | 'finished';

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  questionCount: number;
  color: string;
}

export interface CodeExample {
  language: string;
  code: string;
}

export interface Pitfall {
  title: string;
  description: string;
  severity: Severity;
}

export interface Question {
  id: string;
  title: string;
  categoryId: string;
  difficulty: Difficulty;
  content: string;
  standardSolution: string;
  pitfalls: Pitfall[];
  codeExamples: CodeExample[];
  relatedQuestionIds: string[];
  isHot: boolean;
}

export interface ExamConfig {
  categoryIds: string[];
  difficulty: Difficulty | 'all';
  questionCount: number;
  duration: number;
}

export interface ScoreDetail {
  totalScore: number;
  keywordScore: number;
  structureScore: number;
  depthScore: number;
  completenessScore: number;
  matchedKeywords: string[];
  missedKeywords: string[];
  level: 'excellent' | 'good' | 'pass' | 'fail';
}

export interface ExamQuestion {
  question: Question;
  userAnswer: string;
  isAnswered: boolean;
  isMarked: boolean;
  scoreDetail?: ScoreDetail;
}

export interface ExamResult {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  score: number;
  timeSpent: number;
  answers: ExamQuestion[];
}

export interface ExamHistoryRecord {
  id: string;
  timestamp: number;
  categoryIds: string[];
  categoryNames: string[];
  difficulty: Difficulty | 'all';
  questionCount: number;
  duration: number;
  score: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  timeSpent: number;
}

export interface LearningStep {
  id: string;
  title: string;
  description: string;
  type: 'question' | 'exam' | 'category';
  targetId: string;
  durationMinutes: number;
}

export interface LearningPhase {
  id: string;
  title: string;
  description: string;
  steps: LearningStep[];
}

export interface LearningPath {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  estimatedDays: number;
  totalQuestions: number;
  phases: LearningPhase[];
}

export interface LearningProgress {
  currentStepId: string | null;
  currentPhaseId: string | null;
  completedStepIds: string[];
  completedPhaseIds: string[];
  startedAt: number | null;
  lastStudiedAt: number | null;
}

/** 支持的编程语言 */
export type SupportedLanguage = 'javascript' | 'python';

/** 代码执行结果 */
export interface ExecutionResult {
  /** 标准输出 */
  stdout: string;
  /** 错误输出 */
  stderr: string;
  /** 执行是否成功 */
  success: boolean;
  /** 执行耗时（毫秒） */
  duration: number;
}

/** 保存的代码片段 */
export interface CodeSnippet {
  /** 唯一标识 */
  id: string;
  /** 代码标题 */
  title: string;
  /** 编程语言 */
  language: SupportedLanguage;
  /** 代码内容 */
  code: string;
  /** 创建时间戳 */
  createdAt: number;
  /** 最后更新时间戳 */
  updatedAt: number;
}

/** 代码编辑器配置 */
export interface EditorConfig {
  /** 字体大小 */
  fontSize: number;
  /** 是否显示行号 */
  showLineNumbers: boolean;
  /** 是否自动换行 */
  wordWrap: boolean;
}
