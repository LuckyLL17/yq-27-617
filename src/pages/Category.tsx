import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Filter, Grid3X3, List } from 'lucide-react';
import QuestionCard from '@/components/QuestionCard';
import { QuestionListSkeleton } from '@/components/QuestionCardSkeleton';
import { categories } from '@/data/categories';
import { questions } from '@/data/questions';
import { Difficulty } from '@/types';
import { difficultyConfig } from '@/config';

export default function Category() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  const category = categories.find(c => c.id === categoryId);
  
  const filteredQuestions = useMemo(() => {
    let result = questions.filter(q => q.categoryId === categoryId);
    
    if (difficulty !== 'all') {
      result = result.filter(q => q.difficulty === difficulty);
    }
    
    return result;
  }, [categoryId, difficulty]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [categoryId, difficulty]);

  const difficultyOptions = [
    { value: 'all', label: '全部', count: questions.filter(q => q.categoryId === categoryId).length },
    { value: 'easy', label: difficultyConfig.easy.label, count: questions.filter(q => q.categoryId === categoryId && q.difficulty === 'easy').length },
    { value: 'medium', label: difficultyConfig.medium.label, count: questions.filter(q => q.categoryId === categoryId && q.difficulty === 'medium').length },
    { value: 'hard', label: difficultyConfig.hard.label, count: questions.filter(q => q.categoryId === categoryId && q.difficulty === 'hard').length },
  ];

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">分类不存在</h1>
        <Link to="/" className="text-primary-400 hover:text-primary-300">
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* 分类头部 */}
      <div className="border-b border-dark-700 bg-dark-800/50">
        <div className="container mx-auto px-4 py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-dark-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              {category.icon === 'coffee' && '☕'}
              {category.icon === 'database' && '🗄️'}
              {category.icon === 'zap' && '⚡'}
              {category.icon === 'message-square' && '💬'}
              {category.icon === 'layout-grid' && '🧩'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{category.name}</h1>
              <p className="text-dark-400 mt-1">{category.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-white">{filteredQuestions.length}</span>
              <span className="text-dark-400">道题目</span>
            </div>
            <div className="h-8 w-px bg-dark-700" />
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-green-400">
                {questions.filter(q => q.categoryId === categoryId && q.difficulty === 'easy').length}
              </span>
              <span className="text-dark-400 text-sm">简单</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-yellow-400">
                {questions.filter(q => q.categoryId === categoryId && q.difficulty === 'medium').length}
              </span>
              <span className="text-dark-400 text-sm">中等</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-red-400">
                {questions.filter(q => q.categoryId === categoryId && q.difficulty === 'hard').length}
              </span>
              <span className="text-dark-400 text-sm">困难</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 筛选栏 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-dark-400" />
            <span className="text-dark-300 text-sm">难度筛选：</span>
            <div className="flex gap-1">
              {difficultyOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDifficulty(opt.value as Difficulty | 'all')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    difficulty === opt.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                  }`}
                >
                  {opt.label}
                  <span className="ml-1 text-xs opacity-70">({opt.count})</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-dark-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-dark-700 text-white'
                  : 'text-dark-400 hover:text-white'
              }`}
              title="网格视图"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-dark-700 text-white'
                  : 'text-dark-400 hover:text-white'
              }`}
              title="列表视图"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 题目列表或骨架屏 */}
        {isLoading ? (
          <QuestionListSkeleton count={9} viewMode={viewMode} />
        ) : filteredQuestions.length > 0 ? (
          <div className={`grid gap-4 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}>
            {filteredQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">暂无符合条件的题目</h3>
            <p className="text-dark-400">试试切换其他难度筛选</p>
          </div>
        )}
      </div>
    </div>
  );
}
