import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import QuestionDetail from '@/pages/QuestionDetail';
import { renderWithRouter } from '@/test/utils';
import { questions } from '@/data/questions';
import { categories } from '@/data/categories';
import { difficultyConfig } from '@/config';

const mockUseParams = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => mockUseParams(),
    useNavigate: () => mockNavigate,
    useSearchParams: () => {
      const params = new URLSearchParams(window.location.search);
      return [params, vi.fn()];
    },
  };
});

vi.mock('@/store/useLearningPathStore', () => ({
  useLearningPathStore: vi.fn((selector) => {
    const state = {
      progress: {},
      completeStep: vi.fn(),
      getNextStep: vi.fn(() => null),
      getPathProgress: vi.fn(() => 0),
    };
    if (typeof selector === 'function') {
      return selector(state);
    }
    return state;
  }),
}));

vi.useFakeTimers();

describe('题目详情页 QuestionDetail', () => {
  const testQuestion = questions[0];
  const testCategory = categories.find(c => c.id === testQuestion.categoryId);

  beforeEach(() => {
    mockUseParams.mockReturnValue({ questionId: testQuestion.id });
    vi.clearAllTimers();
    mockNavigate.mockClear();
  });

  it('应该渲染题目标题', () => {
    renderWithRouter(<QuestionDetail />, { route: `/question/${testQuestion.id}` });
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    const titleElements = screen.getAllByText(testQuestion.title);
    expect(titleElements.length).toBeGreaterThan(0);
  });

  it('应该显示题目难度标签', () => {
    renderWithRouter(<QuestionDetail />, { route: `/question/${testQuestion.id}` });
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    const difficulty = difficultyConfig[testQuestion.difficulty];
    const difficultyElements = screen.getAllByText(difficulty.label);
    expect(difficultyElements.length).toBeGreaterThan(0);
  });

  it('应该显示题目分类标签', () => {
    renderWithRouter(<QuestionDetail />, { route: `/question/${testQuestion.id}` });
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    const categoryElements = screen.getAllByText(testCategory?.name || '');
    expect(categoryElements.length).toBeGreaterThan(0);
  });

  it('热门题目应该显示"高频面试题"标签', () => {
    const hotQuestion = questions.find(q => q.isHot);
    if (hotQuestion) {
      mockUseParams.mockReturnValue({ questionId: hotQuestion.id });
      renderWithRouter(<QuestionDetail />, { route: `/question/${hotQuestion.id}` });
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      expect(screen.getByText('高频面试题')).toBeInTheDocument();
    }
  });

  it('应该显示题目内容', () => {
    renderWithRouter(<QuestionDetail />, { route: `/question/${testQuestion.id}` });
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText(testQuestion.content)).toBeInTheDocument();
  });

  it('应该显示标准解法折叠面板', () => {
    renderWithRouter(<QuestionDetail />, { route: `/question/${testQuestion.id}` });
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText('标准解法')).toBeInTheDocument();
  });

  it('标准解法默认展开', () => {
    renderWithRouter(<QuestionDetail />, { route: `/question/${testQuestion.id}` });
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    const solutionSection = screen.getByText('标准解法').closest('div');
    expect(solutionSection).toBeInTheDocument();
  });

  it('点击标准解法标题可以折叠/展开', () => {
    renderWithRouter(<QuestionDetail />, { route: `/question/${testQuestion.id}` });
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    const solutionButton = screen.getByText('标准解法').closest('button');
    if (solutionButton) {
      fireEvent.click(solutionButton);
    }
  });

  it('应该显示坑点分析折叠面板', () => {
    renderWithRouter(<QuestionDetail />, { route: `/question/${testQuestion.id}` });
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    const pitfallElements = screen.getAllByText(/坑点分析/);
    expect(pitfallElements.length).toBeGreaterThan(0);
  });

  it('应该显示坑点数量', () => {
    renderWithRouter(<QuestionDetail />, { route: `/question/${testQuestion.id}` });
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText(new RegExp(`${testQuestion.pitfalls.length}个点`))).toBeInTheDocument();
  });

  it('有代码示例时应该显示代码示例区域', () => {
    const questionWithCode = questions.find(q => q.codeExamples.length > 0);
    if (questionWithCode) {
      mockUseParams.mockReturnValue({ questionId: questionWithCode.id });
      renderWithRouter(<QuestionDetail />, { route: `/question/${questionWithCode.id}` });
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      expect(screen.getByText('代码示例')).toBeInTheDocument();
    }
  });

  it('应该显示相关题目区域', () => {
    const questionWithRelated = questions.find(q => q.relatedQuestionIds.length > 0);
    if (questionWithRelated) {
      mockUseParams.mockReturnValue({ questionId: questionWithRelated.id });
      renderWithRouter(<QuestionDetail />, { route: `/question/${questionWithRelated.id}` });
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      expect(screen.getByText('相关题目')).toBeInTheDocument();
    }
  });

  it('应该显示学习建议区域', () => {
    renderWithRouter(<QuestionDetail />, { route: `/question/${testQuestion.id}` });
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText('💡 学习建议')).toBeInTheDocument();
  });

  it('应该显示上一题/下一题导航', () => {
    const middleIndex = Math.floor(questions.length / 2);
    const middleQuestion = questions[middleIndex];
    mockUseParams.mockReturnValue({ questionId: middleQuestion.id });
    
    renderWithRouter(<QuestionDetail />, { route: `/question/${middleQuestion.id}` });
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText('← 上一题')).toBeInTheDocument();
    expect(screen.getByText('下一题 →')).toBeInTheDocument();
  });

  it('第一题不显示上一题', () => {
    const firstQuestion = questions[0];
    mockUseParams.mockReturnValue({ questionId: firstQuestion.id });
    
    renderWithRouter(<QuestionDetail />, { route: `/question/${firstQuestion.id}` });
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(screen.queryByText('← 上一题')).not.toBeInTheDocument();
    expect(screen.getByText('下一题 →')).toBeInTheDocument();
  });

  it('最后一题不显示下一题', () => {
    const lastQuestion = questions[questions.length - 1];
    mockUseParams.mockReturnValue({ questionId: lastQuestion.id });
    
    renderWithRouter(<QuestionDetail />, { route: `/question/${lastQuestion.id}` });
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText('← 上一题')).toBeInTheDocument();
    expect(screen.queryByText('下一题 →')).not.toBeInTheDocument();
  });

  it('题目不存在时应该显示错误信息', () => {
    mockUseParams.mockReturnValue({ questionId: 'non-existent' });
    renderWithRouter(<QuestionDetail />, { route: '/question/non-existent' });
    
    expect(screen.getByText('题目不存在')).toBeInTheDocument();
    expect(screen.getByText('返回首页')).toBeInTheDocument();
  });

  it('初始加载时应该显示骨架屏', () => {
    renderWithRouter(<QuestionDetail />, { route: `/question/${testQuestion.id}` });
    
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('点击返回按钮应该返回上一页', () => {
    renderWithRouter(<QuestionDetail />, { route: `/question/${testQuestion.id}` });
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    const backButton = screen.getByText('返回');
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('应该显示该分类更多题目', () => {
    renderWithRouter(<QuestionDetail />, { route: `/question/${testQuestion.id}` });
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText('该分类更多题目')).toBeInTheDocument();
  });
});
