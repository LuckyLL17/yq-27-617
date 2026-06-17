import { useState, useCallback, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, Trash2, FolderOpen, X, Clock, CheckCircle, AlertCircle, Loader2, RotateCcw } from 'lucide-react';
import { useCodeStore } from '@/store/useCodeStore';
import { runCode, getDefaultCode } from '@/lib/runCode';
import { CodeLanguage, OutputLine, CodeRunResult } from '@/types';

/** 语言配置映射，包含显示名称和图标标识 */
const LANGUAGE_CONFIG: Record<CodeLanguage, { label: string; monacoLang: string }> = {
  javascript: { label: 'JavaScript', monacoLang: 'javascript' },
  python: { label: 'Python', monacoLang: 'python' },
};

export default function CodePlayground() {
  const {
    currentLanguage,
    currentCode,
    savedSnippets,
    activeSnippetId,
    setLanguage,
    setCurrentCode,
    saveSnippet,
    deleteSnippet,
    loadSnippet,
    clearEditor,
  } = useCodeStore();

  /* 代码执行状态 */
  const [isRunning, setIsRunning] = useState(false);
  const [outputs, setOutputs] = useState<OutputLine[]>([]);
  const [lastResult, setLastResult] = useState<CodeRunResult | null>(null);

  /* 保存对话框状态 */
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');

  /* 已保存代码列表展开状态 */
  const [showSnippets, setShowSnippets] = useState(false);

  /* 输出面板的自动滚动引用 */
  const outputRef = useRef<HTMLDivElement>(null);

  /* 编辑器是否已初始化代码 */
  const editorInitialized = useRef(false);

  /**
   * 初始化编辑器代码
   * 仅在首次加载且 store 中没有代码时设置默认模板
   */
  useEffect(() => {
    if (!editorInitialized.current && !currentCode) {
      const defaultCode = getDefaultCode(currentLanguage);
      setCurrentCode(defaultCode);
      editorInitialized.current = true;
    }
  }, [currentLanguage, currentCode, setCurrentCode]);

  /**
   * 输出面板自动滚动到底部
   */
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [outputs]);

  /**
   * 切换编程语言
   * 切换时重置编辑器为对应语言的默认模板
   */
  const handleLanguageChange = useCallback(
    (language: CodeLanguage) => {
      setLanguage(language);
      const defaultCode = getDefaultCode(language);
      setCurrentCode(defaultCode);
      setOutputs([]);
      setLastResult(null);
    },
    [setLanguage, setCurrentCode]
  );

  /**
   * 运行代码
   * 调用执行引擎并更新输出面板
   */
  const handleRun = useCallback(async () => {
    if (isRunning || !currentCode.trim()) return;

    setIsRunning(true);
    setOutputs([]);

    try {
      const result = await runCode(currentCode, currentLanguage);
      setOutputs(result.outputs);
      setLastResult(result);
    } catch {
      setOutputs([
        {
          type: 'error',
          content: '代码执行失败，请检查代码后重试',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, currentCode, currentLanguage]);

  /**
   * 保存代码片段
   */
  const handleSave = useCallback(() => {
    if (!currentCode.trim()) return;

    /* 如果已有激活的代码片段，直接更新保存 */
    if (activeSnippetId) {
      saveSnippet(savedSnippets.find((s) => s.id === activeSnippetId)?.title || '未命名');
      return;
    }

    /* 否则弹出保存对话框 */
    setShowSaveDialog(true);
    setSaveTitle('');
  }, [currentCode, activeSnippetId, saveSnippet, savedSnippets]);

  /**
   * 确认保存代码片段
   */
  const handleConfirmSave = useCallback(() => {
    const title = saveTitle.trim() || '未命名代码';
    saveSnippet(title);
    setShowSaveDialog(false);
    setSaveTitle('');
  }, [saveTitle, saveSnippet]);

  /**
   * 加载已保存的代码片段到编辑器
   */
  const handleLoadSnippet = useCallback(
    (id: string) => {
      loadSnippet(id);
      setOutputs([]);
      setLastResult(null);
      setShowSnippets(false);
    },
    [loadSnippet]
  );

  /**
   * 删除代码片段
   */
  const handleDeleteSnippet = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      deleteSnippet(id);
    },
    [deleteSnippet]
  );

  /**
   * 重置编辑器为当前语言的默认代码
   */
  const handleReset = useCallback(() => {
    const defaultCode = getDefaultCode(currentLanguage);
    clearEditor(defaultCode);
    setOutputs([]);
    setLastResult(null);
  }, [currentLanguage, clearEditor]);

  /**
   * 获取输出行的样式类名
   */
  const getOutputLineClass = (type: OutputLine['type']): string => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'info':
        return 'text-blue-400';
      case 'result':
        return 'text-green-400';
      case 'log':
      default:
        return 'text-dark-200';
    }
  };

  /**
   * 获取输出行的图标前缀
   */
  const getOutputLinePrefix = (type: OutputLine['type']): string => {
    switch (type) {
      case 'error':
        return '✕';
      case 'info':
        return 'ℹ';
      case 'result':
        return '→';
      case 'log':
      default:
        return '›';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <Play className="w-5 h-5 text-white" />
          </div>
          在线编程
        </h1>
        <p className="text-dark-400 mt-2">在线编写、运行代码，支持 JavaScript 和 Python</p>
      </div>

      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        {/* 左侧：语言选择 */}
        <div className="flex items-center gap-2">
          {(Object.keys(LANGUAGE_CONFIG) as CodeLanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentLanguage === lang
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-white'
              }`}
            >
              {LANGUAGE_CONFIG[lang].label}
            </button>
          ))}
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-2">
          {/* 重置按钮 */}
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-lg text-sm text-dark-300 hover:text-white hover:bg-dark-800 transition-colors flex items-center gap-1.5"
            title="重置代码"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">重置</span>
          </button>

          {/* 保存按钮 */}
          <button
            onClick={handleSave}
            className="px-3 py-2 rounded-lg text-sm text-dark-300 hover:text-white hover:bg-dark-800 transition-colors flex items-center gap-1.5"
            title="保存代码"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">保存</span>
          </button>

          {/* 已保存代码列表 */}
          <div className="relative">
            <button
              onClick={() => setShowSnippets(!showSnippets)}
              className="px-3 py-2 rounded-lg text-sm text-dark-300 hover:text-white hover:bg-dark-800 transition-colors flex items-center gap-1.5"
              title="已保存的代码"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">我的代码</span>
              {savedSnippets.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-500/20 text-primary-400 rounded-full">
                  {savedSnippets.length}
                </span>
              )}
            </button>

            {/* 已保存代码下拉列表 */}
            {showSnippets && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-dark-800 border border-dark-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-3 border-b border-dark-700 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">已保存的代码</span>
                  <button onClick={() => setShowSnippets(false)} className="text-dark-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {savedSnippets.length === 0 ? (
                    <div className="p-4 text-center text-dark-500 text-sm">暂无保存的代码</div>
                  ) : (
                    savedSnippets.map((snippet) => (
                      <div
                        key={snippet.id}
                        onClick={() => handleLoadSnippet(snippet.id)}
                        className={`px-3 py-2.5 cursor-pointer hover:bg-dark-700 transition-colors flex items-center justify-between group ${
                          activeSnippetId === snippet.id ? 'bg-dark-700/50' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white truncate">{snippet.title}</div>
                          <div className="text-xs text-dark-500 flex items-center gap-2 mt-0.5">
                            <span>{LANGUAGE_CONFIG[snippet.language].label}</span>
                            <span>·</span>
                            <span>{new Date(snippet.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteSnippet(snippet.id, e)}
                          className="ml-2 p-1 text-dark-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 运行按钮 */}
          <button
            onClick={handleRun}
            disabled={isRunning || !currentCode.trim()}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              isRunning
                ? 'bg-dark-700 text-dark-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25'
            }`}
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

      {/* 主内容区：编辑器 + 输出面板 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: '500px' }}>
        {/* 代码编辑器 */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden flex flex-col">
          {/* 编辑器标题栏 */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-dark-800 border-b border-dark-700">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-dark-400 ml-2">
                {LANGUAGE_CONFIG[currentLanguage].label}
              </span>
            </div>
            <span className="text-xs text-dark-500">
              {currentCode.split('\n').length} 行
            </span>
          </div>

          {/* Monaco 编辑器 */}
          <div className="flex-1" style={{ minHeight: '460px' }}>
            <Editor
              height="100%"
              language={LANGUAGE_CONFIG[currentLanguage].monacoLang}
              value={currentCode}
              onChange={(value) => setCurrentCode(value || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineNumbers: 'on',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                padding: { top: 12 },
                renderLineHighlight: 'line',
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>
        </div>

        {/* 输出面板 */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden flex flex-col">
          {/* 输出标题栏 */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-dark-800 border-b border-dark-700">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">输出</span>
              {outputs.length > 0 && (
                <span className="text-xs text-dark-500">({outputs.length} 行)</span>
              )}
            </div>
            {/* 执行结果状态 */}
            {lastResult && (
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-dark-400">
                  <Clock className="w-3.5 h-3.5" />
                  {lastResult.executionTime}ms
                </span>
                {lastResult.success ? (
                  <span className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    成功
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    失败
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 输出内容区域 */}
          <div
            ref={outputRef}
            className="flex-1 p-4 overflow-y-auto font-mono text-sm"
            style={{ minHeight: '460px' }}
          >
            {outputs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-dark-500">
                <Play className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">点击「运行」按钮执行代码</p>
                <p className="text-xs mt-1 text-dark-600">
                  支持 {LANGUAGE_CONFIG[currentLanguage].label} 代码运行
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {outputs.map((line, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 py-0.5 ${getOutputLineClass(line.type)}`}
                  >
                    <span className="text-dark-600 select-none shrink-0">
                      {getOutputLinePrefix(line.type)}
                    </span>
                    <pre className="whitespace-pre-wrap break-all flex-1">{line.content}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 保存对话框 */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
            <h3 className="text-lg font-semibold text-white mb-4">保存代码</h3>
            <input
              type="text"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmSave()}
              placeholder="输入代码标题..."
              className="w-full px-4 py-2.5 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder:text-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-4 py-2 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
