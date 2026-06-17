import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, Target, ChevronRight, Settings, Check } from 'lucide-react';
import { categories } from '@/data/categories';
import { questions } from '@/data/questions';
import { useExamStore } from '@/store/useExamStore';
import { Difficulty } from '@/types';
import { ExamConfigSkeleton } from '@/components/ExamConfigSkeleton';
import { difficultyOptions, countOptions, durationOptions, examDefaultConfig } from '@/config';

export default function ExamConfigPage() {
  const navigate = useNavigate();
  const setConfig = useExamStore((state) => state.setConfig);
  const startExam = useExamStore((state) => state.startExam);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(examDefaultConfig.defaultCategoryIds);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>(examDefaultConfig.defaultDifficulty);
  const [questionCount, setQuestionCount] = useState<number>(examDefaultConfig.defaultQuestionCount);
  const [duration, setDuration] = useState<number>(examDefaultConfig.defaultDuration);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      }
      return [...prev, categoryId];
    });
  };

  const selectAllCategories = () => {
    setSelectedCategories(categories.map((c) => c.id));
  };

  const categoryQuestions = questions.filter((q) =>
    selectedCategories.includes(q.categoryId)
  );
  const filteredCount =
    selectedDifficulty === 'all'
      ? categoryQuestions.length
      : categoryQuestions.filter((q) => q.difficulty === selectedDifficulty).length;

  const actualCount = Math.min(questionCount, filteredCount);

  const handleStartExam = () => {
    if (selectedCategories.length === 0 || filteredCount === 0) return;

    setConfig({
      categoryIds: selectedCategories,
      difficulty: selectedDifficulty,
      questionCount: actualCount,
      duration,
    });
    startExam();
    navigate('/exam/take');
  };

  const selectedCategoryNames = selectedCategories
    .map((id) => categories.find((c) => c.id === id)?.name)
    .filter(Boolean)
    .join('、');

  if (isLoading) {
    return <ExamConfigSkeleton />;
  }

  return (
    <div className="min-h-screen bg-dark-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-sm">
              <Settings className="w-4 h-4" />
              <span>模拟考试配置</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              开始一场模拟考试
            </h1>
            <p className="text-dark-400 text-lg">
              根据你的需求自定义考试内容，检验学习成果
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">选择分类</h2>
                    <p className="text-sm text-dark-400">
                      可选一个或多个技术方向（已选 {selectedCategories.length} 个）
                    </p>
                  </div>
                </div>
                <button
                  onClick={selectAllCategories}
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                >
                  全选
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-dark-700 bg-dark-900/50 hover:border-dark-600'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <span className="text-xl">
                          {category.id === 'java' && '☕'}
                          {category.id === 'database' && '🗄️'}
                          {category.id === 'cache' && '⚡'}
                          {category.id === 'mq' && '📨'}
                          {category.id === 'system-design' && '🏗️'}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-white text-center">
                        {category.name}
                      </div>
                      <div className="text-xs text-dark-400 text-center mt-1">
                        {category.questionCount}道题
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">选择难度</h2>
                  <p className="text-sm text-dark-400">根据你的水平选择合适的难度</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {difficultyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedDifficulty(option.value as Difficulty | 'all')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedDifficulty === option.value
                        ? 'border-yellow-500 bg-yellow-500/10'
                        : 'border-dark-700 bg-dark-900/50 hover:border-dark-600'
                    }`}
                  >
                    <div className="font-medium text-white">{option.label}</div>
                    <div className="text-xs text-dark-400 mt-1">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">题目数量</h2>
                    <p className="text-sm text-dark-400">
                      可用题目: <span className="text-cyan-400 font-medium">{filteredCount}</span> 道
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {countOptions.map((count) => (
                    <button
                      key={count}
                      onClick={() => setQuestionCount(count)}
                      disabled={count > filteredCount}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        questionCount === count
                          ? 'bg-cyan-500 text-white'
                          : count > filteredCount
                          ? 'bg-dark-700 text-dark-500 cursor-not-allowed'
                          : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'
                      }`}
                    >
                      {count} 道
                    </button>
                  ))}
                </div>

                {filteredCount < questionCount && (
                  <p className="text-sm text-yellow-400 mt-3">
                    ⚠️ 当前筛选条件下只有 {filteredCount} 道题，将使用全部可用题目
                  </p>
                )}
              </div>

              <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">考试时长</h2>
                    <p className="text-sm text-dark-400">选择合适的答题时间</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {durationOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDuration(option.value)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        duration === option.value
                          ? 'bg-green-500 text-white'
                          : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary-500/10 to-cyan-500/10 border border-primary-500/20 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">考试配置预览</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-dark-300">
                    <span>
                      分类: <span className="text-primary-400 font-medium">
                        {selectedCategoryNames || '未选择'}
                      </span>
                    </span>
                    <span>
                      难度: <span className="text-primary-400 font-medium">
                        {difficultyOptions.find(d => d.value === selectedDifficulty)?.label}
                      </span>
                    </span>
                    <span>
                      题量: <span className="text-primary-400 font-medium">{actualCount} 道</span>
                    </span>
                    <span>
                      时长: <span className="text-primary-400 font-medium">{duration} 分钟</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleStartExam}
                  disabled={selectedCategories.length === 0 || filteredCount === 0}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  开始考试
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
