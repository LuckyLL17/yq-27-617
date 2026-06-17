export const countOptions = [5, 10, 15, 20, 30];

export const durationOptions = [
  { value: 10, label: '10分钟' },
  { value: 20, label: '20分钟' },
  { value: 30, label: '30分钟' },
  { value: 45, label: '45分钟' },
  { value: 60, label: '60分钟' },
];

export const examDefaultConfig = {
  defaultCategoryIds: ['java'],
  defaultDifficulty: 'all' as const,
  defaultQuestionCount: 10,
  defaultDuration: 30,
};

export const timeWarningThreshold = 300;
