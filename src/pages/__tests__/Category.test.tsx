import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import Category from '@/pages/Category';
import { renderWithRouter } from '@/test/utils';
import { categories } from '@/data/categories';
import { questions } from '@/data/questions';
import { difficultyConfig } from '@/config';

const mockUseParams = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => mockUseParams(),
  };
});

vi.useFakeTimers();

describe('分类页 Category', () => {
  const testCategory = categories[0];
  const categoryQuestions = questions.filter(q => q.categoryId === testCategory.id);

  beforeEach(() => {
    mockUseParams.mockReturnValue({ categoryId: testCategory.id });
    vi.clearAllTimers();
  });

  it('应该渲染分类名称和描述', () => {
    renderWithRouter(<Category />, { route: `/category/${testCategory.id}` });
    
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    
    expect(screen.getByText(testCategory.name)).toBeInTheDocument();
    expect(screen.getByText(testCategory.description)).toBeInTheDocument();
  });

  it('应该显示题目总数', () => {
    renderWithRouter(<Category />, { route: `/category/${testCategory.id}` });
    
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    
    const countElements = screen.getAllByText(categoryQuestions.length.toString());
    expect(countElements.length).toBeGreaterThan(0);
    expect(screen.getByText('道题目')).toBeInTheDocument();
  });

  it('应该显示各难度题目数量', () => {
    renderWithRouter(<Category />, { route: `/category/${testCategory.id}` });
    
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    
    const easyCount = categoryQuestions.filter(q => q.difficulty === 'easy').length;
    const mediumCount = categoryQuestions.filter(q => q.difficulty === 'medium').length;
    const hardCount = categoryQuestions.filter(q => q.difficulty === 'hard').length;
    
    const easyElements = screen.getAllByText(easyCount.toString());
    expect(easyElements.length).toBeGreaterThan(0);
    const mediumElements = screen.getAllByText(mediumCount.toString());
    expect(mediumElements.length).toBeGreaterThan(0);
    const hardElements = screen.getAllByText(hardCount.toString());
    expect(hardElements.length).toBeGreaterThan(0);
  });

  it('应该显示难度筛选按钮', () => {
    renderWithRouter(<Category />, { route: `/category/${testCategory.id}` });
    
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    
    const allButtons = screen.getAllByText('全部');
    expect(allButtons.length).toBeGreaterThan(0);
    const easyButtons = screen.getAllByText(difficultyConfig.easy.label);
    expect(easyButtons.length).toBeGreaterThan(0);
    const mediumButtons = screen.getAllByText(difficultyConfig.medium.label);
    expect(mediumButtons.length).toBeGreaterThan(0);
    const hardButtons = screen.getAllByText(difficultyConfig.hard.label);
    expect(hardButtons.length).toBeGreaterThan(0);
  });

  it('点击难度筛选应该过滤题目', () => {
    renderWithRouter(<Category />, { route: `/category/${testCategory.id}` });
    
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    
    const easyButtons = screen.getAllByText(difficultyConfig.easy.label);
    fireEvent.click(easyButtons[0]);
    
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    
    const easyQuestions = categoryQuestions.filter(q => q.difficulty === 'easy');
    const mediumQuestions = categoryQuestions.filter(q => q.difficulty === 'medium');
    
    easyQuestions.forEach(q => {
      expect(screen.getByText(q.title)).toBeInTheDocument();
    });
    
    if (mediumQuestions.length > 0 && easyQuestions.length > 0) {
      mediumQuestions.forEach(q => {
        expect(screen.queryByText(q.title)).not.toBeInTheDocument();
      });
    }
  });

  it('应该有视图切换按钮', () => {
    renderWithRouter(<Category />, { route: `/category/${testCategory.id}` });
    
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    
    expect(screen.getByTitle('网格视图')).toBeInTheDocument();
    expect(screen.getByTitle('列表视图')).toBeInTheDocument();
  });

  it('点击视图切换应该切换显示模式', () => {
    renderWithRouter(<Category />, { route: `/category/${testCategory.id}` });
    
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    
    fireEvent.click(screen.getByTitle('列表视图'));
    
    const listContainer = document.querySelector('.grid-cols-1');
    expect(listContainer).toBeInTheDocument();
  });

  it('初始加载时应该显示骨架屏', () => {
    renderWithRouter(<Category />, { route: `/category/${testCategory.id}` });
    
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('分类不存在时应该显示错误信息', () => {
    mockUseParams.mockReturnValue({ categoryId: 'non-existent' });
    renderWithRouter(<Category />, { route: '/category/non-existent' });
    
    expect(screen.getByText('分类不存在')).toBeInTheDocument();
    expect(screen.getByText('返回首页')).toBeInTheDocument();
  });

  it('应该显示返回首页链接', () => {
    renderWithRouter(<Category />, { route: `/category/${testCategory.id}` });
    
    expect(screen.getByText('返回首页')).toBeInTheDocument();
  });

  it('没有符合条件的题目时应该显示空状态', () => {
    const hardQuestions = categoryQuestions.filter(q => q.difficulty === 'hard');
    if (hardQuestions.length === 0) {
      renderWithRouter(<Category />, { route: `/category/${testCategory.id}` });
      
      act(() => {
        vi.advanceTimersByTime(1200);
      });
      
      const hardButtons = screen.getAllByText(difficultyConfig.hard.label);
      fireEvent.click(hardButtons[0]);
      
      act(() => {
        vi.advanceTimersByTime(1200);
      });
      
      expect(screen.getByText('暂无符合条件的题目')).toBeInTheDocument();
    }
  });
});
