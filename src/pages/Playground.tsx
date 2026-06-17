import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Trash2,
  Save,
  FolderOpen,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Code2,
  ChevronDown,
} from 'lucide-react';
import { useCodeRunner } from '@/hooks/useCodeRunner';
import { useCodeStorage } from '@/hooks/useCodeStorage';
import type { SupportedLanguage, SavedCode } from '@/types';
import { highlightJavaScript, highlightPython } from '@/components/CodeBlock';

/**
 * 在线编程页面组件
 * 提供代码编辑、运行、保存等功能
 * 支持 JavaScript 和 Python 两种编程语言
 */
export default function Playground() {
  // 当前选中的编程语言
  const [language, setLanguage] = useState<SupportedLanguage>('javascript');
  // 编辑器中的代码
  const [code, setCode] = useState<string>(defaultJavaScriptCode);
  // 是否显示保存对话框
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  // 是否显示加载对话框
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  // 保存的代码名称
  const [saveName, setSaveName] = useState('');
  // 语言下拉菜单状态
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { result, runCode, clearResult } = useCodeRunner();
  const { savedCodes, saveCode, deleteCode } = useCodeStorage();

  /**
   * 语言配置信息
   */
  const languageConfig: Record<SupportedLanguage, { label: string; icon: string; defaultCode: string }> = {
    javascript: {
      label: 'JavaScript',
      icon: 'JS',
      defaultCode: defaultJavaScriptCode,
    },
    python: {
      label: 'Python',
      icon: 'PY',
      defaultCode: defaultPythonCode,
    },
  };

  /**
   * 处理代码变化
   * 同步更新高亮层和滚动位置
   */
  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
  }, []);

  /**
   * 同步滚动代码编辑器和高亮层
   */
  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current && lineNumbersRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  /**
   * 运行代码
   */
  const handleRun = useCallback(() => {
    clearResult();
    runCode(code, language);
  }, [code, language, runCode, clearResult]);

  /**
   * 清空输出
   */
  const handleClearOutput = useCallback(() => {
    clearResult();
  }, [clearResult]);

  /**
   * 切换编程语言
   */
  const handleLanguageChange = useCallback((newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
    setCode(languageConfig[newLanguage].defaultCode);
    clearResult();
    setShowLanguageMenu(false);
  }, [clearResult, languageConfig]);

  /**
   * 保存代码
   */
  const handleSave = useCallback(() => {
    if (saveName.trim()) {
      saveCode(saveName.trim(), code, language);
      setShowSaveDialog(false);
      setSaveName('');
    }
  }, [saveName, code, language, saveCode]);

  /**
   * 加载保存的代码
   */
  const handleLoad = useCallback((saved: SavedCode) => {
    setLanguage(saved.language);
    setCode(saved.code);
    setShowLoadDialog(false);
    clearResult();
  }, [clearResult]);

  /**
   * 更新行号
   */
  const lineCount = code.split('\n').length;

  /**
   * 获取高亮后的代码
   */
  const getHighlightedCode = useCallback(() => {
    if (language === 'javascript') {
      return highlightJavaScript(code);
    } else if (language === 'python') {
      return highlightPython(code);
    }
    return code;
  }, [code, language]);

  /**
   * 自动滚动输出到底部
   */
  useEffect(() => {
    if (outputRef.current && result.output.length > 0) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [result.output]);

  /**
   * 点击外部关闭语言选择菜单
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * 处理 Tab 键缩进
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      // 设置光标位置
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
    // Ctrl/Cmd + Enter 运行代码
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
  }, [code, handleRun]);

  /**
   * 获取状态显示信息
   */
  const getStatusInfo = () => {
    switch (result.status) {
      case 'running':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />,
          text: '运行中...',
          color: 'text-yellow-400',
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-400" />,
          text: `运行成功 (${result.duration}ms)`,
          color: 'text-green-400',
        };
      case 'error':
        return {
          icon: <XCircle className="w-4 h-4 text-red-400" />,
          text: '运行出错',
          color: 'text-red-400',
        };
      default:
        return {
          icon: <Clock className="w-4 h-4 text-dark-400" />,
          text: '等待运行',
          color: 'text-dark-400',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">在线编程</h1>
              <p className="text-dark-400 text-sm">在线编辑和运行代码，支持 JavaScript 和 Python</p>
            </div>
          </div>
        </div>

        {/* 工具栏 */}
        <div className="bg-dark-800/50 border border-dark-700 rounded-t-2xl p-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* 语言选择器 */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-white transition-colors"
              >
                <span className="w-6 h-6 rounded bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white">
                  {languageConfig[language].icon}
                </span>
                <span>{languageConfig[language].label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showLanguageMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showLanguageMenu && (
                <div className="absolute top-full left-0 mt-2 bg-dark-700 border border-dark-600 rounded-lg shadow-xl overflow-hidden z-50 min-w-[160px] animate-fade-in">
                  {(Object.keys(languageConfig) as SupportedLanguage[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-dark-600 transition-colors ${
                        language === lang ? 'bg-dark-600 text-primary-400' : 'text-white'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${
                        lang === 'javascript' 
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                          : 'bg-gradient-to-br from-blue-400 to-blue-600'
                      }`}>
                        {languageConfig[lang].icon}
                      </span>
                      {languageConfig[lang].label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 状态显示 */}
            <div className={`flex items-center gap-2 text-sm ${statusInfo.color}`}>
              {statusInfo.icon}
              <span>{statusInfo.text}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 保存按钮 */}
            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">保存</span>
            </button>

            {/* 加载按钮 */}
            <button
              onClick={() => setShowLoadDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">加载</span>
            </button>

            {/* 运行按钮 */}
            <button
              onClick={handleRun}
              disabled={result.status === 'running'}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>运行</span>
            </button>
          </div>
        </div>

        {/* 代码编辑器和输出面板 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-x border-b border-dark-700 rounded-b-2xl overflow-hidden">
          {/* 代码编辑器 */}
          <div className="border-r border-dark-700">
            <div className="bg-dark-800 px-4 py-2 border-b border-dark-700 flex items-center justify-between">
              <span className="text-sm text-dark-400">代码编辑器</span>
              <span className="text-xs text-dark-500">Ctrl+Enter 运行</span>
            </div>
            <div className="relative h-[500px] bg-dark-900 flex">
              {/* 行号 */}
              <div
                ref={lineNumbersRef}
                className="select-none text-right pr-3 pl-4 py-4 text-dark-500 text-sm bg-dark-800/50 border-r border-dark-700 font-mono leading-6 overflow-hidden"
              >
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i} className="leading-6">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* 代码编辑区域 */}
              <div className="flex-1 relative">
                {/* 语法高亮层（底层，显示彩色代码） */}
                <pre
                  ref={highlightRef}
                  className="absolute inset-0 p-4 m-0 text-sm font-mono leading-6 pointer-events-none overflow-auto"
                  aria-hidden="true"
                >
                  <code
                    dangerouslySetInnerHTML={{
                      __html: getHighlightedCode() + '\n',
                    }}
                  />
                </pre>

                {/* 实际输入框（上层，文字透明，光标可见） */}
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={handleCodeChange}
                  onScroll={handleScroll}
                  onKeyDown={handleKeyDown}
                  spellCheck={false}
                  className="absolute inset-0 w-full h-full p-4 m-0 text-sm font-mono leading-6 bg-transparent text-transparent resize-none outline-none caret-white selection:bg-primary-500/30"
                  style={{ tabSize: 2, WebkitTextFillColor: 'transparent' }}
                />
              </div>
            </div>
          </div>

          {/* 输出面板 */}
          <div>
            <div className="bg-dark-800 px-4 py-2 border-b border-dark-700 flex items-center justify-between">
              <span className="text-sm text-dark-400">输出结果</span>
              <button
                onClick={handleClearOutput}
                className="text-xs text-dark-500 hover:text-dark-300 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                清空
              </button>
            </div>
            <div
              ref={outputRef}
              className="h-[500px] overflow-auto p-4 bg-dark-900 font-mono text-sm"
            >
              {result.output.length === 0 ? (
                <div className="text-dark-500 text-center py-8">
                  <p>点击运行按钮或按 Ctrl+Enter 执行代码</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {result.output.map((line, index) => (
                    <div
                      key={index}
                      className={`leading-6 whitespace-pre-wrap break-all ${
                        line.type === 'error'
                          ? 'text-red-400'
                          : line.type === 'warn'
                          ? 'text-yellow-400'
                          : line.type === 'info'
                          ? 'text-blue-400'
                          : line.type === 'result'
                          ? 'text-cyan-400'
                          : 'text-dark-200'
                      }`}
                    >
                      {line.content}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 保存对话框 */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 w-full max-w-md animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">保存代码</h3>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="text-dark-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-2">代码名称</label>
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="请输入代码片段名称"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder:text-dark-500 focus:outline-none focus:border-primary-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave();
                    }}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowSaveDialog(false)}
                    className="px-4 py-2 text-dark-300 hover:text-white transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!saveName.trim()}
                    className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 加载对话框 */}
        {showLoadDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 w-full max-w-md max-h-[80vh] flex flex-col animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">加载代码</h3>
                <button
                  onClick={() => setShowLoadDialog(false)}
                  className="text-dark-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto space-y-2">
                {savedCodes.length === 0 ? (
                  <div className="text-center py-8 text-dark-500">
                    暂无保存的代码片段
                  </div>
                ) : (
                  savedCodes.map((saved) => (
                    <div
                      key={saved.id}
                      className="p-4 bg-dark-700/50 hover:bg-dark-700 rounded-lg cursor-pointer transition-colors group"
                      onClick={() => handleLoad(saved)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium">{saved.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            saved.language === 'javascript'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {languageConfig[saved.language].label}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCode(saved.id);
                            }}
                            className="text-dark-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-dark-400">
                        更新于 {new Date(saved.updatedAt).toLocaleString('zh-CN')}
                      </div>
                      <div className="mt-2 text-sm text-dark-500 font-mono truncate">
                        {saved.code.split('\n')[0]}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * JavaScript 默认示例代码
 */
const defaultJavaScriptCode = `// JavaScript 示例 - 计算斐波那契数列
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('斐波那契数列前10项:');
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}

// 数组操作示例
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log('\\n原数组:', numbers);
console.log('翻倍后:', doubled);
console.log('求和:', numbers.reduce((a, b) => a + b, 0));

// 对象示例
const user = {
  name: '张三',
  age: 25,
  skills: ['JavaScript', 'TypeScript', 'React']
};
console.log('\\n用户信息:', user);
`;

/**
 * Python 默认示例代码
 */
const defaultPythonCode = `# Python 示例 - 计算斐波那契数列
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print('斐波那契数列前10项:')
for i in range(10):
    print(f'F({i}) = {fibonacci(i)}')

# 列表操作示例
numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print('\\n原数组:', numbers)
print('翻倍后:', doubled)
print('求和:', sum(numbers))

# 字典示例
user = {
    'name': '张三',
    'age': 25,
    'skills': ['Python', 'JavaScript', 'React']
}
print('\\n用户信息:', user)
`;
