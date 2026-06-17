export type ScoreLevel = 'excellent' | 'good' | 'pass' | 'fail';

export interface ScoreLevelConfig {
  label: string;
  color: string;
  bg: string;
  border?: string;
}

export const scoreLevelConfig: Record<ScoreLevel, ScoreLevelConfig> = {
  excellent: {
    label: '优秀',
    color: 'text-green-400',
    bg: 'bg-green-500',
  },
  good: {
    label: '良好',
    color: 'text-blue-400',
    bg: 'bg-blue-500',
  },
  pass: {
    label: '及格',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500',
  },
  fail: {
    label: '不及格',
    color: 'text-red-400',
    bg: 'bg-red-500',
  },
};

export interface ScoreLevelThreshold {
  label: string;
  color: string;
  bg: string;
  border: string;
  minScore: number;
}

export const scoreLevelThresholds: ScoreLevelThreshold[] = [
  {
    label: '优秀',
    color: 'text-green-400',
    bg: 'from-green-500/20 to-emerald-500/20',
    border: 'border-green-500/30',
    minScore: 90,
  },
  {
    label: '良好',
    color: 'text-blue-400',
    bg: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    minScore: 70,
  },
  {
    label: '及格',
    color: 'text-yellow-400',
    bg: 'from-yellow-500/20 to-orange-500/20',
    border: 'border-yellow-500/30',
    minScore: 60,
  },
  {
    label: '需加油',
    color: 'text-red-400',
    bg: 'from-red-500/20 to-pink-500/20',
    border: 'border-red-500/30',
    minScore: 0,
  },
];

export function getScoreLevel(score: number): ScoreLevelThreshold {
  for (const level of scoreLevelThresholds) {
    if (score >= level.minScore) {
      return level;
    }
  }
  return scoreLevelThresholds[scoreLevelThresholds.length - 1];
}

export const scoringWeights = {
  keyword: 0.4,
  structure: 0.2,
  depth: 0.2,
  completeness: 0.2,
};

export const passScore = 60;
