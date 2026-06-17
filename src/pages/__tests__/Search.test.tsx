import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import SearchPage from '@/pages/Search';
import { renderWithRouter } from '@/test/utils';
import { questions } from '@/data/questions';
import { categories } from '@/data/categories';

const mockSetSearchParams = vi.fn();
const mockUseSearchParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => {
      const result = mockUseSearchParams();
      return [result, mockSetSearchParams];
    },
  };
});

vi.useFakeTimers();

describe('搜索页 SearchPage', () => {
  const testQuery = 'HashMap';
  
  beforeEach(() => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams({ q: testQuery }));
    mockSetSearchParams.mockClear();
    vi.clearAllTimers();
  });

  it('应该显示搜索结果标题', () => {
    renderWithRouter(<SearchPage />, { route: `/search?q=${testQuery}` });
    
    expect(screen.getByText('搜索结果：')).toBeInTheDocument();
    expect(screen.getByText(`"${testQuery}"`)).toBeInTheDocument();
  });

  it('应该显示搜索结果数量', () => {
    renderWithRouter(<SearchPage />, { route: `/search?q=${testQuery}` });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      const lowerQuery = testQuery.toLowerCase();
      const expectedCount = questions.filter(
        (q) =>
          q.title.toLowerCase().includes(lowerQuery) ||
          q.content.toLowerCase().includes(lowerQuery) ||
          q.standardSolution.toLowerCase().includes(lowerQuery) ||
          q.pitfalls.some(
            (p) =>
              p.title.toLowerCase().includes(lowerQuery) ||
              p.description.toLowerCase().includes(lowerQuery)
          )
      ).length;
      
      expect(screen.getByText(`${expectedCount} 个结果`)).toBeInTheDocument();
    });
  });

  it('应该显示搜索输入框', () => {
    renderWithRouter(<SearchPage />, { route: `/search?q=${testQuery}` });
    
    const searchInput = screen.getByPlaceholderText('输入关键词搜索题目、解法、坑点...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue(testQuery);
  });

  it('提交搜索应该更新搜索参数', () => {
    renderWithRouter(<SearchPage />, { route: `/search?q=${testQuery}` });
    
    const searchInput = screen.getByPlaceholderText('输入关键词搜索题目、解法、坑点...');
    fireEvent.change(searchInput, { target: { value: '新搜索词' } });
    
    const form = searchInput.closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    expect(mockSetSearchParams).toHaveBeenCalledWith({ q: '新搜索词' });
  });

  it('空搜索不应该更新参数', () => {
    renderWithRouter(<SearchPage />, { route: `/search?q=${testQuery}` });
    
    const searchInput = screen.getByPlaceholderText('输入关键词搜索题目、解法、坑点...');
    fireEvent.change(searchInput, { target: { value: '' } });
    
    const form = searchInput.closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    expect(mockSetSearchParams).not.toHaveBeenCalled();
  });

  it('有搜索结果时应该显示题目卡片', () => {
    renderWithRouter(<SearchPage />, { route: `/search?q=${testQuery}` });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      const lowerQuery = testQuery.toLowerCase();
      const results = questions.filter(
        (q) =>
          q.title.toLowerCase().includes(lowerQuery) ||
          q.content.toLowerCase().includes(lowerQuery) ||
          q.standardSolution.toLowerCase().includes(lowerQuery) ||
          q.pitfalls.some(
            (p) =>
              p.title.toLowerCase().includes(lowerQuery) ||
              p.description.toLowerCase().includes(lowerQuery)
          )
      );
      
      results.forEach(question => {
        expect(screen.getByText(question.title)).toBeInTheDocument();
      });
    });
  });

  it('没有搜索结果时应该显示空状态', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams({ q: '不存在的关键词xyz123' }));
    renderWithRouter(<SearchPage />, { route: '/search?q=不存在的关键词xyz123' });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      expect(screen.getByText('未找到相关题目')).toBeInTheDocument();
      expect(screen.getByText('试试其他关键词，或者浏览我们的分类')).toBeInTheDocument();
    });
  });

  it('没有搜索结果时应该显示分类链接', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams({ q: '不存在的关键词xyz123' }));
    renderWithRouter(<SearchPage />, { route: '/search?q=不存在的关键词xyz123' });
    
    vi.advanceTimersByTime(1000);
    
    waitFor(() => {
      categories.forEach(category => {
        expect(screen.getByText(category.name)).toBeInTheDocument();
      });
    });
  });

  it('初始加载时应该显示骨架屏', () => {
    renderWithRouter(<SearchPage />, { route: `/search?q=${testQuery}` });
    
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('应该显示返回首页链接', () => {
    renderWithRouter(<SearchPage />, { route: `/search?q=${testQuery}` });
    
    expect(screen.getByText('返回首页')).toBeInTheDocument();
  });

  it('搜索关键词应该在标题中高亮显示', () => {
    const questionWithMatch = questions.find(q => 
      q.title.toLowerCase().includes(testQuery.toLowerCase())
    );
    
    if (questionWithMatch) {
      renderWithRouter(<SearchPage />, { route: `/search?q=${testQuery}` });
      
      vi.advanceTimersByTime(1000);
      
      waitFor(() => {
        const highlights = document.querySelectorAll('mark');
        expect(highlights.length).toBeGreaterThan(0);
      });
    }
  });

  it('空查询时不显示结果', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    renderWithRouter(<SearchPage />, { route: '/search' });
    
    waitFor(() => {
      expect(screen.queryByText('个结果')).not.toBeInTheDocument();
    });
  });
});
