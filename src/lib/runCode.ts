import { CodeLanguage, CodeRunResult, OutputLine } from '@/types';

/**
 * 创建时间戳，用于输出行的标记
 */
function now(): number {
  return Date.now();
}

/**
 * 执行 JavaScript 代码
 * 通过重写 console 方法捕获输出，使用 new Function 在沙箱中执行
 */
function runJavaScript(code: string): CodeRunResult {
  const outputs: OutputLine[] = [];
  const startTime = performance.now();

  try {
    /* 构建自定义 console 对象，拦截 log/error/info 输出 */
    const consoleShim = {
      log: (...args: unknown[]) => {
        outputs.push({
          type: 'log',
          content: args.map(formatValue).join(' '),
          timestamp: now(),
        });
      },
      error: (...args: unknown[]) => {
        outputs.push({
          type: 'error',
          content: args.map(formatValue).join(' '),
          timestamp: now(),
        });
      },
      info: (...args: unknown[]) => {
        outputs.push({
          type: 'info',
          content: args.map(formatValue).join(' '),
          timestamp: now(),
        });
      },
    };

    /* 使用 new Function 构造沙箱执行环境 */
    const fn = new Function('console', code);
    const result = fn(consoleShim);

    /* 如果代码有返回值，追加到输出 */
    if (result !== undefined) {
      outputs.push({
        type: 'result',
        content: formatValue(result),
        timestamp: now(),
      });
    }

    return {
      success: true,
      outputs,
      executionTime: Math.round(performance.now() - startTime),
    };
  } catch (err) {
    /* 捕获运行时错误 */
    outputs.push({
      type: 'error',
      content: err instanceof Error ? err.message : String(err),
      timestamp: now(),
    });

    return {
      success: false,
      outputs,
      executionTime: Math.round(performance.now() - startTime),
    };
  }
}

/**
 * Pyodide 实例缓存，避免重复加载
 */
let pyodideInstance: unknown | null = null;
let pyodideLoading: Promise<unknown> | null = null;

/**
 * 异步加载 Pyodide 运行时
 * 从 CDN 加载 Python WebAssembly 运行时
 */
async function loadPyodide(): Promise<unknown> {
  /* 如果已经加载完成，直接返回 */
  if (pyodideInstance) return pyodideInstance;

  /* 如果正在加载中，等待加载完成 */
  if (pyodideLoading) return pyodideLoading;

  /* 开始加载 Pyodide */
  pyodideLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
    script.onload = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pyodide = await (window as any).loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
        });
        pyodideInstance = pyodide;
        resolve(pyodide);
      } catch (e) {
        reject(e);
      }
    };
    script.onerror = () => reject(new Error('Pyodide 加载失败，请检查网络连接'));
    document.head.appendChild(script);
  });

  return pyodideLoading;
}

/**
 * 执行 Python 代码
 * 使用 Pyodide (WebAssembly Python 运行时) 在浏览器中执行
 */
async function runPython(code: string): Promise<CodeRunResult> {
  const outputs: OutputLine[] = [];
  const startTime = performance.now();

  try {
    /* 加载 Pyodide 运行时 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pyodide = (await loadPyodide()) as any;

    /* 重定向 Python 的 stdout/stderr 到自定义输出 */
    pyodide.runPython(`
import sys
from io import StringIO

class OutputCapture:
    def __init__(self, output_type):
        self.output_type = output_type
        self.outputs = []
    def write(self, text):
        if text.strip():
            self.outputs.append((self.output_type, text))
    def flush(self):
        pass

_capture_stdout = OutputCapture('log')
_capture_stderr = OutputCapture('error')
_original_stdout = sys.stdout
_original_stderr = sys.stderr
sys.stdout = _capture_stdout
sys.stderr = _capture_stderr
`);

    /* 执行用户代码 */
    const result = pyodide.runPython(code);

    /* 恢复标准输出并收集结果 */
    pyodide.runPython(`
sys.stdout = _original_stdout
sys.stderr = _original_stderr
_captured = _capture_stdout.outputs + _capture_stderr.outputs
`);

    /* 获取捕获的输出 */
    const captured: [string, string][] = pyodide.globals.get('_captured').toJs();

    for (const [type, text] of captured) {
      outputs.push({
        type: type as 'log' | 'error',
        content: text.trim(),
        timestamp: now(),
      });
    }

    /* 如果有返回值，追加到输出 */
    if (result !== undefined && result !== null) {
      const resultStr = typeof result === 'object' ? result.toString() : String(result);
      if (resultStr !== 'None' && resultStr !== '') {
        outputs.push({
          type: 'result',
          content: resultStr,
          timestamp: now(),
        });
      }
    }

    return {
      success: true,
      outputs,
      executionTime: Math.round(performance.now() - startTime),
    };
  } catch (err) {
    /* 捕获 Python 运行时错误 */
    const errorMessage = err instanceof Error ? err.message : String(err);
    /* 提取 Pyodide 错误中的关键信息 */
    const cleanedMessage = errorMessage
      .split('\n')
      .filter((line: string) => !line.includes('pyodide') && line.trim())
      .join('\n') || errorMessage;

    outputs.push({
      type: 'error',
      content: cleanedMessage,
      timestamp: now(),
    });

    return {
      success: false,
      outputs,
      executionTime: Math.round(performance.now() - startTime),
    };
  }
}

/**
 * 格式化值为可读字符串
 * 处理对象、数组等复杂类型的序列化
 */
function formatValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  if (typeof value === 'function') return '[Function]';
  if (typeof value === 'symbol') return value.toString();
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

/**
 * 统一的代码执行入口
 * 根据语言类型选择对应的执行引擎
 */
export async function runCode(code: string, language: CodeLanguage): Promise<CodeRunResult> {
  if (!code.trim()) {
    return {
      success: false,
      outputs: [{ type: 'info', content: '请输入代码后再运行', timestamp: now() }],
      executionTime: 0,
    };
  }

  switch (language) {
    case 'javascript':
      return runJavaScript(code);
    case 'python':
      return runPython(code);
    default:
      return {
        success: false,
        outputs: [{ type: 'error', content: `不支持的语言: ${language}`, timestamp: now() }],
        executionTime: 0,
      };
  }
}

/**
 * 获取各语言的默认代码模板
 * 提供给用户作为起始代码
 */
export function getDefaultCode(language: CodeLanguage): string {
  switch (language) {
    case 'javascript':
      return `// JavaScript 在线编程示例
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 打印前 10 个斐波那契数
for (let i = 0; i < 10; i++) {
  console.log(\`fib(\${i}) = \${fibonacci(i)}\`);
}`;
    case 'python':
      return `# Python 在线编程示例
def fibonacci(n):
    """计算第 n 个斐波那契数"""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# 打印前 10 个斐波那契数
for i in range(10):
    print(f"fib({i}) = {fibonacci(i)}")`;
    default:
      return '';
  }
}

/**
 * 检查 Pyodide 是否已加载
 * 用于 UI 显示加载状态
 */
export function isPyodideLoaded(): boolean {
  return pyodideInstance !== null;
}
