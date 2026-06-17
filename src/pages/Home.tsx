import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Target, BookOpen, TrendingUp, ChevronRight, ClipboardList, Clock, Route } from 'lucide-react';
import CategoryCard from '@/components/CategoryCard';
import QuestionCard from '@/components/QuestionCard';
import { QuestionListSkeleton } from '@/components/QuestionCardSkeleton';
import { CategoryListSkeleton } from '@/components/CategoryCardSkeleton';
import { PathListSkeleton } from '@/components/PathCardSkeleton';
import { categories } from '@/data/categories';
import { questions } from '@/data/questions';
import { learningPaths } from '@/data/learningPaths';
import { useLearningPathStore } from '@/store/useLearningPathStore';
import { Skeleton } from '@/components/Skeleton';
import { iconMap } from '@/config';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { getPathProgress, progress } = useLearningPathStore();
  const [isLoading, setIsLoading] = useState(true);

  const hotQuestions = questions.filter(q => q.isHot).slice(0, 6);
  const totalQuestions = questions.length;
  const totalPitfalls = questions.reduce((sum, q) => sum + q.pitfalls.length, 0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const isPathActive = (pathId: string) => {
    const pathProgress = progress[pathId];
    if (!pathProgress || !pathProgress.startedAt) return false;
    const progressPercent = getPathProgress(pathId);
    return progressPercent > 0 && progressPercent < 100;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Hero 区域 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/20 via-dark-900 to-dark-900" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-4 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>覆盖 5 大技术方向 · {totalQuestions} 道精选面试题</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            程序员面试题库
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyan-400 mt-2">
              不只是背题，更懂原理
            </span>
          </h1>
          
          <p className="text-lg text-dark-400 mb-10 max-w-2xl mx-auto">
            每道题都包含标准解法和实际项目中容易翻车的坑点，
            帮助你从"背题选手"成长为"真正理解的工程师"
          </p>

          {/* 搜索框 */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 group-focus-within:text-primary-400 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索题目，如：HashMap、索引、缓存击穿..."
                className="w-full pl-12 pr-32 py-4 bg-dark-800/80 border border-dark-700 rounded-2xl text-white placeholder:text-dark-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-primary-500/25"
              >
                搜索
              </button>
            </div>
          </form>

          {/* 快速标签 */}
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-sm text-dark-500">热门搜索：</span>
            {['HashMap', '索引', '缓存击穿', 'Kafka', '秒杀系统'].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSearchQuery(tag);
                  navigate(`/search?q=${encodeURIComponent(tag)}`);
                }}
                className="px-3 py-1 text-sm bg-dark-800 text-dark-300 rounded-full hover:bg-dark-700 hover:text-white transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 数据统计 */}
      <section className="container mx-auto px-4 -mt-8 mb-16">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 bg-dark-800/50 backdrop-blur border border-dark-700 rounded-2xl">
                <Skeleton className="w-10 h-10 rounded-xl mb-3" />
                <Skeleton className="w-16 h-7 mb-1" />
                <Skeleton className="w-20 h-4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: BookOpen, label: '题目总数', value: totalQuestions, color: 'from-blue-500 to-cyan-500' },
              { icon: Target, label: '技术方向', value: categories.length, color: 'from-purple-500 to-pink-500' },
              { icon: Sparkles, label: '坑点分析', value: totalPitfalls, color: 'from-orange-500 to-yellow-500' },
              { icon: TrendingUp, label: '持续更新', value: '2024', color: 'from-green-500 to-emerald-500' },
            ].map((stat, index) => (
              <div
                key={index}
                className="p-5 bg-dark-800/50 backdrop-blur border border-dark-700 rounded-2xl hover:border-dark-600 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-dark-400">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 模拟考试入口 */}
      <section className="container mx-auto px-4 mb-16">
        <div
          className="relative overflow-hidden bg-gradient-to-r from-primary-600/20 via-primary-500/10 to-cyan-500/20 border border-primary-500/30 rounded-3xl p-8 md:p-10 cursor-pointer group hover:border-primary-400/50 transition-colors"
          onClick={() => navigate('/exam/config')}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ClipboardList className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">模拟考试</h2>
                <p className="text-dark-300 max-w-md">
                  自定义难度和题量，模拟真实面试场景，检验你的学习成果
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-dark-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    计时答题
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Target className="w-4 h-4" />
                    智能评分
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    答案解析
                  </span>
                </div>
              </div>
            </div>

            <button className="flex items-center gap-2 px-6 py-3 bg-white text-dark-900 font-semibold rounded-xl hover:bg-dark-100 transition-colors group-hover:shadow-lg group-hover:shadow-primary-500/20">
              开始考试
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* 学习路线入口 */}
      <section className="container mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">🎯 学习路线</h2>
            <p className="text-dark-400 mt-1">体系化学习，按图索骥，高效成长</p>
          </div>
          <button
            onClick={() => navigate('/learning-paths')}
            className="flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors"
          >
            查看全部
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {isLoading ? (
          <PathListSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {learningPaths.slice(0, 3).map((path) => {
              const pathProgress = getPathProgress(path.id);
              const isActive = isPathActive(path.id);
              return (
                <div
                  key={path.id}
                  className="group relative overflow-hidden bg-dark-800/50 border border-dark-700 rounded-2xl hover:border-primary-500/50 transition-all cursor-pointer"
                  onClick={() => navigate(`/learning-path/${path.id}`)}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${path.gradient}`} />
                  {isActive && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 bg-primary-500/20 border border-primary-500/30 rounded-full text-primary-400 text-xs font-medium">
                      <TrendingUp className="w-3 h-3" />
                      进行中
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${path.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                        {(() => {
                          const Icon = iconMap[path.icon] || BookOpen;
                          return <Icon className="w-6 h-6" />;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors truncate">
                          {path.title}
                        </h3>
                        <p className="text-sm text-dark-400 mt-0.5 truncate">{path.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-sm text-dark-400 mb-4 line-clamp-2">{path.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-dark-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {path.estimatedDays}天
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          {path.totalQuestions}题
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-white">{pathProgress}%</div>
                    </div>
                    <div className="mt-3 h-2 bg-dark-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${path.gradient} rounded-full transition-all duration-500`}
                        style={{ width: `${pathProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 分类卡片 */}
      <section className="container mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">按方向浏览</h2>
            <p className="text-dark-400 mt-1">选择你感兴趣的技术方向开始学习</p>
          </div>
        </div>
        {isLoading ? (
          <CategoryListSkeleton count={5} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>

      {/* 热门题目 */}
      <section className="container mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">🔥 热门面试题</h2>
            <p className="text-dark-400 mt-1">高频出现，重点掌握</p>
          </div>
          <button
            onClick={() => navigate('/category/java')}
            className="flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors"
          >
            查看更多
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {isLoading ? (
          <QuestionListSkeleton count={6} viewMode="grid" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotQuestions.map((question) => {
              const category = categories.find(c => c.id === question.categoryId);
              return (
                <QuestionCard
                  key={question.id}
                  question={question}
                  showCategory
                  categoryName={category?.name}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
