import { useRef, useEffect, useCallback } from 'react';
import type { SupportedLanguage } from '@/types';

interface CodeEditorProps {
  /** 代码内容 */
  value: string;
  /** 代码变更回调 */
  onChange: (code: string) => void;
  /** 编程语言 */
  language: SupportedLanguage;
  /** 字体大小 */
  fontSize?: number;
  /** 是否显示行号 */
  showLineNumbers?: boolean;
  /** 是否自动换行 */
  wordWrap?: boolean;
  /** 编辑器占位符 */
  placeholder?: string;
  /** 是否只读 */
  readOnly?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 代码编辑器组件
 * 支持语法高亮、行号显示、自动换行等功能
 * 使用 textarea + 高亮层叠加的方式实现
 */
export default function CodeEditor({
  value,
  onChange,
  language,
  fontSize = 14,
  showLineNumbers = true,
  wordWrap = false,
  placeholder = '在此输入代码...',
  readOnly = false,
  className = '',
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  /**
   * 计算代码行数
   */
  const lineCount = value ? value.split('\n').length : 1;

  /**
   * 同步滚动 - 使高亮层和行号与 textarea 同步滚动
   */
  const handleScroll = useCallback(() => {
    if (!textareaRef.current || !highlightRef.current || !lineNumbersRef.current) return;
    
    const scrollTop = textareaRef.current.scrollTop;
    const scrollLeft = textareaRef.current.scrollLeft;
    
    highlightRef.current.scrollTop = scrollTop;
    highlightRef.current.scrollLeft = scrollLeft;
    lineNumbersRef.current.scrollTop = scrollTop;
  }, []);

  /**
   * 处理键盘事件，支持 Tab 缩进
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    
    // Tab 键插入缩进
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      if (e.shiftKey) {
        // Shift+Tab 减少缩进
        const lines = value.split('\n');
        const lineIndex = value.substring(0, start).split('\n').length - 1;
        const line = lines[lineIndex];
        
        if (line.startsWith('  ')) {
          lines[lineIndex] = line.substring(2);
          const newCode = lines.join('\n');
          onChange(newCode);
          
          setTimeout(() => {
            textarea.selectionStart = start - 2;
            textarea.selectionEnd = end - 2;
          }, 0);
        }
      } else {
        // Tab 增加缩进
        const newCode = value.substring(0, start) + '  ' + value.substring(end);
        onChange(newCode);
        
        setTimeout(() => {
          textarea.selectionStart = start + 2;
          textarea.selectionEnd = end + 2;
        }, 0);
      }
    }
    
    // Enter 键自动缩进
    if (e.key === 'Enter') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const lines = value.substring(0, start).split('\n');
      const currentLine = lines[lines.length - 1];
      
      // 计算当前行的缩进
      const indentMatch = currentLine.match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1] : '';
      
      // 如果当前行以 { 或 : 结尾，额外增加缩进
      let extraIndent = '';
      if (currentLine.trim().endsWith('{') || currentLine.trim().endsWith(':') || currentLine.trim().endsWith('(')) {
        extraIndent = '  ';
      }
      
      const newCode = value.substring(0, start) + '\n' + indent + extraIndent + value.substring(start);
      onChange(newCode);
      
      setTimeout(() => {
        const newPos = start + 1 + indent.length + extraIndent.length;
        textarea.selectionStart = newPos;
        textarea.selectionEnd = newPos;
      }, 0);
    }
    
    // Ctrl/Cmd + S 保存（由外部处理，这里只触发自定义事件）
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      const event = new CustomEvent('editor-save');
      window.dispatchEvent(event);
    }
  }, [value, onChange]);

  /**
   * 语法高亮
   * 使用单次正则匹配+替换函数的方式，避免多次替换互相干扰
   */
  const highlightCode = useCallback((code: string, lang: string): string => {
    /**
     * JavaScript 关键字列表
     */
    const jsKeywords = 'const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|class|extends|super|import|export|default|from|as|async|await|yield|typeof|instanceof|delete|void|this|arguments|true|false|null|undefined|NaN|Infinity|of|in';
    
    /**
     * JavaScript 内置类型/对象
     */
    const jsBuiltins = 'String|Number|Boolean|Array|Object|Function|Date|Math|JSON|RegExp|Promise|Map|Set|WeakMap|WeakSet|Symbol|BigInt|console|window|document|navigator|globalThis|process';

    /**
     * Python 关键字列表
     */
    const pyKeywords = 'def|class|return|if|elif|else|for|while|break|continue|try|except|finally|raise|import|from|as|with|pass|lambda|yield|global|nonlocal|assert|del|in|is|not|and|or|True|False|None';
    
    /**
     * Python 内置类型/函数
     */
    const pyBuiltins = 'int|str|float|bool|list|dict|tuple|set|frozenset|type|object|print|len|range|enumerate|zip|map|filter|reduce|sorted|reversed|sum|min|max|abs|round|open|input|isinstance|issubclass|super|self|cls';

    /**
     * 转义 HTML 特殊字符
     */
    const escapeHtml = (text: string): string => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    };

    if (lang === 'javascript') {
      // 单次正则匹配所有元素，按优先级排序
      const pattern = new RegExp(
        '(' +
          '\\/\\/.*$' +          // 单行注释 (组1)
          ')|(' +
          '\\/\\*[\\s\\S]*?\\*\\/' + // 块注释 (组2)
          ')|(' +
          '`[^`]*`' +               // 模板字符串 (组3)
          ')|(' +
          '"[^"\\\\]*(?:\\\\.[^"\\\\]*)*"' + // 双引号字符串 (组4)
          ')|(' +
          "'[^'\\\\]*(?:\\\\.[^'\\\\]*)*'" + // 单引号字符串 (组5)
          ')|(' +
          '\\b(?:' + jsKeywords + ')\\b' + // 关键字 (组6)
          ')|(' +
          '\\b(?:' + jsBuiltins + ')\\b' + // 内置类型 (组7)
          ')|(' +
          '\\b\\d+\\.?\\d*(?:[eE][+-]?\\d+)?\\b|\\b0x[0-9a-fA-F]+\\b|\\b0o[0-7]+\\b|\\b0b[01]+\\b' + // 数字 (组8)
          ')',
        'gm'
      );

      return escapeHtml(code).replace(pattern, (match, comment, blockComment, templateStr, doubleStr, singleStr, keyword, builtin, number) => {
        if (comment || blockComment) {
          return `<span class="text-dark-500">${match}</span>`;
        }
        if (templateStr || doubleStr || singleStr) {
          return `<span class="text-green-400">${match}</span>`;
        }
        if (keyword) {
          return `<span class="text-pink-400">${match}</span>`;
        }
        if (builtin) {
          return `<span class="text-cyan-400">${match}</span>`;
        }
        if (number) {
          return `<span class="text-orange-400">${match}</span>`;
        }
        return match;
      });
    }

    if (lang === 'python') {
      // 单次正则匹配所有元素，按优先级排序
      const pattern = new RegExp(
        '(' +
          '#.*$' +                     // 单行注释 (组1)
          ')|(' +
          '"""[\\s\\S]*?"""|' + "'{3}[\\s\\S]*?'{3}" + // 三引号字符串 (组2)
          ')|(' +
          '"[^"\\\\]*(?:\\\\.[^"\\\\]*)*"' + // 双引号字符串 (组3)
          ')|(' +
          "'[^'\\\\]*(?:\\\\.[^'\\\\]*)*'" + // 单引号字符串 (组4)
          ')|(' +
          '\\b(?:' + pyKeywords + ')\\b' + // 关键字 (组5)
          ')|(' +
          '\\b(?:' + pyBuiltins + ')\\b' + // 内置类型 (组6)
          ')|(' +
          '\\b\\d+\\.?\\d*(?:[eE][+-]?\\d+)?[jJ]?\\b|\\b0x[0-9a-fA-F]+\\b|\\b0o[0-7]+\\b|\\b0b[01]+\\b' + // 数字 (组7)
          ')|(' +
          '@\\w+' +                   // 装饰器 (组8)
          ')',
        'gm'
      );

      return escapeHtml(code).replace(pattern, (match, comment, tripleStr, doubleStr, singleStr, keyword, builtin, number, decorator) => {
        if (comment || tripleStr) {
          return `<span class="text-dark-500">${match}</span>`;
        }
        if (doubleStr || singleStr) {
          return `<span class="text-green-400">${match}</span>`;
        }
        if (keyword) {
          return `<span class="text-pink-400">${match}</span>`;
        }
        if (builtin) {
          return `<span class="text-cyan-400">${match}</span>`;
        }
        if (number) {
          return `<span class="text-orange-400">${match}</span>`;
        }
        if (decorator) {
          return `<span class="text-yellow-400">${match}</span>`;
        }
        return match;
      });
    }

    return escapeHtml(code);
  }, []);

  /**
   * 获取高亮后的 HTML 代码
   * 对完整代码进行高亮，保留换行符
   */
  const getHighlightedHtml = useCallback((): string => {
    return highlightCode(value, language);
  }, [value, language, highlightCode]);

  /**
   * 初始化时同步滚动
   */
  useEffect(() => {
    handleScroll();
  }, [handleScroll, value]);

  /**
   * 生成行号内容
   */
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className={`relative flex h-full bg-dark-900 rounded-lg overflow-hidden ${className}`}>
      {/* 行号栏 */}
      {showLineNumbers && (
        <div
          ref={lineNumbersRef}
          className="flex-shrink-0 select-none text-right pr-3 pl-3 py-3 text-dark-500 text-sm border-r border-dark-700 bg-dark-800/50 overflow-hidden font-mono leading-6"
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.5' }}
        >
          {lineNumbers.map((num) => (
            <div key={num} style={{ height: `${fontSize * 1.5}px`, lineHeight: `${fontSize * 1.5}px` }}>
              {num}
            </div>
          ))}
        </div>
      )}

      {/* 代码编辑区域 */}
      <div className="relative flex-1 overflow-hidden">
        {/* 高亮层 - 显示在 textarea 下方 */}
        <div
          ref={highlightRef}
          className="absolute inset-0 p-3 overflow-auto pointer-events-none font-mono whitespace-pre"
          style={{ 
            fontSize: `${fontSize}px`, 
            lineHeight: '1.5',
            whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
            wordBreak: wordWrap ? 'break-all' : 'normal',
          }}
          aria-hidden="true"
        >
          <code
            className="text-dark-200"
            dangerouslySetInnerHTML={{ __html: getHighlightedHtml() }}
          />
        </div>

        {/* 实际的 textarea 输入框 */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          readOnly={readOnly}
          className="absolute inset-0 w-full h-full p-3 bg-transparent text-transparent caret-white resize-none outline-none font-mono z-10"
          style={{ 
            fontSize: `${fontSize}px`, 
            lineHeight: '1.5',
            whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
            wordBreak: wordWrap ? 'break-all' : 'normal',
            caretColor: '#a5b4fc',
          }}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
