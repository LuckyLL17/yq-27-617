import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import Home from '@/pages/Home';
import { renderWithRouter } from '@/test/utils';
import { categories } from '@/data/categories';
import { questions } from '@/data/questions';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.useFakeTimers();

describe('首页 Home', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.clearAllTimers();
  });

  it('应该渲染首页标题和副标题', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('程序员面试题库')).toBeInTheDocument();
    expect(screen.getByText('不只是背题，更懂原理')).toBeInTheDocument();
  });

  it('应该显示搜索框和搜索按钮', () => {
    renderWithRouter(<Home />);
    
    const searchInput = screen.getByPlaceholderText('搜索题目，如：HashMap、索引、缓存击穿...');
    expect(searchInput).toBeInTheDocument();
    
    const searchButton = screen.getByRole('button', { name: '搜索' });
    expect(searchButton).toBeInTheDocument();
  });

  it('应该显示热门搜索标签', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('热门搜索：')).toBeInTheDocument();
    expect(screen.getByText('HashMap')).toBeInTheDocument();
    expect(screen.getByText('索引')).toBeInTheDocument();
    expect(screen.getByText('缓存击穿')).toBeInTheDocument();
  });

  it('点击热门搜索标签应该跳转到搜索页面', () => {
    renderWithRouter(<Home />);
    
    const tagButton = screen.getByText('HashMap');
    fireEvent.click(tagButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=HashMap');
  });

  it('提交搜索表单应该跳转到搜索页面', () => {
    renderWithRouter(<Home />);
    
    const searchInput = screen.getByPlaceholderText('搜索题目，如：HashMap、索引、缓存击穿...');
    fireEvent.change(searchInput, { target: { value: '测试搜索' } });
    
    const searchButton = screen.getByRole('button', { name: '搜索' });
    fireEvent.click(searchButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=%E6%B5%8B%E8%AF%95%E6%90%9C%E7%B4%A2');
  });

  it('空搜索不应该跳转', () => {
    renderWithRouter(<Home />);
    
    const searchButton = screen.getByRole('button', { name: '搜索' });
    fireEvent.click(searchButton);
    
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('应该显示模拟考试入口', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('模拟考试')).toBeInTheDocument();
    expect(screen.getByText('开始考试')).toBeInTheDocument();
  });

  it('点击模拟考试入口应该跳转到考试配置页', () => {
    renderWithRouter(<Home />);
    
    const examSection = screen.getByText('模拟考试').closest('div[class*="group"]');
    if (examSection) {
      fireEvent.click(examSection);
    }
    
    expect(mockNavigate).toHaveBeenCalledWith('/exam/config');
  });

  it('初始加载时应该显示骨架屏', () => {
    renderWithRouter(<Home />);
    
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('加载完成后应该显示数据统计卡片', () => {
    renderWithRouter(<Home />);
    
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    
    expect(screen.getByText('题目总数')).toBeInTheDocument();
    expect(screen.getByText('技术方向')).toBeInTheDocument();
    expect(screen.getByText('坑点分析')).toBeInTheDocument();
    expect(screen.getByText('持续更新')).toBeInTheDocument();
  });

  it('加载完成后应该显示分类卡片', () => {
    renderWithRouter(<Home />);
    
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    
    categories.forEach(category => {
      const categoryElements = screen.getAllByText(category.name);
      expect(categoryElements.length).toBeGreaterThan(0);
    });
  });

  it('加载完成后应该显示热门题目', () => {
    renderWithRouter(<Home />);
    
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    
    const hotQuestions = questions.filter(q => q.isHot).slice(0, 6);
    hotQuestions.forEach(question => {
      expect(screen.getByText(question.title)).toBeInTheDocument();
    });
  });

  it('应该显示学习路线区域', () => {
    renderWithRouter(<Home />);
    
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    
    expect(screen.getByText('🎯 学习路线')).toBeInTheDocument();
    expect(screen.getByText('查看全部')).toBeInTheDocument();
  });

  it('点击查看全部学习路线应该跳转到学习路线列表', () => {
    renderWithRouter(<Home />);
    
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    
    const viewAllButtons = screen.getAllByText('查看全部');
    if (viewAllButtons.length > 0) {
      fireEvent.click(viewAllButtons[0]);
    }
    
    expect(mockNavigate).toHaveBeenCalledWith('/learning-paths');
  });
});
