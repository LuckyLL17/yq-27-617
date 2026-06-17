import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import { useExamStore } from '@/store/useExamStore';
import { difficultyConfig, timeWarningThreshold } from '@/config';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function ExamTakePage() {
  const navigate = useNavigate();
  const {
    examQuestions,
    currentIndex,
    remainingTime,
    status,
    setCurrentIndex,
    setUserAnswer,
    toggleMark,
    submitExam,
    tick,
  } = useExamStore();

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const currentQuestion = examQuestions[currentIndex];
  const currentExamQuestion = examQuestions[currentIndex];

  useEffect(() => {
    if (status !== 'ongoing') {
      navigate('/exam/config');
    }
  }, [status, navigate]);

  useEffect(() => {
    if (status !== 'ongoing') return;

    const timer = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(timer);
  }, [status, tick]);

  useEffect(() => {
    if (status === 'finished') {
      navigate('/exam/result');
    }
  }, [status, navigate]);

  if (!currentQuestion) {
    return null;
  }

  const answeredCount = examQuestions.filter((q) => q.isAnswered).length;
  const markedCount = examQuestions.filter((q) => q.isMarked).length;
  const unansweredCount = examQuestions.length - answeredCount;

  const isTimeWarning = remainingTime < timeWarningThreshold;

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < examQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSubmit = () => {
    submitExam();
    navigate('/exam/result');
  };

  const difficulty = difficultyConfig[currentQuestion.question.difficulty];

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="sticky top-0 z-40 bg-dark-900/90 backdrop-blur-md border-b border-dark-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-400" />
                <span className="font-semibold text-white">模拟考试</span>
              </div>
              <span className="text-dark-500">|</span>
              <span className="text-sm text-dark-400">
                第 <span className="text-white font-medium">{currentIndex + 1}</span> / {examQuestions.length} 题
              </span>
            </div>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isTimeWarning ? 'bg-red-500/10 text-red-400' : 'bg-dark-800 text-dark-300'
            }`}>
              <Clock className="w-5 h-5" />
              <span className="font-mono font-semibold text-lg">
                {formatTime(remainingTime)}
              </span>
            </div>

            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">交卷</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 flex-wrap mb-4">
                <span className="text-sm font-medium text-primary-400">
                  第 {currentIndex + 1} 题
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full border ${difficulty.className}`}
                >
                  {difficulty.label}
                </span>
                {currentExamQuestion?.isMarked && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-500/10 text-orange-400 rounded-full">
                    <Flag className="w-3 h-3" />
                    已标记
                  </span>
                )}
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-white mb-4">
                {currentQuestion.question.title}
              </h1>

              <div className="text-dark-300 leading-relaxed whitespace-pre-wrap">
                {currentQuestion.question.content}
              </div>
            </div>

            <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">你的答案</h2>
                <button
                  onClick={toggleMark}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    currentExamQuestion?.isMarked
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'bg-dark-700 text-dark-400 hover:text-white'
                  }`}
                >
                  <Flag className="w-4 h-4" />
                  {currentExamQuestion?.isMarked ? '取消标记' : '标记此题'}
                </button>
              </div>

              <textarea
                value={currentExamQuestion?.userAnswer || ''}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="请在此输入你的答案..."
                className="w-full h-64 p-4 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder:text-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none transition-colors"
              />

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-dark-400">
                  {currentExamQuestion?.userAnswer ? (
                    <span className="text-green-400">✓ 已作答</span>
                  ) : (
                    <span className="text-yellow-400">尚未作答</span>
                  )}
                </div>
                <div className="text-sm text-dark-500">
                  {currentExamQuestion?.userAnswer?.length || 0} 字
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-6 py-3 bg-dark-800 text-white rounded-xl hover:bg-dark-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
                上一题
              </button>

              {currentIndex < examQuestions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
                >
                  下一题
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors"
                >
                  <Send className="w-5 h-5" />
                  交卷
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-5 sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4">答题卡</h3>

              <div className="grid grid-cols-5 gap-2 mb-6">
                {examQuestions.map((eq, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`relative w-full aspect-square rounded-lg text-sm font-medium transition-all ${
                      currentIndex === index
                        ? 'bg-primary-500 text-white'
                        : eq.isMarked
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : eq.isAnswered
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-dark-700 text-dark-400 hover:bg-dark-600 hover:text-white'
                    }`}
                  >
                    {index + 1}
                    {eq.isMarked && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-3 text-sm border-t border-dark-700 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-dark-400">已答</span>
                  <span className="text-green-400 font-medium">{answeredCount} 题</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-400">未答</span>
                  <span className="text-yellow-400 font-medium">{unansweredCount} 题</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-400">已标记</span>
                  <span className="text-orange-400 font-medium">{markedCount} 题</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-dark-700">
                <div className="flex items-center gap-2 text-xs text-dark-500 mb-2">
                  <span className="w-3 h-3 bg-green-500/20 rounded border border-green-500/30" />
                  <span>已答</span>
                  <span className="w-3 h-3 bg-orange-500/20 rounded border border-orange-500/30 ml-2" />
                  <span>标记</span>
                  <span className="w-3 h-3 bg-dark-700 rounded ml-2" />
                  <span>未答</span>
                </div>
              </div>

              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
                交卷
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">确认交卷？</h3>
                <p className="text-sm text-dark-400">交卷后无法修改答案</p>
              </div>
            </div>

            <div className="bg-dark-900/50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">{answeredCount}</div>
                  <div className="text-xs text-dark-400">已答</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{unansweredCount}</div>
                  <div className="text-xs text-dark-400">未答</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-400">{markedCount}</div>
                  <div className="text-xs text-dark-400">已标记</div>
                </div>
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="text-sm text-yellow-400 mb-4">
                ⚠️ 你还有 {unansweredCount} 道题未作答，确定要交卷吗？
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white font-medium rounded-xl transition-colors"
              >
                继续答题
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
              >
                确认交卷
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
