import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  RotateCcw,
  Home,
  ChevronDown,
  ChevronUp,
  BookOpen,
  AlertTriangle,
  Code,
  Flame,
  BarChart3,
  History,
} from 'lucide-react';
import { useExamStore } from '@/store/useExamStore';
import CodeBlock from '@/components/CodeBlock';
import PitfallCard from '@/components/PitfallCard';
import Markdown from '@/components/Markdown';
import { ExamResultSkeleton } from '@/components/ExamResultSkeleton';
import { ScoreDetail } from '@/types';
import { difficultyConfig, scoreLevelConfig, getScoreLevel, passScore } from '@/config';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}分${secs}秒`;
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-dark-400">{label}</span>
        <span className={`font-medium ${color}`}>{score}分</span>
      </div>
      <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            color === 'text-green-400'
              ? 'bg-green-500'
              : color === 'text-blue-400'
              ? 'bg-blue-500'
              : color === 'text-yellow-400'
              ? 'bg-yellow-500'
              : 'bg-cyan-500'
          }`}
          style={{ width: `${Math.max(score, 0)}%` }}
        />
      </div>
    </div>
  );
}

function ScoreDetailCard({ detail }: { detail: ScoreDetail }) {
  const level = scoreLevelConfig[detail.level];

  return (
    <div className="bg-dark-900/50 rounded-xl p-4 border border-dark-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary-400" />
          </div>
          <span className="font-medium text-white">评分详情</span>
        </div>
        <div className={`text-2xl font-bold ${level.color}`}>
          {detail.totalScore}
          <span className="text-sm font-normal text-dark-500"> / 100</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <ScoreBar label="关键词覆盖" score={detail.keywordScore} color="text-cyan-400" />
        <ScoreBar label="结构清晰度" score={detail.structureScore} color="text-blue-400" />
        <ScoreBar label="内容深度" score={detail.depthScore} color="text-green-400" />
        <ScoreBar label="答题完整度" score={detail.completenessScore} color="text-yellow-400" />
      </div>

      {detail.matchedKeywords.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-dark-400 mb-2">✓ 命中的关键词</div>
          <div className="flex flex-wrap gap-1.5">
            {detail.matchedKeywords.map((kw, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-xs bg-green-500/10 text-green-400 rounded-full"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {detail.missedKeywords.length > 0 && (
        <div>
          <div className="text-xs text-dark-400 mb-2">✗ 遗漏的关键词</div>
          <div className="flex flex-wrap gap-1.5">
            {detail.missedKeywords.map((kw, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-xs bg-red-500/10 text-red-400 rounded-full"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExamResultPage() {
  const navigate = useNavigate();
  const { result, resetExam, config, history } = useExamStore();
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'wrong' | 'unanswered'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (!result) {
    navigate('/exam/config');
    return null;
  }

  if (isLoading) {
    return <ExamResultSkeleton />;
  }

  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const handleRetry = () => {
    resetExam();
    navigate('/exam/config');
  };

  const handleHome = () => {
    resetExam();
    navigate('/');
  };

  const handleViewHistory = () => {
    navigate('/exam/history');
  };

  const scoreLevel = getScoreLevel(result.score);

  const getAnswerStatus = (eq: (typeof result.answers)[0]) => {
    if (!eq.isAnswered) return 'unanswered';
    if (eq.scoreDetail && eq.scoreDetail.totalScore >= passScore) return 'correct';
    return 'wrong';
  };

  const filteredAnswers = result.answers.filter((eq) => {
    const status = getAnswerStatus(eq);
    if (filterType === 'correct') return status === 'correct';
    if (filterType === 'wrong') return status === 'wrong';
    if (filterType === 'unanswered') return status === 'unanswered';
    return true;
  });

  const getFilteredIndex = (originalIndex: number) => {
    let count = 0;
    for (let i = 0; i < originalIndex; i++) {
      const eq = result.answers[i];
      const status = getAnswerStatus(eq);
      if (filterType === 'all') count++;
      else if (filterType === 'correct' && status === 'correct') count++;
      else if (filterType === 'wrong' && status === 'wrong') count++;
      else if (filterType === 'unanswered' && status === 'unanswered') count++;
    }
    return count + 1;
  };

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className={`bg-gradient-to-br ${scoreLevel.bg} border border-dark-700 rounded-2xl p-8 mb-8 text-center`}>
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-800/50 flex items-center justify-center">
              <Trophy className={`w-10 h-10 ${scoreLevel.color}`} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">考试结束</h1>
            <p className="text-dark-400 mb-6">
              {config?.categoryIds.length === 1
                ? `分类: ${config.categoryIds[0]}`
                : `分类: ${config?.categoryIds.length}个方向`}{' '}
              · 共 {result.totalQuestions} 题
            </p>

            <div className="text-6xl font-bold mb-2">
              <span className={scoreLevel.color}>{result.score}</span>
              <span className="text-3xl text-dark-500">分</span>
            </div>
            <p className={`text-lg font-medium ${scoreLevel.color} mb-8`}>
              {scoreLevel.label}
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="bg-dark-800/50 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 text-green-400 mb-1">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-2xl font-bold">{result.correctCount}</span>
                </div>
                <p className="text-xs text-dark-400">答对</p>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 text-red-400 mb-1">
                  <XCircle className="w-5 h-5" />
                  <span className="text-2xl font-bold">{result.wrongCount}</span>
                </div>
                <p className="text-xs text-dark-400">答错</p>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 text-yellow-400 mb-1">
                  <HelpCircle className="w-5 h-5" />
                  <span className="text-2xl font-bold">{result.unansweredCount}</span>
                </div>
                <p className="text-xs text-dark-400">未答</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-dark-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>用时 {formatTime(result.timeSpent)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>
                  正确率{' '}
                  {result.totalQuestions > 0
                    ? Math.round((result.correctCount / result.totalQuestions) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              再来一次
            </button>
            <button
              onClick={handleHome}
              className="flex items-center gap-2 px-5 py-2.5 bg-dark-800 hover:bg-dark-700 text-white font-medium rounded-xl transition-colors"
            >
              <Home className="w-4 h-4" />
              返回首页
            </button>
            <button
              onClick={handleViewHistory}
              className="flex items-center gap-2 px-5 py-2.5 bg-dark-800 hover:bg-dark-700 text-white font-medium rounded-xl transition-colors"
            >
              <History className="w-4 h-4" />
              历史成绩 ({history.length})
            </button>

            <div className="flex-1" />

            <div className="flex gap-1 bg-dark-800 rounded-lg p-1">
              {[
                { value: 'all', label: '全部' },
                { value: 'wrong', label: '错题' },
                { value: 'correct', label: '答对' },
                { value: 'unanswered', label: '未答' },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFilterType(item.value as typeof filterType)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    filterType === item.value
                      ? 'bg-dark-700 text-white'
                      : 'text-dark-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {result.answers.map((eq, originalIndex) => {
              const status = getAnswerStatus(eq);
              const shouldShow =
                filterType === 'all' ||
                (filterType === 'correct' && status === 'correct') ||
                (filterType === 'wrong' && status === 'wrong') ||
                (filterType === 'unanswered' && status === 'unanswered');

              if (!shouldShow) return null;

              const isExpanded = expandedQuestions.has(originalIndex);
              const difficulty = difficultyConfig[eq.question.difficulty];
              const displayIndex = getFilteredIndex(originalIndex);

              return (
                <div
                  key={originalIndex}
                  className="bg-dark-800/50 border border-dark-700 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleQuestion(originalIndex)}
                    className="w-full flex items-start gap-4 p-5 hover:bg-dark-800/80 transition-colors text-left"
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        status === 'unanswered'
                          ? 'bg-yellow-500/10'
                          : status === 'correct'
                          ? 'bg-green-500/10'
                          : 'bg-red-500/10'
                      }`}
                    >
                      {status === 'unanswered' ? (
                        <HelpCircle className="w-5 h-5 text-yellow-400" />
                      ) : status === 'correct' ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium text-primary-400">
                          第 {displayIndex} 题
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full border ${difficulty.className}`}
                        >
                          {difficulty.label}
                        </span>
                        {eq.scoreDetail && (
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              eq.scoreDetail.totalScore >= passScore
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}
                          >
                            {eq.scoreDetail.totalScore}分
                          </span>
                        )}
                        {eq.question.isHot && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-500/10 text-orange-400 rounded-full">
                            <Flame className="w-3 h-3" />
                            热门
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-medium text-white line-clamp-1">
                        {eq.question.title}
                      </h3>
                    </div>

                    <div className="flex-shrink-0 mt-1">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-dark-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-dark-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-dark-700 p-5 space-y-5 animate-fade-in">
                      <div>
                        <h4 className="text-sm font-semibold text-dark-400 uppercase tracking-wide mb-2">
                          题目描述
                        </h4>
                        <p className="text-dark-300 leading-relaxed whitespace-pre-wrap">
                          {eq.question.content}
                        </p>
                      </div>

                      {eq.scoreDetail && <ScoreDetailCard detail={eq.scoreDetail} />}

                      <div>
                        <h4 className="text-sm font-semibold text-dark-400 uppercase tracking-wide mb-2">
                          你的答案
                          {status === 'unanswered' && (
                            <span className="ml-2 text-yellow-400 text-xs font-normal">
                              （未作答）
                            </span>
                          )}
                          {status === 'wrong' && (
                            <span className="ml-2 text-red-400 text-xs font-normal">
                              （答案需要加强）
                            </span>
                          )}
                          {status === 'correct' && (
                            <span className="ml-2 text-green-400 text-xs font-normal">
                              （回答不错）
                            </span>
                          )}
                        </h4>
                        <div
                          className={`p-4 rounded-xl ${
                            status === 'unanswered'
                              ? 'bg-yellow-500/5 border border-yellow-500/20'
                              : status === 'correct'
                              ? 'bg-green-500/5 border border-green-500/20'
                              : 'bg-red-500/5 border border-red-500/20'
                          }`}
                        >
                          {eq.userAnswer ? (
                            <p className="text-dark-300 whitespace-pre-wrap text-sm leading-relaxed">
                              {eq.userAnswer}
                            </p>
                          ) : (
                            <p className="text-dark-500 italic">未作答</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-green-400" />
                          </div>
                          <h4 className="text-sm font-semibold text-white">标准解析</h4>
                        </div>
                        <div className="bg-dark-900/50 rounded-xl p-4 border border-dark-700">
                          <Markdown text={eq.question.standardSolution} size="sm" />
                        </div>
                      </div>

                      {eq.question.codeExamples.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                              <Code className="w-4 h-4 text-cyan-400" />
                            </div>
                            <h4 className="text-sm font-semibold text-white">代码示例</h4>
                          </div>
                          <div className="space-y-3">
                            {eq.question.codeExamples.map((example, idx) => (
                              <CodeBlock key={idx} code={example.code} language={example.language} />
                            ))}
                          </div>
                        </div>
                      )}

                      {eq.question.pitfalls.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                            </div>
                            <h4 className="text-sm font-semibold text-white">
                              💥 坑点分析（{eq.question.pitfalls.length}个）
                            </h4>
                          </div>
                          <div className="space-y-3">
                            {eq.question.pitfalls.map((pitfall, idx) => (
                              <PitfallCard key={idx} pitfall={pitfall} index={idx} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredAnswers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-dark-400">该分类下没有题目</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
