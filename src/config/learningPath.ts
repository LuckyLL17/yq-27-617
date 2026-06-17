import { FileQuestion, ClipboardList, BookMarked } from 'lucide-react';

export type StepType = 'question' | 'exam' | 'category';

export interface StepTypeConfig {
  icon: typeof FileQuestion;
  label: string;
  colorClass: string;
}

export const stepTypeConfig: Record<StepType, StepTypeConfig> = {
  question: {
    icon: FileQuestion,
    label: '题目学习',
    colorClass: 'bg-blue-500/10 text-blue-400',
  },
  exam: {
    icon: ClipboardList,
    label: '阶段测评',
    colorClass: 'bg-purple-500/10 text-purple-400',
  },
  category: {
    icon: BookMarked,
    label: '专题学习',
    colorClass: 'bg-cyan-500/10 text-cyan-400',
  },
};

export type PathLevel = 'beginner' | 'intermediate' | 'advanced' | 'all';

export interface PathLevelConfig {
  label: string;
  color: string;
}

export const pathLevelConfig: Record<PathLevel, PathLevelConfig> = {
  beginner: {
    label: '入门',
    color: 'bg-green-500/10 text-green-400 border-green-500/30',
  },
  intermediate: {
    label: '进阶',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  advanced: {
    label: '高级',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  },
  all: {
    label: '全级别',
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  },
};
