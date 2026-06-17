export interface ScoreDetail {
  totalScore: number;
  keywordScore: number;
  structureScore: number;
  depthScore: number;
  completenessScore: number;
  matchedKeywords: string[];
  missedKeywords: string[];
  level: 'excellent' | 'good' | 'pass' | 'fail';
}

import { scoringWeights, passScore } from '@/config';

function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const cnPattern = /[\u4e00-\u9fa5]{2,}/g;
  const enPattern = /[a-zA-Z][a-zA-Z0-9_-]{1,}/g;
  const cnWords = lower.match(cnPattern) || [];
  const enWords = lower.match(enPattern) || [];
  return [...new Set([...cnWords, ...enWords])];
}

function extractCoreKeywords(solution: string): string[] {
  const keywords: string[] = [];
  const lines = solution.split('\n');

  for (const line of lines) {
    if (line.startsWith('**') && line.endsWith('**')) {
      const title = line.replace(/\*\*/g, '').toLowerCase().trim();
      if (title.length >= 2) {
        keywords.push(title);
      }
    }
    const boldMatches = line.match(/\*\*([^*]+)\*\*/g);
    if (boldMatches) {
      for (const match of boldMatches) {
        const word = match.replace(/\*\*/g, '').toLowerCase().trim();
        if (word.length >= 2 && word.length <= 20) {
          keywords.push(word);
        }
      }
    }
  }

  const allWords = extractKeywords(solution);
  const wordFreq: Record<string, number> = {};
  for (const word of allWords) {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  }
  const highFreqWords = Object.entries(wordFreq)
    .filter(([, count]) => count >= 2)
    .map(([word]) => word);

  return [...new Set([...keywords, ...highFreqWords])].filter(w => w.length >= 2);
}

function calculateKeywordScore(
  userAnswer: string,
  solution: string
): { score: number; matched: string[]; missed: string[]; total: number } {
  const coreKeywords = extractCoreKeywords(solution);
  const userWords = new Set(extractKeywords(userAnswer));

  const matched: string[] = [];
  const missed: string[] = [];

  for (const keyword of coreKeywords) {
    if (userWords.has(keyword)) {
      matched.push(keyword);
    } else {
      let hasPartial = false;
      for (const userWord of userWords) {
        if (keyword.includes(userWord) || userWord.includes(keyword)) {
          hasPartial = true;
          break;
        }
      }
      if (hasPartial) {
        matched.push(keyword + '(部分)');
      } else {
        missed.push(keyword);
      }
    }
  }

  const total = coreKeywords.length;
  const matchCount = matched.filter(m => !m.includes('(部分)')).length;
  const partialCount = matched.filter(m => m.includes('(部分)')).length;
  const score = total > 0
    ? Math.round(((matchCount + partialCount * 0.5) / total) * 100)
    : 0;

  return { score: Math.min(score, 100), matched, missed, total };
}

function calculateStructureScore(userAnswer: string): number {
  if (!userAnswer.trim()) return 0;

  let score = 40;

  const hasNumberedList = /^\d+\./m.test(userAnswer);
  const hasDashList = /^[-•]\s/m.test(userAnswer);
  const hasNewlineStructure = userAnswer.split('\n').filter(l => l.trim()).length >= 3;

  if (hasNumberedList) score += 25;
  if (hasDashList) score += 15;
  if (hasNewlineStructure) score += 20;

  const paragraphs = userAnswer.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length >= 2) score += 10;
  if (paragraphs.length >= 4) score += 5;

  return Math.min(score, 100);
}

function calculateDepthScore(
  userAnswer: string,
  solution: string
): number {
  if (!userAnswer.trim()) return 0;

  let score = 30;

  const userLength = userAnswer.length;
  const solutionLength = solution.length;
  const lengthRatio = userLength / solutionLength;

  if (lengthRatio >= 0.2) score += 10;
  if (lengthRatio >= 0.4) score += 15;
  if (lengthRatio >= 0.6) score += 15;
  if (lengthRatio >= 0.8) score += 10;
  if (lengthRatio >= 1.2) score += 5;
  if (lengthRatio > 1.5) score = Math.max(score - 10, 30);

  const userLines = userAnswer.split('\n').filter(l => l.trim()).length;
  const solutionLines = solution.split('\n').filter(l => l.trim()).length;
  const lineRatio = solutionLines > 0 ? userLines / solutionLines : 0;

  if (lineRatio >= 0.3) score += 5;
  if (lineRatio >= 0.6) score += 5;
  if (lineRatio >= 0.9) score += 5;

  return Math.min(score, 100);
}

function calculateCompletenessScore(
  userAnswer: string,
  questionContent: string
): number {
  if (!userAnswer.trim()) return 0;

  let score = 50;

  const questionPoints = questionContent
    .replace(/[？?。；;]/g, '\n')
    .split('\n')
    .filter(l => l.trim() && l.trim().length > 5);

  const userLower = userAnswer.toLowerCase();

  for (const point of questionPoints) {
    const pointLower = point.toLowerCase().trim();
    const keyParts = pointLower.match(/[\u4e00-\u9fa5a-zA-Z]{2,}/g) || [];
    let covered = 0;
    for (const part of keyParts.slice(0, 5)) {
      if (userLower.includes(part)) {
        covered++;
      }
    }
    if (keyParts.length > 0 && covered / keyParts.length >= 0.4) {
      score += Math.floor(50 / Math.max(questionPoints.length, 1));
    }
  }

  const hasConclusion = /因此|所以|综上|总结|总的来说|结论是/.test(userLower);
  if (hasConclusion) score += 5;

  const hasExample = /例如|比如|举个例子|举例/.test(userLower);
  if (hasExample) score += 5;

  return Math.min(score, 100);
}

export function evaluateAnswerScore(
  userAnswer: string,
  standardSolution: string,
  questionContent: string
): ScoreDetail {
  if (!userAnswer.trim()) {
    return {
      totalScore: 0,
      keywordScore: 0,
      structureScore: 0,
      depthScore: 0,
      completenessScore: 0,
      matchedKeywords: [],
      missedKeywords: extractCoreKeywords(standardSolution).slice(0, 10),
      level: 'fail',
    };
  }

  const keywordResult = calculateKeywordScore(userAnswer, standardSolution);
  const structureScore = calculateStructureScore(userAnswer);
  const depthScore = calculateDepthScore(userAnswer, standardSolution);
  const completenessScore = calculateCompletenessScore(userAnswer, questionContent);

  const weights = scoringWeights;

  const totalScore = Math.round(
    keywordResult.score * weights.keyword +
    structureScore * weights.structure +
    depthScore * weights.depth +
    completenessScore * weights.completeness
  );

  let level: ScoreDetail['level'] = 'fail';
  if (totalScore >= 85) level = 'excellent';
  else if (totalScore >= 70) level = 'good';
  else if (totalScore >= passScore) level = 'pass';

  return {
    totalScore,
    keywordScore: keywordResult.score,
    structureScore,
    depthScore,
    completenessScore,
    matchedKeywords: keywordResult.matched.slice(0, 10),
    missedKeywords: keywordResult.missed.slice(0, 10),
    level,
  };
}

export function isAnswerCorrect(
  userAnswer: string,
  standardSolution: string,
  questionContent: string
): boolean {
  const result = evaluateAnswerScore(userAnswer, standardSolution, questionContent);
  return result.totalScore >= passScore;
}
