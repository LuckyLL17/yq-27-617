import { Difficulty } from '@/types';

export interface DifficultyConfig {
  label: string;
  className: string;
  desc?: string;
}

export const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: '简单',
    className: 'bg-green-500/10 text-green-400 border-green-500/20',
    desc: '入门级题目，适合热身',
  },
  medium: {
    label: '中等',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    desc: '常见面试题，重点掌握',
  },
  hard: {
    label: '困难',
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
    desc: '深度题目，挑战极限',
  },
};

export const difficultyOptions = [
  { value: 'all', label: '全部难度', desc: '随机抽取各种难度题目' },
  { value: 'easy', label: difficultyConfig.easy.label, desc: difficultyConfig.easy.desc },
  { value: 'medium', label: difficultyConfig.medium.label, desc: difficultyConfig.medium.desc },
  { value: 'hard', label: difficultyConfig.hard.label, desc: difficultyConfig.hard.desc },
];

export const allDifficultyConfig: Record<string, DifficultyConfig> = {
  all: {
    label: '全部',
    className: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  ...difficultyConfig,
};
