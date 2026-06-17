import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CodeLanguage, SavedCodeSnippet } from '@/types';

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

interface CodeStoreState {
  /** 当前选中的编程语言 */
  currentLanguage: CodeLanguage;
  /** 当前编辑器中的代码内容 */
  currentCode: string;
  /** 已保存的代码片段列表 */
  savedSnippets: SavedCodeSnippet[];
  /** 当前加载的代码片段 ID（用于标识是否在编辑已保存的代码） */
  activeSnippetId: string | null;

  /** 切换编程语言 */
  setLanguage: (language: CodeLanguage) => void;
  /** 更新当前代码内容 */
  setCurrentCode: (code: string) => void;
  /** 保存当前代码为代码片段 */
  saveSnippet: (title: string) => void;
  /** 更新已保存的代码片段 */
  updateSnippet: (id: string, title?: string, code?: string) => void;
  /** 删除代码片段 */
  deleteSnippet: (id: string) => void;
  /** 加载代码片段到编辑器 */
  loadSnippet: (id: string) => void;
  /** 清空编辑器，重置为默认代码 */
  clearEditor: (defaultCode: string) => void;
}

export const useCodeStore = create<CodeStoreState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'javascript',
      currentCode: '',
      savedSnippets: [],
      activeSnippetId: null,

      setLanguage: (language) => {
        set({ currentLanguage: language, activeSnippetId: null });
      },

      setCurrentCode: (code) => {
        set({ currentCode: code });
      },

      saveSnippet: (title) => {
        const { currentCode, currentLanguage, savedSnippets, activeSnippetId } = get();

        /* 如果当前正在编辑已保存的代码片段，则更新它 */
        if (activeSnippetId) {
          const existing = savedSnippets.find((s) => s.id === activeSnippetId);
          if (existing) {
            set({
              savedSnippets: savedSnippets.map((s) =>
                s.id === activeSnippetId
                  ? { ...s, title, code: currentCode, updatedAt: Date.now() }
                  : s
              ),
            });
            return;
          }
        }

        /* 否则创建新的代码片段 */
        const snippet: SavedCodeSnippet = {
          id: generateId(),
          title,
          language: currentLanguage,
          code: currentCode,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set({
          savedSnippets: [snippet, ...savedSnippets],
          activeSnippetId: snippet.id,
        });
      },

      updateSnippet: (id, title, code) => {
        set((state) => ({
          savedSnippets: state.savedSnippets.map((s) =>
            s.id === id
              ? {
                  ...s,
                  ...(title !== undefined && { title }),
                  ...(code !== undefined && { code }),
                  updatedAt: Date.now(),
                }
              : s
          ),
        }));
      },

      deleteSnippet: (id) => {
        const { activeSnippetId } = get();
        set((state) => ({
          savedSnippets: state.savedSnippets.filter((s) => s.id !== id),
          /* 如果删除的是当前激活的代码片段，清除激活状态 */
          activeSnippetId: activeSnippetId === id ? null : activeSnippetId,
        }));
      },

      loadSnippet: (id) => {
        const snippet = get().savedSnippets.find((s) => s.id === id);
        if (snippet) {
          set({
            currentCode: snippet.code,
            currentLanguage: snippet.language,
            activeSnippetId: snippet.id,
          });
        }
      },

      clearEditor: (defaultCode) => {
        set({
          currentCode: defaultCode,
          activeSnippetId: null,
        });
      },
    }),
    {
      name: 'code-playground-store',
      /* 持久化保存代码片段和语言偏好 */
      partialize: (state) => ({
        savedSnippets: state.savedSnippets,
        currentLanguage: state.currentLanguage,
      }),
    }
  )
);
