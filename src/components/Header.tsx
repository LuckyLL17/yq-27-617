import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Search, Menu, X, ClipboardList, History, Route } from 'lucide-react';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">
              面试题库
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
            >
              首页
            </Link>
            <Link
              to="/learning-paths"
              className="px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
            >
              学习路线
            </Link>
            <Link
              to="/category/java"
              className="px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
            >
              Java
            </Link>
            <Link
              to="/category/database"
              className="px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
            >
              数据库
            </Link>
            <Link
              to="/category/cache"
              className="px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
            >
              缓存
            </Link>
            <Link
              to="/category/mq"
              className="px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
            >
              消息队列
            </Link>
            <Link
              to="/category/system-design"
              className="px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
            >
              系统设计
            </Link>
            <Link
              to="/exam/config"
              className="ml-2 px-4 py-2 bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ClipboardList className="w-4 h-4" />
              模拟考试
            </Link>
            <Link
              to="/exam/history"
              className="ml-1 px-3 py-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
              title="历史成绩"
            >
              <History className="w-4 h-4" />
            </Link>
          </nav>

          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索题目..."
                className="w-64 pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-white placeholder:text-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              />
            </div>
          </form>

          <button
            className="md:hidden p-2 text-dark-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-dark-700 animate-fade-in">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索题目..."
                  className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-white placeholder:text-dark-500 focus:outline-none focus:border-primary-500"
                />
              </div>
            </form>
            <nav className="flex flex-col gap-1">
              <Link
                to="/"
                className="px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                首页
              </Link>
              <Link
                to="/learning-paths"
                className="px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Route className="w-4 h-4" />
                学习路线
              </Link>
              <Link
                to="/category/java"
                className="px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Java
              </Link>
              <Link
                to="/category/database"
                className="px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                数据库
              </Link>
              <Link
                to="/category/cache"
                className="px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                缓存
              </Link>
              <Link
                to="/category/mq"
                className="px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                消息队列
              </Link>
              <Link
                to="/category/system-design"
                className="px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                系统设计
              </Link>
              <Link
                to="/exam/config"
                className="px-4 py-2 bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 rounded-lg transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ClipboardList className="w-4 h-4" />
                模拟考试
              </Link>
              <Link
                to="/exam/history"
                className="px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <History className="w-4 h-4" />
                历史成绩
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
