import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Save,
  Trash2,
  Download,
  FolderOpen,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Terminal,
  Code2,
  X,
  ChevronDown,
} from 'lucide-react';
import { usePlaygroundStore } from '@/store/usePlaygroundStore';
import { executeCode, loadPyodideRuntime } from '@/lib/codeExecutor';
import { PlaygroundLanguage, SavedCodeSnippet } from '@/types';

/**
 * 语言选项配置
 * 包含语言标识、显示名称和图标颜色
 */
const languageOptions: { value: PlaygroundLanguage; label: string; color: string }[] = [
  { value: 'javascript', label: 'JavaScript', color: 'text-yellow-400' },
  { value: 'python', label: 'Python', color: 'text-blue-400' },
];

export default function Playground() {
  const {
    language,
    code,
    result,
    savedSnippets,
    pythonRuntimeLoaded,
    setLanguage,
    setCode,
    setResult,
    resetResult,
    saveSnippet,
    deleteSnippet,
    loadSnippet,
    setPythonRuntimeLoaded,
  } = usePlaygroundStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSnippetsModal, setShowSnippetsModal] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideInstance, setPyodideInstance] = useState<any>(null);

  /**
   * 初始化 Python 运行时
   * 当用户选择 Python 语言时，动态加载 Pyodide
   */
  useEffect(() => {
    if (language === 'python' && !pythonRuntimeLoaded && !pyodideInstance) {
      const loadPython = async () => {
        try {
          const pyodide = await loadPyodideRuntime();
          setPyodideInstance(pyodide);
          setPythonRuntimeLoaded(true);
        } catch (error) {
          console.error('加载 Python 运行时失败:', error);
        }
      };
      loadPython();
    }
  }, [language, pythonRuntimeLoaded, pyodideInstance, setPythonRuntimeLoaded]);

  /**
   * 处理代码编辑区滚动同步
   * 保持行号和代码内容的滚动位置一致
   */
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  /**
   * 计算代码行数并生成行号
   */
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  /**
   * 运行代码
   * 根据当前选择的语言执行代码，并更新执行结果
   */
  const handleRun = async () => {
    if (isRunning) return;

    setIsRunning(true);
    resetResult();

    setResult({
      status: 'running',
      stdout: '',
      stderr: '',
      duration: 0,
    });

    try {
      let pyodide = pyodideInstance;
      
      if (language === 'python' && !pyodide) {
        pyodide = await loadPyodideRuntime();
        setPyodideInstance(pyodide);
        setPythonRuntimeLoaded(true);
      }

      const executionResult = await executeCode(code, language, pyodide);
      setResult(executionResult);
    } catch (error: any) {
      setResult({
        status: 'error',
        stdout: '',
        stderr: error?.message || '执行失败',
        duration: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * 保存代码片段
   * 将当前代码保存到 localStorage 中
   */
  const handleSave = () => {
    if (!snippetTitle.trim()) return;
    saveSnippet(snippetTitle.trim());
    setSnippetTitle('');
    setShowSaveModal(false);
  };

  /**
   * 加载代码片段
   * 将选中的代码片段加载到编辑器
   */
  const handleLoadSnippet = (snippet: SavedCodeSnippet) => {
    loadSnippet(snippet.id);
    setShowSnippetsModal(false);
  };

  /**
   * 删除代码片段
   */
  const handleDeleteSnippet = (id: string) => {
    if (confirm('确定要删除这个代码片段吗？')) {
      deleteSnippet(id);
    }
  };

  /**
   * 格式化日期时间
   */
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * 处理 Tab 键缩进
   * 在代码编辑器中按 Tab 键插入两个空格而不是切换焦点
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-primary-500 flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">在线编程</h1>
              <p className="text-dark-400 text-sm">在浏览器中编写和运行代码</p>
            </div>
          </div>
        </div>

        {/* 工具栏 */}
        <div className="bg-dark-800/50 border border-dark-700 rounded-t-xl p-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {/* 语言选择器 */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as PlaygroundLanguage)}
                className="appearance-none bg-dark-700 border border-dark-600 text-white px-4 py-2 pr-10 rounded-lg focus:outline-none focus:border-primary-500 cursor-pointer text-sm"
              >
                {languageOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
            </div>

            {/* Python 运行时加载状态 */}
            {language === 'python' && !pythonRuntimeLoaded && (
              <div className="flex items-center gap-2 text-sm text-yellow-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>正在加载 Python 运行时...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* 打开保存的代码 */}
            <button
              onClick={() => setShowSnippetsModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-dark-700 text-dark-300 hover:text-white hover:bg-dark-600 rounded-lg transition-colors text-sm"
              title="打开保存的代码"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">打开</span>
            </button>

            {/* 保存代码 */}
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-dark-700 text-dark-300 hover:text-white hover:bg-dark-600 rounded-lg transition-colors text-sm"
              title="保存代码"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">保存</span>
            </button>

            {/* 运行按钮 */}
            <button
              onClick={handleRun}
              disabled={isRunning || (language === 'python' && !pythonRuntimeLoaded)}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  运行中...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  运行
                </>
              )}
            </button>
          </div>
        </div>

        {/* 主内容区：代码编辑器和输出面板 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* 代码编辑器 */}
          <div className="bg-dark-800/30 border border-dark-700 lg:rounded-bl-xl lg:border-r-0 min-h-[400px]">
            <div className="px-4 py-2 border-b border-dark-700 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-xs text-dark-500 ml-2">
                {language === 'javascript' ? 'script.js' : 'main.py'}
              </span>
            </div>
            <div className="relative h-[400px] flex">
              {/* 行号 */}
              <div
                ref={lineNumbersRef}
                className="code-line-numbers select-none text-right pr-3 pl-4 py-3 text-dark-500 text-sm bg-dark-900/50 border-r border-dark-700 overflow-hidden font-mono leading-6"
              >
                {lineNumbers.map((num) => (
                  <div key={num} className="leading-6">
                    {num}
                  </div>
                ))}
              </div>
              {/* 代码编辑区 */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                className="flex-1 bg-transparent text-white p-3 font-mono text-sm leading-6 resize-none focus:outline-none overflow-auto"
                style={{ tabSize: 2 }}
              />
            </div>
          </div>

          {/* 输出面板 */}
          <div className="bg-dark-800/30 border border-dark-700 lg:rounded-br-xl min-h-[400px]">
            <div className="px-4 py-2 border-b border-dark-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-dark-400" />
                <span className="text-sm text-dark-400">输出</span>
              </div>
              {result.status !== 'idle' && result.status !== 'running' && (
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-dark-500" />
                    <span className="text-dark-500">{result.duration}ms</span>
                  </div>
                  {result.status === 'success' ? (
                    <div className="flex items-center gap-1 text-green-400">
                      <CheckCircle className="w-3 h-3" />
                      <span>成功</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-400">
                      <XCircle className="w-3 h-3" />
                      <span>失败</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="h-[400px] overflow-auto p-4 font-mono text-sm">
              {result.status === 'idle' && (
                <div className="text-dark-500 text-sm flex items-center justify-center h-full">
                  <div className="text-center">
                    <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>点击「运行」按钮执行代码</p>
                  </div>
                </div>
              )}
              {result.status === 'running' && (
                <div className="text-dark-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>正在执行代码...</span>
                </div>
              )}
              {(result.status === 'success' || result.status === 'error') && (
                <div className="space-y-2">
                  {result.stdout && (
                    <div className="text-green-300 whitespace-pre-wrap break-words">
                      {result.stdout}
                    </div>
                  )}
                  {result.stderr && (
                    <div className="text-red-400 whitespace-pre-wrap break-words">
                      {result.stderr}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 功能说明 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-800/30 border border-dark-700 rounded-xl p-4">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-3">
              <Code2 className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-white font-medium mb-1">多语言支持</h3>
            <p className="text-dark-400 text-sm">支持 JavaScript 和 Python 两种编程语言，在浏览器中直接运行</p>
          </div>
          <div className="bg-dark-800/30 border border-dark-700 rounded-xl p-4">
            <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center mb-3">
              <Save className="w-5 h-5 text-primary-400" />
            </div>
            <h3 className="text-white font-medium mb-1">代码保存</h3>
            <p className="text-dark-400 text-sm">支持保存代码片段到本地，随时加载继续编辑</p>
          </div>
          <div className="bg-dark-800/30 border border-dark-700 rounded-xl p-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
              <Terminal className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-white font-medium mb-1">即时运行</h3>
            <p className="text-dark-400 text-sm">无需后端服务，代码在浏览器沙箱中安全执行</p>
          </div>
        </div>
      </div>

      {/* 保存代码弹窗 */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-dark-700 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-dark-700">
              <h3 className="text-white font-medium">保存代码</h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <label className="block text-sm text-dark-300 mb-2">代码标题</label>
              <input
                type="text"
                value={snippetTitle}
                onChange={(e) => setSnippetTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="请输入代码片段标题"
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder:text-dark-500 focus:outline-none focus:border-primary-500"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-dark-700">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-dark-300 hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!snippetTitle.trim()}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 已保存代码列表弹窗 */}
      {showSnippetsModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-dark-700 rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-dark-700">
              <h3 className="text-white font-medium">已保存的代码</h3>
              <button
                onClick={() => setShowSnippetsModal(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              {savedSnippets.length === 0 ? (
                <div className="p-8 text-center text-dark-500">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无保存的代码片段</p>
                </div>
              ) : (
                <div className="divide-y divide-dark-700">
                  {savedSnippets.map((snippet) => (
                    <div
                      key={snippet.id}
                      className="p-4 hover:bg-dark-700/50 transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => handleLoadSnippet(snippet)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium">{snippet.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              snippet.language === 'javascript' 
                                ? 'bg-yellow-500/10 text-yellow-400' 
                                : 'bg-blue-500/10 text-blue-400'
                            }`}>
                              {snippet.language === 'javascript' ? 'JS' : 'PY'}
                            </span>
                          </div>
                          <div className="text-xs text-dark-500">
                            {formatDate(snippet.updatedAt)}
                          </div>
                          <div className="text-sm text-dark-400 mt-2 line-clamp-2 font-mono">
                            {snippet.code.substring(0, 100)}...
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSnippet(snippet.id);
                          }}
                          className="p-2 text-dark-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
