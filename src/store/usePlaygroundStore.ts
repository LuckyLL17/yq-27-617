import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlaygroundState, PlaygroundLanguage, SavedCodeSnippet, ExecutionResult } from '@/types';

/**
 * 生成唯一ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * 各语言的默认代码模板
 */
const defaultCodeTemplates: Record<PlaygroundLanguage, string> = {
  javascript: `// JavaScript 示例代码
// 你可以在这里编写和运行 JavaScript 代码

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('斐波那契数列前10项:');
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}

const sum = [1, 2, 3, 4, 5].reduce((a, b) => a + b, 0);
console.log(\`数组求和: \${sum}\`);
`,
  python: `# Python 示例代码
# 你可以在这里编写和运行 Python 代码

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print('斐波那契数列前10项:')
for i in range(10):
    print(f'F({i}) = {fibonacci(i)}')

numbers = [1, 2, 3, 4, 5]
total = sum(numbers)
print(f'数组求和: {total}')
`,
};

interface PlaygroundStore extends PlaygroundState {
  /** 设置当前语言 */
  setLanguage: (language: PlaygroundLanguage) => void;
  /** 设置代码内容 */
  setCode: (code: string) => void;
  /** 设置执行结果 */
  setResult: (result: ExecutionResult) => void;
  /** 重置执行结果 */
  resetResult: () => void;
  /** 保存代码片段 */
  saveSnippet: (title: string) => void;
  /** 更新代码片段 */
  updateSnippet: (id: string, updates: Partial<SavedCodeSnippet>) => void;
  /** 删除代码片段 */
  deleteSnippet: (id: string) => void;
  /** 加载代码片段到编辑器 */
  loadSnippet: (id: string) => void;
  /** 设置 Python 运行时加载状态 */
  setPythonRuntimeLoaded: (loaded: boolean) => void;
}

/**
 * 在线编程功能的状态管理
 * 使用 zustand + persist 中间件，将保存的代码片段持久化到 localStorage
 */
export const usePlaygroundStore = create<PlaygroundStore>()(
  persist(
    (set, get) => ({
      language: 'javascript',
      code: defaultCodeTemplates.javascript,
      result: {
        status: 'idle',
        stdout: '',
        stderr: '',
        duration: 0,
      },
      savedSnippets: [],
      pythonRuntimeLoaded: false,

      /**
       * 设置当前编程语言
       * 切换语言时会加载对应语言的默认代码模板
       */
      setLanguage: (language) => {
        const currentCode = get().code;
        const currentLanguage = get().language;
        
        set({ language });
        
        if (currentCode === defaultCodeTemplates[currentLanguage]) {
          set({ code: defaultCodeTemplates[language] });
        }
      },

      /**
       * 设置代码内容
       */
      setCode: (code) => {
        set({ code });
      },

      /**
       * 设置执行结果
       */
      setResult: (result) => {
        set({ result });
      },

      /**
       * 重置执行结果为初始状态
       */
      resetResult: () => {
        set({
          result: {
            status: 'idle',
            stdout: '',
            stderr: '',
            duration: 0,
          },
        });
      },

      /**
       * 保存当前代码为新的代码片段
       * @param title 代码片段标题
       */
      saveSnippet: (title) => {
        const { code, language, savedSnippets } = get();
        const newSnippet: SavedCodeSnippet = {
          id: generateId(),
          title,
          language,
          code,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set({ savedSnippets: [newSnippet, ...savedSnippets] });
      },

      /**
       * 更新指定的代码片段
       * @param id 代码片段ID
       * @param updates 更新内容
       */
      updateSnippet: (id, updates) => {
        set((state) => ({
          savedSnippets: state.savedSnippets.map((snippet) =>
            snippet.id === id
              ? { ...snippet, ...updates, updatedAt: Date.now() }
              : snippet
          ),
        }));
      },

      /**
       * 删除指定的代码片段
       * @param id 代码片段ID
       */
      deleteSnippet: (id) => {
        set((state) => ({
          savedSnippets: state.savedSnippets.filter((snippet) => snippet.id !== id),
        }));
      },

      /**
       * 加载代码片段到编辑器
       * @param id 代码片段ID
       */
      loadSnippet: (id) => {
        const snippet = get().savedSnippets.find((s) => s.id === id);
        if (snippet) {
          set({
            language: snippet.language,
            code: snippet.code,
          });
        }
      },

      /**
       * 设置 Python 运行时加载状态
       */
      setPythonRuntimeLoaded: (loaded) => {
        set({ pythonRuntimeLoaded: loaded });
      },
    }),
    {
      name: 'playground-store',
      partialize: (state) => ({
        savedSnippets: state.savedSnippets,
        language: state.language,
        code: state.code,
      }),
    }
  )
);
