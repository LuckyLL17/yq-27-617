import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  History,
  Trophy,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  Trash2,
  ArrowLeft,
  TrendingUp,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { useExamStore } from '@/store/useExamStore';
import { ExamHistoryRecord } from '@/types';
import { ExamHistorySkeleton } from '@/components/ExamHistorySkeleton';
import { allDifficultyConfig, getScoreLevel } from '@/config';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}分${secs}秒`;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const cfg = allDifficultyConfig[difficulty] || allDifficultyConfig.all;
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

export default function ExamHistoryPage() {
  const navigate = useNavigate();
  const { history, clearHistory } = useExamStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const avgScore = history.length > 0
    ? Math.round(history.reduce((sum, r) => sum + r.score, 0) / history.length)
    : 0;

  const bestScore = history.length > 0
    ? Math.max(...history.map((r) => r.score))
    : 0;

  const totalQuestions = history.reduce((sum, r) => sum + r.questionCount, 0);

  const handleClearHistory = () => {
    if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
      clearHistory();
    }
  };

  const handleStartExam = () => {
    navigate('/exam/config');
  };

  if (isLoading) {
    return <ExamHistorySkeleton />;
  }

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-dark-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">历史成绩</h1>
              <p className="text-sm text-dark-400">共 {history.length} 次考试记录</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center mb-3">
                <History className="w-5 h-5 text-primary-400" />
              </div>
              <div className="text-2xl font-bold text-white">{history.length}</div>
              <div className="text-sm text-dark-400">考试次数</div>
            </div>
            <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
                <Trophy className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">{bestScore}<span className="text-sm text-dark-500 ml-1">分</span></div>
              <div className="text-sm text-dark-400">最高分</div>
            </div>
            <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{avgScore}<span className="text-sm text-dark-500 ml-1">分</span></div>
              <div className="text-sm text-dark-400">平均分</div>
            </div>
            <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-white">{totalQuestions}</div>
              <div className="text-sm text-dark-400">累计做题</div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">考试记录</h2>
            <div className="flex gap-2">
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  清空记录
                </button>
              )}
              <button
                onClick={handleStartExam}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
              >
                开始考试
              </button>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-700 flex items-center justify-center">
                <History className="w-8 h-8 text-dark-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">暂无考试记录</h3>
              <p className="text-dark-400 mb-6">开始第一场模拟考试，记录你的学习轨迹</p>
              <button
                onClick={handleStartExam}
                className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
              >
                开始考试
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((record: ExamHistoryRecord, index: number) => {
                const level = getScoreLevel(record.score);
                return (
                  <div
                    key={record.id}
                    className={`bg-gradient-to-r ${level.bg} border ${level.border} rounded-2xl p-5 hover:shadow-lg hover:shadow-primary-500/5 transition-all cursor-pointer`}
                    onClick={handleStartExam}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl ${level.border} border bg-dark-900/50 flex flex-col items-center justify-center`}>
                          <span className={`text-xl font-bold ${level.color}`}>{record.score}</span>
                          <span className="text-xs text-dark-500">{level.label}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-3.5 h-3.5 text-dark-500" />
                            <span className="text-sm text-dark-400">{formatDate(record.timestamp)}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-white">
                              {record.categoryNames.slice(0, 3).join('、')}
                              {record.categoryNames.length > 3 && `等${record.categoryNames.length}个分类`}
                            </span>
                            <DifficultyBadge difficulty={record.difficulty} />
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-dark-500">
                            <span>{record.questionCount}题</span>
                            <span>用时{formatTime(record.timeSpent)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1 text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span>{record.correctCount}</span>
                          </div>
                          <div className="flex items-center gap-1 text-red-400">
                            <XCircle className="w-4 h-4" />
                            <span>{record.wrongCount}</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-400">
                            <HelpCircle className="w-4 h-4" />
                            <span>{record.unansweredCount}</span>
                          </div>
                        </div>
                        <div className="text-dark-500">
                          #{index + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
