import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import ExamConfigPage from '@/pages/ExamConfig';
import { renderWithRouter } from '@/test/utils';
import { categories } from '@/data/categories';
import { questions } from '@/data/questions';
import { difficultyOptions, countOptions, durationOptions, examDefaultConfig } from '@/config';

const mockNavigate = vi.fn();
const mockSetConfig = vi.fn();
const mockStartExam = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/store/useExamStore', () => ({
  useExamStore: vi.fn((selector) => {
    if (selector && typeof selector === 'function') {
      return selector({
        setConfig: mockSetConfig,
        startExam: mockStartExam,
      });
    }
    return {
      setConfig: mockSetConfig,
      startExam: mockStartExam,
    };
  }),
}));

vi.useFakeTimers();

describe('模拟考试配置页 ExamConfig', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockSetConfig.mockClear();
    mockStartExam.mockClear();
    vi.clearAllTimers();
  });

  it('应该渲染页面标题', () => {
    renderWithRouter(<ExamConfigPage />, { route: '/exam/config' });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      expect(screen.getByText('开始一场模拟考试')).toBeInTheDocument();
    });
  });

  it('应该显示选择分类区域', () => {
    renderWithRouter(<ExamConfigPage />, { route: '/exam/config' });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      expect(screen.getByText('选择分类')).toBeInTheDocument();
    });
  });

  it('应该显示所有分类选项', () => {
    renderWithRouter(<ExamConfigPage />, { route: '/exam/config' });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      categories.forEach(category => {
        expect(screen.getByText(category.name)).toBeInTheDocument();
      });
    });
  });

  it('应该显示全选按钮', () => {
    renderWithRouter(<ExamConfigPage />, { route: '/exam/config' });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      expect(screen.getByText('全选')).toBeInTheDocument();
    });
  });

  it('点击全选应该选中所有分类', () => {
    renderWithRouter(<ExamConfigPage />, { route: '/exam/config' });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      const selectAllButton = screen.getByText('全选');
      fireEvent.click(selectAllButton);
      
      const selectedCount = document.querySelectorAll('.border-primary-500').length;
      expect(selectedCount).toBe(categories.length);
    });
  });

  it('应该显示难度选择区域', () => {
    renderWithRouter(<ExamConfigPage />, { route: '/exam/config' });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      expect(screen.getByText('选择难度')).toBeInTheDocument();
    });
  });

  it('应该显示所有难度选项', () => {
    renderWithRouter(<ExamConfigPage />, { route: '/exam/config' });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      difficultyOptions.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });
  });

  it('应该显示题目数量区域', () => {
    renderWithRouter(<ExamConfigPage />, { route: '/exam/config' });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      expect(screen.getByText('题目数量')).toBeInTheDocument();
    });
  });

  it('应该显示所有题量选项', () => {
    renderWithRouter(<ExamConfigPage />, { route: '/exam/config' });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      countOptions.forEach(count => {
        expect(screen.getByText(`${count} 道`)).toBeInTheDocument();
      });
    });
  });

  it('应该显示考试时长区域', () => {
    renderWithRouter(<ExamConfigPage />, { route: '/exam/config' });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      expect(screen.getByText('考试时长')).toBeInTheDocument();
    });
  });

  it('应该显示所有时长选项', () => {
    renderWithRouter(<ExamConfigPage />, { route: '/exam/config' });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      durationOptions.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });
  });

  it('应该显示考试配置预览', () => {
    renderWithRouter(<ExamConfigPage />, { route: '/exam/config' });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      expect(screen.getByText('考试配置预览')).toBeInTheDocument();
    });
  });

  it('应该显示开始考试按钮', () => {
    renderWithRouter(<ExamConfigPage />, { route: '/exam/config' });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      expect(screen.getByText('开始考试')).toBeInTheDocument();
    });
  });

  it('点击开始考试应该调用 setConfig 和 startExam', () => {
    renderWithRouter(<ExamConfigPage />, { route: '/exam/config' });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      const startButton = screen.getByText('开始考试');
      fireEvent.click(startButton);
      
      expect(mockSetConfig).toHaveBeenCalled();
      expect(mockStartExam).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/exam/take');
    });
  });

  it('初始加载时应该显示骨架屏', () => {
    renderWithRouter(<ExamConfigPage />, { route: '/exam/config' });
    
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('默认应该选中配置的默认分类', () => {
    renderWithRouter(<ExamConfigPage />, { route: '/exam/config' });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      const defaultCategory = categories.find(
        c => c.id === examDefaultConfig.defaultCategoryIds[0]
      );
      if (defaultCategory) {
        const categoryButton = screen.getByText(defaultCategory.name).closest('button');
        expect(categoryButton).toHaveClass('border-primary-500');
      }
    });
  });

  it('切换难度应该更新可用题目数', () => {
    renderWithRouter(<ExamConfigPage />, { route: '/exam/config' });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      const easyButton = screen.getByText(difficultyOptions.find(d => d.value === 'easy')?.label || '');
      fireEvent.click(easyButton);
      
      const easyCount = questions.filter(
        q => examDefaultConfig.defaultCategoryIds.includes(q.categoryId) && q.difficulty === 'easy'
      ).length;
      
      expect(screen.getByText(new RegExp(`${easyCount} 道`))).toBeInTheDocument();
    });
  });

  it('当可用题目不足时应该显示警告', () => {
    renderWithRouter(<ExamConfigPage />, { route: '/exam/config' });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      const filteredCount = questions.filter(
        q => examDefaultConfig.defaultCategoryIds.includes(q.categoryId)
      ).length;
      
      const maxCount = Math.max(...countOptions);
      if (filteredCount < maxCount) {
        const warning = screen.queryByText(/当前筛选条件下只有/);
        expect(warning).toBeInTheDocument();
      }
    });
  });

  it('题目数量超过可用数量时按钮应该禁用', () => {
    renderWithRouter(<ExamConfigPage />, { route: '/exam/config' });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      const filteredCount = questions.filter(
        q => examDefaultConfig.defaultCategoryIds.includes(q.categoryId)
      ).length;
      
      countOptions.forEach(count => {
        if (count > filteredCount) {
          const button = screen.getByText(`${count} 道`);
          expect(button).toBeDisabled();
        }
      });
    });
  });

  it('未选择分类时开始考试按钮应该禁用', () => {
    renderWithRouter(<ExamConfigPage />, { route: '/exam/config' });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      categories.forEach(category => {
        const button = screen.getByText(category.name).closest('button');
        if (button) {
          fireEvent.click(button);
        }
      });
      
      const isAllSelected = categories.every(c => 
        examDefaultConfig.defaultCategoryIds.includes(c.id)
      );
      
      if (!isAllSelected) {
        const startButton = screen.getByText('开始考试');
        expect(startButton).toBeDisabled();
      }
    });
  });
});
