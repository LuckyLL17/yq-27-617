import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LearningProgress } from '@/types';
import { learningPaths } from '@/data/learningPaths';

interface LearningPathState {
  activePathId: string | null;
  progress: Record<string, LearningProgress>;

  startPath: (pathId: string) => void;
  completeStep: (pathId: string, stepId: string) => void;
  setCurrentStep: (pathId: string, stepId: string, phaseId: string) => void;
  resetPath: (pathId: string) => void;
  getPathProgress: (pathId: string) => number;
  getPhaseProgress: (pathId: string, phaseId: string) => number;
  getCurrentStep: (pathId: string) => { phaseId: string; stepId: string } | null;
  getNextStep: (pathId: string) => { phaseId: string; stepId: string } | null;
}

export const useLearningPathStore = create<LearningPathState>()(
  persist(
    (set, get) => ({
      activePathId: null,
      progress: {},

      startPath: (pathId) => {
        const path = learningPaths.find(p => p.id === pathId);
        if (!path || path.phases.length === 0) return;

        const firstPhase = path.phases[0];
        const firstStep = firstPhase.steps[0];

        set((state) => ({
          activePathId: pathId,
          progress: {
            ...state.progress,
            [pathId]: {
              currentStepId: firstStep.id,
              currentPhaseId: firstPhase.id,
              completedStepIds: [],
              completedPhaseIds: [],
              startedAt: Date.now(),
              lastStudiedAt: Date.now(),
            },
          },
        }));
      },

      completeStep: (pathId, stepId) => {
        const path = learningPaths.find(p => p.id === pathId);
        if (!path) return;

        set((state) => {
          const currentProgress = state.progress[pathId] || {
            currentStepId: null,
            currentPhaseId: null,
            completedStepIds: [],
            completedPhaseIds: [],
            startedAt: null,
            lastStudiedAt: null,
          };

          if (currentProgress.completedStepIds.includes(stepId)) {
            return state;
          }

          const newCompletedStepIds = [...currentProgress.completedStepIds, stepId];

          let currentPhaseId = currentProgress.currentPhaseId;
          let newCompletedPhaseIds = [...currentProgress.completedPhaseIds];

          if (currentPhaseId) {
            const currentPhase = path.phases.find(p => p.id === currentPhaseId);
            if (currentPhase) {
              const phaseStepIds = currentPhase.steps.map(s => s.id);
              const allPhaseStepsCompleted = phaseStepIds.every(id =>
                newCompletedStepIds.includes(id) || id === stepId
              );
              if (allPhaseStepsCompleted && !newCompletedPhaseIds.includes(currentPhaseId)) {
                newCompletedPhaseIds.push(currentPhaseId);
              }
            }
          }

          let nextStepInfo: { phaseId: string; stepId: string } | null = null;
          let foundCurrent = false;

          for (const phase of path.phases) {
            for (const step of phase.steps) {
              if (foundCurrent) {
                nextStepInfo = { phaseId: phase.id, stepId: step.id };
                break;
              }
              if (step.id === stepId) {
                foundCurrent = true;
              }
            }
            if (nextStepInfo) break;
          }

          return {
            progress: {
              ...state.progress,
              [pathId]: {
                ...currentProgress,
                completedStepIds: newCompletedStepIds,
                completedPhaseIds: newCompletedPhaseIds,
                currentStepId: nextStepInfo?.stepId || currentProgress.currentStepId,
                currentPhaseId: nextStepInfo?.phaseId || currentProgress.currentPhaseId,
                lastStudiedAt: Date.now(),
              },
            },
          };
        });
      },

      setCurrentStep: (pathId, stepId, phaseId) => {
        set((state) => {
          const currentProgress = state.progress[pathId] || {
            currentStepId: null,
            currentPhaseId: null,
            completedStepIds: [],
            completedPhaseIds: [],
            startedAt: null,
            lastStudiedAt: null,
          };

          return {
            progress: {
              ...state.progress,
              [pathId]: {
                ...currentProgress,
                currentStepId: stepId,
                currentPhaseId: phaseId,
                lastStudiedAt: Date.now(),
                startedAt: currentProgress.startedAt || Date.now(),
              },
            },
          };
        });
      },

      resetPath: (pathId) => {
        set((state) => {
          const newProgress = { ...state.progress };
          delete newProgress[pathId];
          return {
            progress: newProgress,
            activePathId: state.activePathId === pathId ? null : state.activePathId,
          };
        });
      },

      getPathProgress: (pathId) => {
        const path = learningPaths.find(p => p.id === pathId);
        if (!path) return 0;

        const progress = get().progress[pathId];
        if (!progress) return 0;

        const totalSteps = path.phases.reduce((sum, phase) => sum + phase.steps.length, 0);
        const completedSteps = progress.completedStepIds.length;

        return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
      },

      getPhaseProgress: (pathId, phaseId) => {
        const path = learningPaths.find(p => p.id === pathId);
        if (!path) return 0;

        const phase = path.phases.find(p => p.id === phaseId);
        if (!phase) return 0;

        const progress = get().progress[pathId];
        if (!progress) return 0;

        const totalSteps = phase.steps.length;
        const completedSteps = phase.steps.filter(s =>
          progress.completedStepIds.includes(s.id)
        ).length;

        return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
      },

      getCurrentStep: (pathId) => {
        const progress = get().progress[pathId];
        if (!progress || !progress.currentStepId || !progress.currentPhaseId) {
          return null;
        }
        return {
          phaseId: progress.currentPhaseId,
          stepId: progress.currentStepId,
        };
      },

      getNextStep: (pathId) => {
        const path = learningPaths.find(p => p.id === pathId);
        if (!path) return null;

        const progress = get().progress[pathId];
        if (!progress || !progress.currentStepId) return null;

        let foundCurrent = false;

        for (const phase of path.phases) {
          for (const step of phase.steps) {
            if (foundCurrent) {
              return { phaseId: phase.id, stepId: step.id };
            }
            if (step.id === progress.currentStepId) {
              foundCurrent = true;
            }
          }
        }

        return null;
      },
    }),
    {
      name: 'learning-path-store',
    }
  )
);
