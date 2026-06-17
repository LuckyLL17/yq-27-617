import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ExamConfig, ExamQuestion, ExamResult, ExamStatus, ExamHistoryRecord, ScoreDetail } from '@/types';
import { questions } from '@/data/questions';
import { categories } from '@/data/categories';
import { evaluateAnswerScore } from '@/lib/scoring';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

interface ExamState {
  status: ExamStatus;
  config: ExamConfig | null;
  examQuestions: ExamQuestion[];
  currentIndex: number;
  startTime: number | null;
  remainingTime: number;
  result: ExamResult | null;
  history: ExamHistoryRecord[];

  setConfig: (config: ExamConfig) => void;
  startExam: () => void;
  setCurrentIndex: (index: number) => void;
  setUserAnswer: (answer: string) => void;
  toggleMark: () => void;
  submitExam: () => void;
  resetExam: () => void;
  tick: () => void;
  clearHistory: () => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      config: null,
      examQuestions: [],
      currentIndex: 0,
      startTime: null,
      remainingTime: 0,
      result: null,
      history: [],

      setConfig: (config) => {
        set({ config, status: 'configuring' });
      },

      startExam: () => {
        const { config } = get();
        if (!config || config.categoryIds.length === 0) return;

        let filtered = questions.filter(q => config.categoryIds.includes(q.categoryId));

        if (config.difficulty !== 'all') {
          filtered = filtered.filter(q => q.difficulty === config.difficulty);
        }

        const shuffled = shuffleArray(filtered);
        const selected = shuffled.slice(0, Math.min(config.questionCount, shuffled.length));

        const examQuestions: ExamQuestion[] = selected.map(q => ({
          question: q,
          userAnswer: '',
          isAnswered: false,
          isMarked: false,
        }));

        set({
          status: 'ongoing',
          examQuestions,
          currentIndex: 0,
          startTime: Date.now(),
          remainingTime: config.duration * 60,
          result: null,
        });
      },

      setCurrentIndex: (index) => {
        set({ currentIndex: index });
      },

      setUserAnswer: (answer) => {
        set((state) => {
          const updated = [...state.examQuestions];
          updated[state.currentIndex] = {
            ...updated[state.currentIndex],
            userAnswer: answer,
            isAnswered: answer.trim().length > 0,
          };
          return { examQuestions: updated };
        });
      },

      toggleMark: () => {
        set((state) => {
          const updated = [...state.examQuestions];
          updated[state.currentIndex] = {
            ...updated[state.currentIndex],
            isMarked: !updated[state.currentIndex].isMarked,
          };
          return { examQuestions: updated };
        });
      },

      submitExam: () => {
        const { examQuestions, startTime, config, history } = get();
        if (!startTime || !config) return;

        let correctCount = 0;
        let wrongCount = 0;
        let unansweredCount = 0;
        let totalScore = 0;

        const scoredAnswers: ExamQuestion[] = examQuestions.map((eq) => {
          if (!eq.isAnswered) {
            unansweredCount++;
            return { ...eq };
          }

          const scoreDetail = evaluateAnswerScore(
            eq.userAnswer,
            eq.question.standardSolution,
            eq.question.content
          );

          if (scoreDetail.totalScore >= 60) {
            correctCount++;
          } else {
            wrongCount++;
          }

          totalScore += scoreDetail.totalScore;

          return { ...eq, scoreDetail };
        });

        const timeSpent = config.duration * 60 - get().remainingTime;
        const score = examQuestions.length > 0
          ? Math.round(totalScore / examQuestions.length)
          : 0;

        const result: ExamResult = {
          totalQuestions: examQuestions.length,
          correctCount,
          wrongCount,
          unansweredCount,
          score,
          timeSpent,
          answers: scoredAnswers,
        };

        const categoryNames = config.categoryIds
          .map(id => categories.find(c => c.id === id)?.name || '')
          .filter(Boolean);

        const historyRecord: ExamHistoryRecord = {
          id: generateId(),
          timestamp: Date.now(),
          categoryIds: config.categoryIds,
          categoryNames,
          difficulty: config.difficulty,
          questionCount: examQuestions.length,
          duration: config.duration,
          score,
          correctCount,
          wrongCount,
          unansweredCount,
          timeSpent,
        };

        const newHistory = [historyRecord, ...history].slice(0, 50);

        set({ status: 'finished', result, history: newHistory });
      },

      resetExam: () => {
        set({
          status: 'idle',
          config: null,
          examQuestions: [],
          currentIndex: 0,
          startTime: null,
          remainingTime: 0,
          result: null,
        });
      },

      tick: () => {
        set((state) => {
          if (state.status !== 'ongoing' || state.remainingTime <= 0) {
            return state;
          }
          const newTime = state.remainingTime - 1;
          if (newTime <= 0) {
            const { examQuestions, config, history } = state;
            let correctCount = 0;
            let wrongCount = 0;
            let unansweredCount = 0;
            let totalScore = 0;

            const scoredAnswers: ExamQuestion[] = examQuestions.map((eq) => {
              if (!eq.isAnswered) {
                unansweredCount++;
                return { ...eq };
              }

              const scoreDetail = evaluateAnswerScore(
                eq.userAnswer,
                eq.question.standardSolution,
                eq.question.content
              );

              if (scoreDetail.totalScore >= 60) {
                correctCount++;
              } else {
                wrongCount++;
              }

              totalScore += scoreDetail.totalScore;

              return { ...eq, scoreDetail };
            });

            const timeSpent = config ? config.duration * 60 : 0;
            const score = examQuestions.length > 0
              ? Math.round(totalScore / examQuestions.length)
              : 0;

            const result: ExamResult = {
              totalQuestions: examQuestions.length,
              correctCount,
              wrongCount,
              unansweredCount,
              score,
              timeSpent,
              answers: scoredAnswers,
            };

            const categoryNames = config
              ? config.categoryIds.map(id => categories.find(c => c.id === id)?.name || '').filter(Boolean)
              : [];

            const historyRecord: ExamHistoryRecord = {
              id: generateId(),
              timestamp: Date.now(),
              categoryIds: config?.categoryIds || [],
              categoryNames,
              difficulty: config?.difficulty || 'all',
              questionCount: examQuestions.length,
              duration: config?.duration || 0,
              score,
              correctCount,
              wrongCount,
              unansweredCount,
              timeSpent,
            };

            const newHistory = [historyRecord, ...history].slice(0, 50);

            return { status: 'finished', result, remainingTime: 0, history: newHistory };
          }
          return { remainingTime: newTime };
        });
      },

      clearHistory: () => {
        set({ history: [] });
      },
    }),
    {
      name: 'exam-store',
      partialize: (state) => ({ history: state.history }),
    }
  )
);
