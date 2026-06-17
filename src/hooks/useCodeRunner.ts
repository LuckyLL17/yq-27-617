import { useState, useRef, useCallback } from 'react';
import type { SupportedLanguage, ExecutionResult, OutputLine } from '@/types';

/**
 * 代码运行器 Hook
 * 提供 JavaScript 和 Python 代码的执行能力
 * JavaScript 通过浏览器原生执行，Python 通过 Pyodide 在浏览器端运行
 */
export function useCodeRunner() {
  const [result, setResult] = useState<ExecutionResult>({
    status: 'idle',
    output: [],
  });
  const pyodideRef = useRef<any>(null);
  const pyodideLoadingRef = useRef<boolean>(false);

  /**
   * 添加输出行到结果中
   */
  const addOutputLine = useCallback((type: OutputLine['type'], content: string) => {
    const line: OutputLine = {
      type,
      content,
      timestamp: Date.now(),
    };
    setResult((prev) => ({
      ...prev,
      output: [...prev.output, line],
    }));
  }, []);

  /**
   * 执行 JavaScript 代码
   * 使用 Function 构造函数创建沙箱环境，捕获 console 输出
   */
  const runJavaScript = useCallback((code: string) => {
    const startTime = Date.now();
    const output: OutputLine[] = [];

    // 创建自定义 console 对象来捕获输出
    const customConsole = {
      log: (...args: unknown[]) => {
        output.push({
          type: 'log',
          content: args.map((a) => stringifyValue(a)).join(' '),
          timestamp: Date.now(),
        });
      },
      error: (...args: unknown[]) => {
        output.push({
          type: 'error',
          content: args.map((a) => stringifyValue(a)).join(' '),
          timestamp: Date.now(),
        });
      },
      warn: (...args: unknown[]) => {
        output.push({
          type: 'warn',
          content: args.map((a) => stringifyValue(a)).join(' '),
          timestamp: Date.now(),
        });
      },
      info: (...args: unknown[]) => {
        output.push({
          type: 'info',
          content: args.map((a) => stringifyValue(a)).join(' '),
          timestamp: Date.now(),
        });
      },
    };

    try {
      setResult({ status: 'running', output: [] });

      // 使用 Function 构造函数执行代码，注入自定义 console
      const fn = new Function('console', `
        "use strict";
        ${code}
      `);
      
      const returnValue = fn(customConsole);
      
      // 如果有返回值，添加到输出
      if (returnValue !== undefined) {
        output.push({
          type: 'result',
          content: `=> ${stringifyValue(returnValue)}`,
          timestamp: Date.now(),
        });
      }

      const duration = Date.now() - startTime;
      setResult({
        status: 'success',
        output,
        duration,
      });
    } catch (err) {
      const duration = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : String(err);
      output.push({
        type: 'error',
        content: errorMessage,
        timestamp: Date.now(),
      });
      setResult({
        status: 'error',
        output,
        duration,
        error: errorMessage,
      });
    }
  }, []);

  /**
   * 加载 Pyodide 运行时
   * 动态从 CDN 加载 Pyodide，用于在浏览器端运行 Python 代码
   */
  const loadPyodide = useCallback(async (): Promise<any> => {
    if (pyodideRef.current) {
      return pyodideRef.current;
    }

    if (pyodideLoadingRef.current) {
      // 等待加载完成
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (pyodideRef.current) {
            clearInterval(checkInterval);
            resolve(pyodideRef.current);
          }
        }, 100);
      });
    }

    pyodideLoadingRef.current = true;

    return new Promise((resolve, reject) => {
      // 动态创建 script 标签加载 Pyodide
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
      script.onload = async () => {
        try {
          // @ts-ignore - loadPyodide 是全局加载的
          const pyodide = await loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
          });
          pyodideRef.current = pyodide;
          pyodideLoadingRef.current = false;
          resolve(pyodide);
        } catch (err) {
          pyodideLoadingRef.current = false;
          reject(err);
        }
      };
      script.onerror = () => {
        pyodideLoadingRef.current = false;
        reject(new Error('Failed to load Pyodide'));
      };
      document.head.appendChild(script);
    });
  }, []);

  /**
   * 执行 Python 代码
   * 通过 Pyodide 在浏览器端运行 Python 代码
   */
  const runPython = useCallback(async (code: string) => {
    const startTime = Date.now();
    const output: OutputLine[] = [];

    try {
      setResult({ status: 'running', output: [] });

      const pyodide = await loadPyodide();

      // 重定向 Python 的 stdout 和 stderr
      pyodide.setStdout({
        batched: (text: string) => {
          output.push({
            type: 'log',
            content: text,
            timestamp: Date.now(),
          });
        },
      });

      pyodide.setStderr({
        batched: (text: string) => {
          output.push({
            type: 'error',
            content: text,
            timestamp: Date.now(),
          });
        },
      });

      // 执行 Python 代码
      const returnValue = await pyodide.runPythonAsync(code);

      // 如果有返回值，添加到输出
      if (returnValue !== undefined && returnValue !== null) {
        output.push({
          type: 'result',
          content: `=> ${String(returnValue)}`,
          timestamp: Date.now(),
        });
      }

      const duration = Date.now() - startTime;
      setResult({
        status: 'success',
        output,
        duration,
      });
    } catch (err) {
      const duration = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : String(err);
      output.push({
        type: 'error',
        content: errorMessage,
        timestamp: Date.now(),
      });
      setResult({
        status: 'error',
        output,
        duration,
        error: errorMessage,
      });
    }
  }, [loadPyodide]);

  /**
   * 运行代码的统一入口
   * 根据语言选择对应的执行引擎
   */
  const runCode = useCallback(async (code: string, language: SupportedLanguage) => {
    if (language === 'javascript') {
      runJavaScript(code);
    } else if (language === 'python') {
      await runPython(code);
    }
  }, [runJavaScript, runPython]);

  /**
   * 清空执行结果
   */
  const clearResult = useCallback(() => {
    setResult({ status: 'idle', output: [] });
  }, []);

  return {
    result,
    runCode,
    clearResult,
  };
}

/**
 * 将任意值转换为可显示的字符串
 * 处理对象、数组等复杂类型的格式化
 */
function stringifyValue(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'function') return value.toString();
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}
