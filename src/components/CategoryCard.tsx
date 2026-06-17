import { Link } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { Category } from '../types';
import { iconMap } from '@/config';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      to={`/category/${category.id}`}
      className="group block p-6 bg-dark-800/50 border border-dark-700 rounded-2xl hover:border-primary-500/50 hover:bg-dark-800 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 hover:-translate-y-1"
    >
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${category.color}20`, color: category.color }}
        >
          {(() => {
            const Icon = iconMap[category.icon] || LayoutGrid;
            return <Icon className="w-6 h-6" />;
          })()}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
            {category.name}
          </h3>
          <p className="text-sm text-dark-400 mt-1">
            {category.description}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">
            {category.questionCount}
          </span>
          <span className="text-sm text-dark-400">道题</span>
        </div>
        <div className="w-full max-w-24 h-2 bg-dark-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 group-hover:w-full"
            style={{
              backgroundColor: category.color,
              width: `${Math.min(category.questionCount * 4, 100)}%`,
            }}
          />
        </div>
      </div>
    </Link>
  );
}
