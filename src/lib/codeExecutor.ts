import { PlaygroundLanguage, ExecutionResult } from '@/types';

/**
 * 声明全局 Pyodide 类型
 * Pyodide 是一个将 Python 编译为 WebAssembly 的项目，可以在浏览器中运行 Python
 */
declare global {
  interface Window {
    loadPyodide?: () => Promise<any>;
    pyodide?: any;
  }
}

/**
 * Pyodide CDN 地址
 * 使用 jsdelivr 加载 Pyodide 运行时
 */
const PYODIDE_CDN_URL = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';

/**
 * 动态加载 Pyodide 脚本
 * 只在首次运行 Python 代码时加载，避免不必要的网络请求
 */
let pyodideLoadPromise: Promise<any> | null = null;

export async function loadPyodideRuntime(): Promise<any> {
  if (window.pyodide) {
    return window.pyodide;
  }

  if (pyodideLoadPromise) {
    return pyodideLoadPromise;
  }

  pyodideLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${PYODIDE_CDN_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.loadPyodide) {
          window.loadPyodide().then(resolve).catch(reject);
        } else {
          reject(new Error('Pyodide 加载失败'));
        }
      });
      existingScript.addEventListener('error', () => {
        reject(new Error('Pyodide 脚本加载失败'));
      });
      return;
    }

    const script = document.createElement('script');
    script.src = PYODIDE_CDN_URL;
    script.onload = async () => {
      try {
        if (window.loadPyodide) {
          const pyodide = await window.loadPyodide();
          window.pyodide = pyodide;
          resolve(pyodide);
        } else {
          reject(new Error('Pyodide 加载失败'));
        }
      } catch (err) {
        reject(err);
      }
    };
    script.onerror = () => {
      reject(new Error('Pyodide 脚本加载失败'));
    };
    document.head.appendChild(script);
  });

  return pyodideLoadPromise;
}

/**
 * 执行 JavaScript 代码
 * 使用 Function 构造函数在沙箱环境中执行代码
 * 重写 console.log 来捕获输出
 * 
 * @param code - 要执行的 JavaScript 代码
 * @returns 执行结果，包含标准输出、错误输出和执行时间
 */
export async function executeJavaScript(code: string): Promise<ExecutionResult> {
  const startTime = performance.now();
  let stdout = '';
  let stderr = '';
  let status: ExecutionResult['status'] = 'success';

  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  try {
    console.log = (...args: any[]) => {
      stdout += args.map(arg => 
        typeof arg === 'object' 
          ? JSON.stringify(arg, null, 2) 
          : String(arg)
      ).join(' ') + '\n';
      originalConsoleLog.apply(console, args);
    };

    console.error = (...args: any[]) => {
      stderr += args.map(arg => 
        typeof arg === 'object' 
          ? JSON.stringify(arg, null, 2) 
          : String(arg)
      ).join(' ') + '\n';
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      stdout += '[WARN] ' + args.map(arg => 
        typeof arg === 'object' 
          ? JSON.stringify(arg, null, 2) 
          : String(arg)
      ).join(' ') + '\n';
      originalConsoleWarn.apply(console, args);
    };

    const fn = new Function(code);
    const result = fn();

    if (result !== undefined) {
      stdout += `\n返回值: ${typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}\n`;
    }
  } catch (error: any) {
    status = 'error';
    stderr += error?.message || String(error) + '\n';
    if (error?.stack) {
      stderr += '\n堆栈追踪:\n' + error.stack;
    }
  } finally {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  }

  const duration = performance.now() - startTime;

  return {
    status,
    stdout: stdout.trim(),
    stderr: stderr.trim(),
    duration: Math.round(duration),
  };
}

/**
 * 执行 Python 代码
 * 使用 Pyodide 在浏览器中运行 Python 代码
 * 重定向 stdout 和 stderr 来捕获输出
 * 
 * @param code - 要执行的 Python 代码
 * @param pyodide - Pyodide 运行时实例
 * @returns 执行结果，包含标准输出、错误输出和执行时间
 */
export async function executePython(code: string, pyodide: any): Promise<ExecutionResult> {
  const startTime = performance.now();
  let stdout = '';
  let stderr = '';
  let status: ExecutionResult['status'] = 'success';

  try {
    pyodide.runPython(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`);

    pyodide.runPython(code);

    const stdoutResult = pyodide.runPython('sys.stdout.getvalue()');
    const stderrResult = pyodide.runPython('sys.stderr.getvalue()');

    stdout = stdoutResult || '';
    stderr = stderrResult || '';
  } catch (error: any) {
    status = 'error';
    stderr += error?.message || String(error) + '\n';
  } finally {
    pyodide.runPython(`
import sys
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
`);
  }

  const duration = performance.now() - startTime;

  return {
    status,
    stdout: stdout.trim(),
    stderr: stderr.trim(),
    duration: Math.round(duration),
  };
}

/**
 * 根据语言类型执行代码
 * 统一的代码执行入口
 * 
 * @param code - 要执行的代码
 * @param language - 编程语言类型
 * @param pyodide - Pyodide 实例（Python 语言需要）
 * @returns 执行结果
 */
export async function executeCode(
  code: string,
  language: PlaygroundLanguage,
  pyodide?: any
): Promise<ExecutionResult> {
  switch (language) {
    case 'javascript':
      return executeJavaScript(code);
    case 'python':
      if (!pyodide) {
        return {
          status: 'error',
          stdout: '',
          stderr: 'Python 运行时尚未加载，请稍候重试',
          duration: 0,
        };
      }
      return executePython(code, pyodide);
    default:
      return {
        status: 'error',
        stdout: '',
        stderr: `不支持的语言: ${language}`,
        duration: 0,
      };
  }
}
