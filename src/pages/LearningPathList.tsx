import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  Calendar,
  ChevronRight,
  Play,
  RotateCcw,
  Trophy,
  TrendingUp,
} from 'lucide-react';
import { learningPaths } from '@/data/learningPaths';
import { useLearningPathStore } from '@/store/useLearningPathStore';
import { LearningPath } from '@/types';
import { PathListSkeleton } from '@/components/PathCardSkeleton';
import { iconMap, pathLevelConfig } from '@/config';

interface PathCardProps {
  path: LearningPath;
  progress: number;
  isActive: boolean;
  onStart: () => void;
  onContinue: () => void;
  onReset: () => void;
}

function PathCard({ path, progress, isActive, onStart, onContinue, onReset }: PathCardProps) {
  const navigate = useNavigate();
  const levelInfo = pathLevelConfig[path.level as keyof typeof pathLevelConfig] || pathLevelConfig.all;

  const totalSteps = path.phases.reduce((sum, phase) => sum + phase.steps.length, 0);
  const completedSteps = Math.round((progress / 100) * totalSteps);

  return (
    <div className="group relative overflow-hidden bg-dark-800/50 border border-dark-700 rounded-3xl hover:border-dark-600 transition-all duration-300">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${path.gradient}`} />
      {isActive && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-primary-500/20 border border-primary-500/30 rounded-full text-primary-400 text-xs font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          进行中
        </div>
      )}

      <div className="p-7">
        <div className="flex items-start gap-5 mb-5">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${path.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
            {(() => {
              const Icon = iconMap[path.icon] || BookOpen;
              return <Icon className="w-7 h-7" />;
            })()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${levelInfo.color}`}>
                {levelInfo.label}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
              {path.title}
            </h3>
            <p className="text-sm text-dark-400 mt-1">{path.subtitle}</p>
          </div>
        </div>

        <p className="text-sm text-dark-400 mb-6 leading-relaxed">{path.description}</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-dark-900/50 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1.5 text-dark-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">预计天数</span>
            </div>
            <div className="text-lg font-bold text-white">{path.estimatedDays}天</div>
          </div>
          <div className="p-3 bg-dark-900/50 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1.5 text-dark-400 mb-1">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs">题目数量</span>
            </div>
            <div className="text-lg font-bold text-white">{path.totalQuestions}道</div>
          </div>
          <div className="p-3 bg-dark-900/50 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1.5 text-dark-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">学习阶段</span>
            </div>
            <div className="text-lg font-bold text-white">{path.phases.length}个</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dark-400">学习进度</span>
            <span className="text-sm font-semibold text-white">{progress}%</span>
          </div>
          <div className="h-2.5 bg-dark-900 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${path.gradient} rounded-full transition-all duration-700 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress > 0 && (
            <div className="flex items-center justify-between mt-2 text-xs text-dark-500">
              <span>已完成 {completedSteps} / {totalSteps} 个学习节点</span>
              {progress === 100 && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <Trophy className="w-3.5 h-3.5" />
                  已完成
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {progress === 0 ? (
            <button
              onClick={onStart}
              className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r ${path.gradient} text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all hover:scale-[1.02]`}
            >
              <Play className="w-5 h-5 fill-current" />
              开始学习
            </button>
          ) : progress === 100 ? (
            <button
              onClick={onReset}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-dark-700 text-dark-300 font-semibold rounded-xl hover:bg-dark-600 hover:text-white transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              重新学习
            </button>
          ) : (
            <>
              <button
                onClick={onContinue}
                className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r ${path.gradient} text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all hover:scale-[1.02]`}
              >
                <Play className="w-5 h-5 fill-current" />
                继续学习
              </button>
              <button
                onClick={onReset}
                className="p-3 bg-dark-700 text-dark-400 rounded-xl hover:bg-dark-600 hover:text-white transition-colors"
                title="重置进度"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            onClick={() => navigate(`/learning-path/${path.id}`)}
            className="p-3 bg-dark-700 text-dark-300 rounded-xl hover:bg-dark-600 hover:text-white transition-colors"
            title="查看详情"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LearningPathList() {
  const navigate = useNavigate();
  const { startPath, resetPath, getPathProgress, progress } = useLearningPathStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = (pathId: string) => {
    startPath(pathId);
    navigate(`/learning-path/${pathId}`);
  };

  const handleContinue = (pathId: string) => {
    navigate(`/learning-path/${pathId}`);
  };

  const handleReset = (pathId: string) => {
    if (window.confirm('确定要重置该学习路线的进度吗？此操作不可撤销。')) {
      resetPath(pathId);
    }
  };

  const isPathActive = (pathId: string) => {
    const pathProgress = progress[pathId];
    if (!pathProgress || !pathProgress.startedAt) return false;
    const progressPercent = getPathProgress(pathId);
    return progressPercent > 0 && progressPercent < 100;
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/20 via-dark-900 to-dark-900" />
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>体系化学习，循序渐进</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            学习路线
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyan-400 mt-2">
              按图索骥，高效成长
            </span>
          </h1>

          <p className="text-lg text-dark-400 max-w-2xl mx-auto">
            精心设计的学习路线，帮你规划学习路径，从入门到精通，
            每一步都脚踏实地，稳步提升技术实力。
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        {isLoading ? (
          <PathListSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPaths.map((path) => {
              const progress = getPathProgress(path.id);
              const isActive = isPathActive(path.id);
              return (
                <PathCard
                  key={path.id}
                  path={path}
                  progress={progress}
                  isActive={isActive}
                  onStart={() => handleStart(path.id)}
                  onContinue={() => handleContinue(path.id)}
                  onReset={() => handleReset(path.id)}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
