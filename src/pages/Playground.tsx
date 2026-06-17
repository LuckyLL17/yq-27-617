import { useState, useEffect, useCallback } from 'react';
import { Play, RotateCcw, Download, Upload, Settings, Terminal, Code2, Zap } from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import OutputPanel from '@/components/OutputPanel';
import SnippetManager from '@/components/SnippetManager';
import { executeCode, getDefaultCode, preloadPython, isPythonReady } from '@/lib/codeExecutor';
import { useCodeSnippetStore } from '@/store/useCodeSnippetStore';
import type { SupportedLanguage, ExecutionResult, CodeSnippet } from '@/types';

/**
 * 在线编程页面
 * 提供代码编辑、运行、保存等功能
 * 支持 JavaScript 和 Python 两种编程语言
 */
export default function Playground() {
  const [language, setLanguage] = useState<SupportedLanguage>('javascript');
  const [code, setCode] = useState<string>(getDefaultCode('javascript'));
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [snippetPanelOpen, setSnippetPanelOpen] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [pythonReady, setPythonReady] = useState(false);
  const [pythonLoading, setPythonLoading] = useState(false);
  
  const { getCurrentSnippet, setCurrentSnippet } = useCodeSnippetStore();

  /**
   * 页面加载时预加载 Python 运行时
   */
  useEffect(() => {
    // 延迟预加载，不影响首屏
    const timer = setTimeout(() => {
      preloadPython();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  /**
   * 检查 Python 运行时状态
   */
  useEffect(() => {
    const checkPythonStatus = () => {
      setPythonReady(isPythonReady());
    };
    
    const interval = setInterval(checkPythonStatus, 500);
    checkPythonStatus();
    
    return () => clearInterval(interval);
  }, []);

  /**
   * 监听保存快捷键
   */
  useEffect(() => {
    const handleSave = () => {
      // 触发保存操作
      const current = getCurrentSnippet();
      if (current) {
        useCodeSnippetStore.getState().updateSnippet(current.id, {
          code,
          language,
        });
        // 可以加一个保存成功的提示
      }
    };
    
    window.addEventListener('editor-save', handleSave);
    return () => window.removeEventListener('editor-save', handleSave);
  }, [code, language, getCurrentSnippet]);

  /**
   * 运行代码
   */
  const handleRun = useCallback(async () => {
    if (isExecuting) return;
    
    setIsExecuting(true);
    setResult(null);
    
    // 如果是 Python 且未加载完成，显示加载状态
    if (language === 'python' && !pythonReady) {
      setPythonLoading(true);
    }
    
    try {
      const executionResult = await executeCode(code, language);
      setResult(executionResult);
    } catch (err) {
      setResult({
        stdout: '',
        stderr: err instanceof Error ? err.message : '执行失败',
        success: false,
        duration: 0,
      });
    } finally {
      setIsExecuting(false);
      setPythonLoading(false);
    }
  }, [code, language, isExecuting, pythonReady]);

  /**
   * 切换编程语言
   */
  const handleLanguageChange = useCallback((newLanguage: SupportedLanguage) => {
    if (newLanguage === language) return;
    
    setLanguage(newLanguage);
    
    // 如果当前代码是默认代码，则切换为新语言的默认代码
    const currentDefault = getDefaultCode(language);
    if (code === currentDefault) {
      setCode(getDefaultCode(newLanguage));
    } else if (confirm('切换语言将使用新语言的示例代码，是否继续？')) {
      setCode(getDefaultCode(newLanguage));
    }
    
    setResult(null);
    setCurrentSnippet(null);
  }, [language, code, setCurrentSnippet]);

  /**
   * 重置代码为默认示例
   */
  const handleReset = useCallback(() => {
    if (confirm('确定要重置为默认示例代码吗？当前代码将丢失。')) {
      setCode(getDefaultCode(language));
      setResult(null);
    }
  }, [language]);

  /**
   * 清空输出
   */
  const handleClearOutput = useCallback(() => {
    setResult(null);
  }, []);

  /**
   * 加载代码片段
   */
  const handleLoadSnippet = useCallback((snippet: CodeSnippet) => {
    setCode(snippet.code);
    setLanguage(snippet.language);
    setResult(null);
  }, []);

  /**
   * 导出代码为文件下载
   */
  const handleExport = useCallback(() => {
    const extensions: Record<SupportedLanguage, string> = {
      javascript: 'js',
      python: 'py',
    };
    
    const current = getCurrentSnippet();
    const fileName = current 
      ? `${current.title}.${extensions[language]}`
      : `code.${extensions[language]}`;
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [code, language, getCurrentSnippet]);

  /**
   * 导入代码文件
   */
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.js,.ts,.py,.txt';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCode(content);
        setResult(null);
        
        // 根据文件扩展名猜测语言
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'py') {
          setLanguage('python');
        } else if (ext === 'js' || ext === 'ts') {
          setLanguage('javascript');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  }, []);

  /**
   * 语言选项配置
   */
  const languageOptions: { value: SupportedLanguage; label: string; icon: string; color: string }[] = [
    {
      value: 'javascript',
      label: 'JavaScript',
      icon: 'JS',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      value: 'python',
      label: 'Python',
      icon: 'PY',
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  const currentSnippet = getCurrentSnippet();

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      {/* 顶部工具栏 */}
      <div className="border-b border-dark-700 bg-dark-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* 左侧：标题和语言选择 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-white">在线编程</span>
              </div>
              
              {/* 语言选择器 */}
              <div className="flex items-center bg-dark-700/50 rounded-lg p-0.5">
                {languageOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleLanguageChange(opt.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      language === opt.value
                        ? 'bg-dark-600 text-white shadow-sm'
                        : 'text-dark-400 hover:text-white hover:bg-dark-700'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded text-xs font-bold flex items-center justify-center bg-gradient-to-br ${opt.color} text-white`}>
                      {opt.icon}
                    </span>
                    {opt.label}
                    {opt.value === 'python' && !pythonReady && (
                      <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" title="加载中" />
                    )}
                  </button>
                ))}
              </div>

              {/* 当前代码片段名称 */}
              {currentSnippet && (
                <span className="text-sm text-dark-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {currentSnippet.title}
                </span>
              )}
            </div>

            {/* 右侧：操作按钮 */}
            <div className="flex items-center gap-2">
              {/* 导入/导出 */}
              <button
                onClick={handleImport}
                className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                title="导入代码文件"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                onClick={handleExport}
                className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                title="导出代码文件"
              >
                <Download className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-dark-700" />

              {/* 重置 */}
              <button
                onClick={handleReset}
                className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                title="重置为示例代码"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* 设置 */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${
                  showSettings
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-dark-400 hover:text-white hover:bg-dark-700'
                }`}
                title="设置"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* 运行按钮 */}
              <button
                onClick={handleRun}
                disabled={isExecuting}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25"
              >
                {isExecuting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {pythonLoading ? '加载中...' : '运行中...'}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    运行
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="border-b border-dark-700 bg-dark-800/30">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-6">
              {/* 字体大小 */}
              <div className="flex items-center gap-3">
                <label className="text-sm text-dark-400">字体大小:</label>
                <input
                  type="range"
                  min="12"
                  max="20"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-32 accent-primary-500"
                />
                <span className="text-sm text-dark-300 w-8 text-right">{fontSize}px</span>
              </div>

              <div className="w-px h-5 bg-dark-700" />

              {/* 快捷键提示 */}
              <div className="text-xs text-dark-500 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" />
                <span>快捷键: Ctrl/Cmd + S 保存 · Ctrl/Cmd + Enter 运行</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主内容区：编辑器 + 输出面板 */}
      <div className="flex-1 container mx-auto px-4 py-4">
        <div className="h-full flex flex-col lg:flex-row gap-4">
          {/* 代码编辑器区域 */}
          <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-dark-400">
                <Terminal className="w-4 h-4" />
                <span>代码编辑</span>
              </div>
              <span className="text-xs text-dark-500">
                {code.split('\n').length} 行 · {code.length} 字符
              </span>
            </div>
            <div className="flex-1 min-h-0 border border-dark-700 rounded-lg overflow-hidden">
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
                fontSize={fontSize}
                showLineNumbers={true}
                wordWrap={false}
                placeholder={`在此输入 ${language === 'javascript' ? 'JavaScript' : 'Python'} 代码...`}
              />
            </div>
          </div>

          {/* 输出面板区域 */}
          <div className="w-full lg:w-96 flex flex-col min-h-[200px] lg:min-h-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-dark-400">
                <Terminal className="w-4 h-4" />
                <span>运行结果</span>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <OutputPanel
                result={result}
                isExecuting={isExecuting}
                onClear={handleClearOutput}
                className="h-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 代码片段侧边栏 */}
      <SnippetManager
        currentCode={code}
        currentLanguage={language}
        onLoadSnippet={handleLoadSnippet}
        isOpen={snippetPanelOpen}
        onToggle={() => setSnippetPanelOpen(!snippetPanelOpen)}
      />

      {/* 底部状态栏 */}
      <div className="border-t border-dark-700 bg-dark-800/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-8 text-xs text-dark-500">
            <div className="flex items-center gap-4">
              <span>
                语言: {language === 'javascript' ? 'JavaScript' : 'Python'}
              </span>
              {language === 'python' && (
                <span className={pythonReady ? 'text-green-400' : 'text-yellow-400'}>
                  {pythonReady ? '✓ 运行时就绪' : '⏳ 运行时加载中...'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span>UTF-8</span>
              <span>
                {code.split('\n').length} 行
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
