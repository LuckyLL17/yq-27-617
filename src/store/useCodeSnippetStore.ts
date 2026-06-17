import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CodeSnippet, SupportedLanguage } from '@/types';

/**
 * 代码片段 Store
 * 使用 zustand + persist 中间件实现代码片段的本地存储
 */
interface CodeSnippetState {
  /** 保存的代码片段列表 */
  snippets: CodeSnippet[];
  
  /** 当前选中的代码片段 ID */
  currentSnippetId: string | null;

  /**
   * 保存新的代码片段
   * @param title 标题
   * @param code 代码内容
   * @param language 编程语言
   * @returns 新创建的代码片段
   */
  saveSnippet: (title: string, code: string, language: SupportedLanguage) => CodeSnippet;

  /**
   * 更新已有的代码片段
   * @param id 片段 ID
   * @param updates 更新内容
   */
  updateSnippet: (id: string, updates: Partial<Pick<CodeSnippet, 'title' | 'code' | 'language'>>) => void;

  /**
   * 删除代码片段
   * @param id 片段 ID
   */
  deleteSnippet: (id: string) => void;

  /**
   * 根据 ID 获取代码片段
   * @param id 片段 ID
   * @returns 代码片段或 undefined
   */
  getSnippet: (id: string) => CodeSnippet | undefined;

  /**
   * 设置当前选中的代码片段
   * @param id 片段 ID
   */
  setCurrentSnippet: (id: string | null) => void;

  /**
   * 获取当前选中的代码片段
   * @returns 当前代码片段或 null
   */
  getCurrentSnippet: () => CodeSnippet | null;

  /**
   * 按语言筛选代码片段
   * @param language 编程语言
   * @returns 筛选后的代码片段列表
   */
  getSnippetsByLanguage: (language: SupportedLanguage) => CodeSnippet[];
}

/**
 * 生成唯一 ID
 */
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const useCodeSnippetStore = create<CodeSnippetState>()(
  persist(
    (set, get) => ({
      snippets: [],
      currentSnippetId: null,

      saveSnippet: (title, code, language) => {
        const newSnippet: CodeSnippet = {
          id: generateId(),
          title,
          code,
          language,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set((state) => ({
          snippets: [newSnippet, ...state.snippets],
          currentSnippetId: newSnippet.id,
        }));
        
        return newSnippet;
      },

      updateSnippet: (id, updates) => {
        set((state) => ({
          snippets: state.snippets.map((snippet) =>
            snippet.id === id
              ? { ...snippet, ...updates, updatedAt: Date.now() }
              : snippet
          ),
        }));
      },

      deleteSnippet: (id) => {
        set((state) => ({
          snippets: state.snippets.filter((snippet) => snippet.id !== id),
          currentSnippetId: state.currentSnippetId === id ? null : state.currentSnippetId,
        }));
      },

      getSnippet: (id) => {
        return get().snippets.find((s) => s.id === id);
      },

      setCurrentSnippet: (id) => {
        set({ currentSnippetId: id });
      },

      getCurrentSnippet: () => {
        const { currentSnippetId, snippets } = get();
        if (!currentSnippetId) return null;
        return snippets.find((s) => s.id === currentSnippetId) || null;
      },

      getSnippetsByLanguage: (language) => {
        return get().snippets.filter((s) => s.language === language);
      },
    }),
    {
      name: 'code-snippets-storage',
    }
  )
);
