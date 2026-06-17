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
