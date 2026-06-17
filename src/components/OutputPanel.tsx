import { useRef, useEffect } from 'react';
import { Terminal, AlertCircle, CheckCircle, Clock, Trash2 } from 'lucide-react';
import type { ExecutionResult } from '@/types';

interface OutputPanelProps {
  /** 执行结果 */
  result: ExecutionResult | null;
  /** 是否正在执行 */
  isExecuting: boolean;
  /** 清空输出回调 */
  onClear?: () => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 输出面板组件
 * 显示代码执行结果，包括标准输出和错误输出
 */
export default function OutputPanel({
  result,
  isExecuting,
  onClear,
  className = '',
}: OutputPanelProps) {
  const outputRef = useRef<HTMLDivElement>(null);

  /**
   * 有新输出时自动滚动到底部
   */
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [result, isExecuting]);

  /**
   * 格式化输出内容，将换行符转换为 <br>
   */
  const formatOutput = (text: string): string => {
    if (!text) return '';
    return text.replace(/\n/g, '<br>');
  };

  return (
    <div className={`flex flex-col h-full bg-dark-900 rounded-lg overflow-hidden border border-dark-700 ${className}`}>
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-dark-700 bg-dark-800/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-dark-400" />
          <span className="text-sm font-medium text-dark-300">输出面板</span>
          
          {/* 状态指示器 */}
          {isExecuting && (
            <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              运行中
            </span>
          )}
          
          {result && !isExecuting && (
            <span className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${
              result.success 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {result.success 
                ? <CheckCircle className="w-3 h-3" /> 
                : <AlertCircle className="w-3 h-3" />
              }
              {result.success ? '成功' : '失败'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* 执行耗时 */}
          {result && !isExecuting && (
            <span className="flex items-center gap-1 text-xs text-dark-500">
              <Clock className="w-3 h-3" />
              {result.duration} ms
            </span>
          )}
          
          {/* 清空按钮 */}
          <button
            onClick={onClear}
            className="p-1 text-dark-500 hover:text-dark-300 transition-colors"
            title="清空输出"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 输出内容区域 */}
      <div 
        ref={outputRef}
        className="flex-1 p-4 overflow-auto font-mono text-sm"
      >
        {/* 正在执行状态 */}
        {isExecuting && (
          <div className="flex items-center gap-2 text-dark-400">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>正在执行代码...</span>
          </div>
        )}

        {/* 无输出状态 */}
        {!result && !isExecuting && (
          <div className="h-full flex items-center justify-center text-dark-500">
            <div className="text-center">
              <Terminal className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>点击运行按钮查看输出结果</p>
            </div>
          </div>
        )}

        {/* 执行结果 */}
        {result && !isExecuting && (
          <div className="space-y-2">
            {/* 标准输出 */}
            {result.stdout && (
              <div>
                <div className="text-xs text-dark-500 mb-1">标准输出</div>
                <pre 
                  className="text-green-400 whitespace-pre-wrap break-all leading-6"
                  dangerouslySetInnerHTML={{ __html: formatOutput(result.stdout) }}
                />
              </div>
            )}

            {/* 错误输出 */}
            {result.stderr && (
              <div>
                <div className="text-xs text-dark-500 mb-1">错误输出</div>
                <pre 
                  className="text-red-400 whitespace-pre-wrap break-all leading-6"
                  dangerouslySetInnerHTML={{ __html: formatOutput(result.stderr) }}
                />
              </div>
            )}

            {/* 无任何输出时的提示 */}
            {!result.stdout && !result.stderr && result.success && (
              <div className="text-dark-500 italic">
                代码执行成功，但没有输出内容。
                <br />
                试试使用 console.log() 或 print() 输出一些内容吧。
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
