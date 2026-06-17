import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Calendar,
  Check,
  Play,
  ChevronRight,
  Trophy,
  Target,
} from 'lucide-react';
import { learningPaths } from '@/data/learningPaths';
import { useLearningPathStore } from '@/store/useLearningPathStore';
import { LearningPhase, LearningStep } from '@/types';
import { cn } from '@/lib/utils';
import { LearningPathDetailSkeleton } from '@/components/LearningPathDetailSkeleton';
import { iconMap, stepTypeConfig, type StepType } from '@/config';

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
}

interface PhaseSectionProps {
  pathId: string;
  phase: LearningPhase;
  phaseIndex: number;
  currentStepId: string | null;
  completedStepIds: string[];
  onStepClick: (step: LearningStep) => void;
}

function PhaseSection({ pathId, phase, phaseIndex, currentStepId, completedStepIds, onStepClick }: PhaseSectionProps) {
  const { getPhaseProgress } = useLearningPathStore();
  const progress = getPhaseProgress(pathId, phase.id);
  const isPhaseCompleted = progress === 100;

  return (
    <div className="bg-dark-800/50 border border-dark-700 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
              isPhaseCompleted
                ? "bg-green-500/20 text-green-400"
                : "bg-primary-500/20 text-primary-400"
            )}>
              {isPhaseCompleted ? <Check className="w-6 h-6" /> : phaseIndex + 1}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{phase.title}</h3>
              <p className="text-sm text-dark-400 mt-0.5">{phase.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{progress}%</div>
            <div className="text-xs text-dark-500">{phase.steps.length} 个学习节点</div>
          </div>
        </div>
        <div className="mt-4 h-2 bg-dark-900 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              isPhaseCompleted ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-primary-500 to-cyan-500"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="p-2">
        {phase.steps.map((step, stepIndex) => {
          const isCompleted = completedStepIds.includes(step.id);
          const isCurrent = currentStepId === step.id;

          return (
            <button
              key={step.id}
              onClick={() => onStepClick(step)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left group",
                isCurrent
                  ? "bg-primary-500/10 border border-primary-500/30"
                  : isCompleted
                  ? "hover:bg-dark-700/50"
                  : "hover:bg-dark-700/30"
              )}
            >
              <div className="relative">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                  isCompleted
                    ? "bg-green-500/20 text-green-400"
                    : isCurrent
                    ? "bg-primary-500 text-white"
                    : "bg-dark-700 text-dark-400"
                )}>
                  {isCompleted ? <Check className="w-4 h-4" /> : stepIndex + 1}
                </div>
                {isCurrent && (
                  <div className="absolute inset-0 rounded-full bg-primary-500/30 animate-ping" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md",
                    stepTypeConfig[step.type as StepType].colorClass
                  )}>
                    {(() => {
                      const Icon = stepTypeConfig[step.type as StepType].icon;
                      return <Icon className="w-4 h-4" />;
                    })()}
                    {stepTypeConfig[step.type as StepType].label}
                  </span>
                </div>
                <h4 className={cn(
                  "font-medium transition-colors truncate",
                  isCompleted ? "text-dark-400 line-through" : "text-white group-hover:text-primary-400"
                )}>
                  {step.title}
                </h4>
                <p className="text-sm text-dark-500 mt-0.5 truncate">{step.description}</p>
              </div>

              <div className="flex items-center gap-3 text-dark-500">
                <span className="text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(step.durationMinutes)}
                </span>
                {isCurrent ? (
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm font-medium">
                    <Play className="w-4 h-4 fill-current" />
                    学习中
                  </div>
                ) : (
                  <ChevronRight className={cn(
                    "w-5 h-5 transition-transform group-hover:translate-x-0.5",
                    isCompleted ? "text-dark-600" : "text-dark-400"
                  )} />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function LearningPathDetail() {
  const { pathId } = useParams<{ pathId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const path = learningPaths.find(p => p.id === pathId);
  const { getPathProgress, startPath, getCurrentStep, completeStep, setCurrentStep } = useLearningPathStore();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [pathId]);

  if (!path) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-white mb-2">学习路线不存在</h2>
          <button
            onClick={() => navigate('/learning-paths')}
            className="text-primary-400 hover:text-primary-300"
          >
            返回学习路线列表
          </button>
        </div>
      </div>
    );
  }

  const progress = getPathProgress(path.id);
  const currentStepInfo = getCurrentStep(path.id);
  const progressData = useLearningPathStore(state => state.progress[path.id]);

  const currentStepId = progressData?.currentStepId || null;
  const currentPhaseId = progressData?.currentPhaseId || null;
  const completedStepIds = progressData?.completedStepIds || [];

  const hasStarted = completedStepIds.length > 0 || currentStepId;

  const handleStart = () => {
    startPath(path.id);
  };

  const handleStepClick = (step: LearningStep) => {
    const phase = path.phases.find(p =>
      p.steps.some(s => s.id === step.id)
    );
    if (phase) {
      setCurrentStep(path.id, step.id, phase.id);
    }

    if (step.type === 'question') {
      navigate(`/question/${step.targetId}?from=learning-path&pathId=${path.id}&stepId=${step.id}`);
    } else if (step.type === 'category') {
      navigate(`/category/${step.targetId}?from=learning-path&pathId=${path.id}`);
    } else if (step.type === 'exam') {
      navigate(`/exam/config?from=learning-path&pathId=${path.id}&stepId=${step.id}`);
    }
  };

  const handleMarkComplete = () => {
    if (currentStepId) {
      completeStep(path.id, currentStepId);
    }
  };

  const totalSteps = path.phases.reduce((sum, phase) => sum + phase.steps.length, 0);
  const completedSteps = completedStepIds.length;

  let currentStep: LearningStep | null = null;
  let currentPhase: LearningPhase | null = null;
  if (currentStepId && currentPhaseId) {
    currentPhase = path.phases.find(p => p.id === currentPhaseId) || null;
    currentStep = currentPhase?.steps.find(s => s.id === currentStepId) || null;
  }

  if (isLoading) {
    return <LearningPathDetailSkeleton />;
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="sticky top-16 z-40 bg-dark-900/80 backdrop-blur-md border-b border-dark-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/learning-paths')}
              className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${path.gradient} flex items-center justify-center text-white`}>
                {(() => {
                  const Icon = iconMap[path.icon] || BookOpen;
                  return <Icon className="w-5 h-5" />;
                })()}
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">{path.title}</h1>
                <p className="text-sm text-dark-400">{path.subtitle}</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-6">
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{progress}%</div>
                <div className="text-xs text-dark-500">{completedSteps}/{totalSteps} 已完成</div>
              </div>
              <div className="w-32 h-3 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${path.gradient} rounded-full transition-all duration-700`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {hasStarted && currentStep && currentPhase && (
          <div className="mb-8 bg-gradient-to-r from-primary-600/20 via-primary-500/10 to-cyan-500/20 border border-primary-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 text-xs bg-primary-500/20 text-primary-300 rounded-full">
                      当前学习
                    </span>
                    <span className="text-sm text-dark-400">{currentPhase.title}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{currentStep.title}</h3>
                  <p className="text-sm text-dark-300 mt-1">{currentStep.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-dark-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      预计 {formatDuration(currentStep.durationMinutes)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {(() => {
                        const Icon = stepTypeConfig[currentStep.type as StepType].icon;
                        return <Icon className="w-4 h-4" />;
                      })()}
                      {stepTypeConfig[currentStep.type as StepType].label}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleMarkComplete}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-500/20 text-green-400 font-medium rounded-xl hover:bg-green-500/30 transition-colors border border-green-500/30"
                >
                  <Check className="w-5 h-5" />
                  标记完成
                </button>
                <button
                  onClick={() => handleStepClick(currentStep)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  继续学习
                </button>
              </div>
            </div>
          </div>
        )}

        {!hasStarted && (
          <div className="mb-8 bg-dark-800/50 border border-dark-700 rounded-2xl p-8 text-center">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${path.gradient} flex items-center justify-center text-white mx-auto mb-5 shadow-lg`}>
              {(() => {
                const Icon = iconMap[path.icon] || BookOpen;
                return <Icon className="w-10 h-10" />;
              })()}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">准备好开始学习了吗？</h2>
            <p className="text-dark-400 mb-6 max-w-lg mx-auto">
              这条学习路线包含 {path.phases.length} 个阶段，共 {totalSteps} 个学习节点，
              预计需要 {path.estimatedDays} 天完成。让我们开始吧！
            </p>
            <button
              onClick={handleStart}
              className={`inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r ${path.gradient} text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all hover:scale-105`}
            >
              <Play className="w-5 h-5 fill-current" />
              开始学习
            </button>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-10">
          <div className="p-5 bg-dark-800/50 border border-dark-700 rounded-2xl">
            <div className="flex items-center gap-2 text-dark-400 mb-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">预计天数</span>
            </div>
            <div className="text-2xl font-bold text-white">{path.estimatedDays} 天</div>
          </div>
          <div className="p-5 bg-dark-800/50 border border-dark-700 rounded-2xl">
            <div className="flex items-center gap-2 text-dark-400 mb-2">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm">题目数量</span>
            </div>
            <div className="text-2xl font-bold text-white">{path.totalQuestions} 道</div>
          </div>
          <div className="p-5 bg-dark-800/50 border border-dark-700 rounded-2xl">
            <div className="flex items-center gap-2 text-dark-400 mb-2">
              <Target className="w-5 h-5" />
              <span className="text-sm">学习阶段</span>
            </div>
            <div className="text-2xl font-bold text-white">{path.phases.length} 个</div>
          </div>
          <div className="p-5 bg-dark-800/50 border border-dark-700 rounded-2xl">
            <div className="flex items-center gap-2 text-dark-400 mb-2">
              <Trophy className="w-5 h-5" />
              <span className="text-sm">完成状态</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {progress === 100 ? '已完成' : progress > 0 ? '进行中' : '未开始'}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-5">学习阶段</h2>
          <div className="space-y-6">
            {path.phases.map((phase, index) => (
              <PhaseSection
                key={phase.id}
                pathId={path.id}
                phase={phase}
                phaseIndex={index}
                currentStepId={currentStepId}
                completedStepIds={completedStepIds}
                onStepClick={handleStepClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
