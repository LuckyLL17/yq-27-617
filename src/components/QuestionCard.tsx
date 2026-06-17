import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Flame, ChevronRight } from 'lucide-react';
import { Question } from '../types';
import { difficultyConfig } from '@/config';

interface QuestionCardProps {
  question: Omit<Question, 'title'> & { title: ReactNode };
  showCategory?: boolean;
  categoryName?: string;
  viewMode?: 'grid' | 'list';
}

export default function QuestionCard({
  question,
  showCategory = false,
  categoryName,
  viewMode = 'grid',
}: QuestionCardProps) {
  const difficulty = difficultyConfig[question.difficulty];

  if (viewMode === 'list') {
    return (
      <Link
        to={`/question/${question.id}`}
        className="group flex items-center gap-4 p-4 bg-dark-800/50 border border-dark-700 rounded-xl hover:border-primary-500/50 hover:bg-dark-800 transition-all duration-300"
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center text-sm font-mono text-dark-400 group-hover:bg-primary-500/20 group-hover:text-primary-400 transition-colors">
          {question.id.split('-')[1]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {question.isHot && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-500/10 text-orange-400 rounded-full">
                <Flame className="w-3 h-3" />
                热门
              </span>
            )}
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full border ${difficulty.className}`}
            >
              {difficulty.label}
            </span>
            {showCategory && categoryName && (
              <span className="px-2 py-0.5 text-xs font-medium bg-primary-500/10 text-primary-400 rounded-full">
                {categoryName}
              </span>
            )}
          </div>
          <h3 className="text-base font-medium text-white group-hover:text-primary-400 transition-colors truncate">
            {question.title}
          </h3>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-4 text-sm">
            <span className="text-dark-400">
              <span className="text-dark-300 font-medium">{question.pitfalls.length}</span> 个坑点
            </span>
            <span className="text-dark-400">
              <span className="text-dark-300 font-medium">{question.codeExamples.length}</span> 段代码
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-dark-500 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/question/${question.id}`}
      className="group block p-5 bg-dark-800/50 border border-dark-700 rounded-xl hover:border-primary-500/50 hover:bg-dark-800 transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center text-sm font-mono text-dark-400 group-hover:bg-primary-500/20 group-hover:text-primary-400 transition-colors">
          {question.id.split('-')[1]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {question.isHot && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-500/10 text-orange-400 rounded-full">
                <Flame className="w-3 h-3" />
                热门
              </span>
            )}
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full border ${difficulty.className}`}
            >
              {difficulty.label}
            </span>
            {showCategory && categoryName && (
              <span className="px-2 py-0.5 text-xs font-medium bg-primary-500/10 text-primary-400 rounded-full">
                {categoryName}
              </span>
            )}
          </div>
          <h3 className="mt-2 text-base font-medium text-white group-hover:text-primary-400 transition-colors line-clamp-2">
            {question.title}
          </h3>
          <p className="mt-1 text-sm text-dark-400 line-clamp-2">
            {question.content.slice(0, 80)}...
          </p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-dark-700 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-dark-400">
            <span className="text-dark-300 font-medium">{question.pitfalls.length}</span> 个坑点
          </span>
          <span className="text-dark-400">
            <span className="text-dark-300 font-medium">{question.codeExamples.length}</span> 段代码
          </span>
        </div>
      </div>
    </Link>
  );
}
