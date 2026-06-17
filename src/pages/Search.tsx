import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';
import QuestionCard from '@/components/QuestionCard';
import { QuestionListSkeleton } from '@/components/QuestionCardSkeleton';
import { questions } from '@/data/questions';
import { categories } from '@/data/categories';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return questions.filter(
      (q) =>
        q.title.toLowerCase().includes(lowerQuery) ||
        q.content.toLowerCase().includes(lowerQuery) ||
        q.standardSolution.toLowerCase().includes(lowerQuery) ||
        q.pitfalls.some(
          (p) =>
            p.title.toLowerCase().includes(lowerQuery) ||
            p.description.toLowerCase().includes(lowerQuery)
        )
    );
  }, [query]);

  useEffect(() => {
    if (!query.trim()) return;
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [query]);

  const highlightText = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;
    
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-500/30 text-yellow-200 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-dark-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <SearchIcon className="w-6 h-6 text-primary-400" />
          <h1 className="text-2xl font-bold text-white">
            搜索结果：<span className="text-primary-400">"{query}"</span>
          </h1>
          <span className="px-3 py-1 bg-dark-800 text-dark-300 rounded-full text-sm">
            {searchResults.length} 个结果
          </span>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="输入关键词搜索题目、解法、坑点..."
              className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder:text-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors text-base"
            />
          </div>
        </form>

        {isLoading ? (
          <QuestionListSkeleton count={6} viewMode="grid" />
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((question) => {
              const category = categories.find((c) => c.id === question.categoryId);
              return (
                <div key={question.id}>
                  <QuestionCard
                    question={{
                      ...question,
                      title: highlightText(question.title, query),
                    }}
                    showCategory
                    categoryName={category?.name}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">未找到相关题目</h3>
            <p className="text-dark-400 mb-6">
              试试其他关键词，或者浏览我们的分类
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.id}`}
                  className="px-4 py-2 bg-dark-800 text-dark-300 rounded-lg hover:bg-dark-700 hover:text-white transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
