import type { ExecutionResult, SupportedLanguage } from '@/types';

/**
 * 代码执行引擎
 * 支持 JavaScript 和 Python 两种语言
 * JavaScript 使用浏览器原生 Function 执行
 * Python 使用 Pyodide (WebAssembly) 在浏览器端运行
 */

/** Python 运行时加载状态 */
let pyodideReady = false;
let pyodideLoading = false;
let pyodideLoadError: string | null = null;

/**
 * 加载 Pyodide 运行时
 * 动态从 CDN 加载 Pyodide 库
 */
async function loadPyodide(): Promise<any> {
  if (pyodideReady) {
    return (window as any).pyodide;
  }

  if (pyodideLoading) {
    await new Promise<void>((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (pyodideReady) {
          clearInterval(checkInterval);
          resolve();
        }
        if (pyodideLoadError) {
          clearInterval(checkInterval);
          reject(new Error(pyodideLoadError));
        }
      }, 100);
    });
    return (window as any).pyodide;
  }

  pyodideLoading = true;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
    script.onload = async () => {
      try {
        const pyodide = await (window as any).loadPyodide();
        
        // 重定向 Python 的 print 输出
        pyodide.runPython(`
          import sys
          import io
          
          class OutputInterceptor:
              def __init__(self):
                  self.output = ""
              
              def write(self, text):
                  self.output += text
                  return len(text)
              
              def flush(self):
                  pass
              
              def get_output(self):
                  result = self.output
                  self.output = ""
                  return result
          
          _stdout_interceptor = OutputInterceptor()
          _stderr_interceptor = OutputInterceptor()
          sys.stdout = _stdout_interceptor
          sys.stderr = _stderr_interceptor
        `);
        
        (window as any).pyodide = pyodide;
        pyodideReady = true;
        pyodideLoading = false;
        resolve(pyodide);
      } catch (err) {
        pyodideLoadError = err instanceof Error ? err.message : 'Pyodide 加载失败';
        pyodideLoading = false;
        reject(err);
      }
    };
    script.onerror = () => {
      pyodideLoadError = 'Pyodide 脚本加载失败，请检查网络连接';
      pyodideLoading = false;
      reject(new Error(pyodideLoadError));
    };
    document.head.appendChild(script);
  });
}

/**
 * 执行 JavaScript 代码
 * @param code 要执行的代码
 * @returns 执行结果
 */
async function executeJavaScript(code: string): Promise<ExecutionResult> {
  const startTime = performance.now();
  let stdout = '';
  let stderr = '';
  let success = true;

  // 保存原始 console 方法
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  };

  try {
    // 重定向 console 输出
    const captureOutput = (...args: any[]) => {
      const output = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      stdout += output + '\n';
    };

    const captureError = (...args: any[]) => {
      const output = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      stderr += output + '\n';
    };

    console.log = captureOutput;
    console.info = captureOutput;
    console.warn = captureOutput;
    console.error = captureError;

    // 使用 AsyncFunction 来支持 await 语法
    const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
    const fn = new AsyncFunction(code);
    await fn();

  } catch (err) {
    success = false;
    stderr += err instanceof Error ? err.message : String(err);
  } finally {
    // 恢复原始 console 方法
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
  }

  const duration = performance.now() - startTime;

  return {
    stdout: stdout.trim(),
    stderr: stderr.trim(),
    success,
    duration: Math.round(duration * 100) / 100,
  };
}

/**
 * 执行 Python 代码
 * @param code 要执行的代码
 * @returns 执行结果
 */
async function executePython(code: string): Promise<ExecutionResult> {
  const startTime = performance.now();
  let stdout = '';
  let stderr = '';
  let success = true;

  try {
    const pyodide = await loadPyodide();
    
    // 清空之前的输出
    pyodide.runPython('_stdout_interceptor.output = ""');
    pyodide.runPython('_stderr_interceptor.output = ""');
    
    // 执行代码
    try {
      pyodide.runPython(code);
    } catch (err: any) {
      success = false;
      stderr = err.message || String(err);
    }
    
    // 获取输出
    stdout = pyodide.runPython('_stdout_interceptor.get_output()');
    if (success) {
      const stderrOutput = pyodide.runPython('_stderr_interceptor.get_output()');
      if (stderrOutput) {
        stderr = stderrOutput;
      }
    }

  } catch (err) {
    success = false;
    stderr = err instanceof Error ? err.message : String(err);
  }

  const duration = performance.now() - startTime;

  return {
    stdout: stdout.trim(),
    stderr: stderr.trim(),
    success,
    duration: Math.round(duration * 100) / 100,
  };
}

/**
 * 执行代码
 * @param code 要执行的代码
 * @param language 编程语言
 * @returns 执行结果
 */
export async function executeCode(
  code: string,
  language: SupportedLanguage
): Promise<ExecutionResult> {
  if (!code.trim()) {
    return {
      stdout: '',
      stderr: '请输入代码后再运行',
      success: false,
      duration: 0,
    };
  }

  switch (language) {
    case 'javascript':
      return executeJavaScript(code);
    case 'python':
      return executePython(code);
    default:
      return {
        stdout: '',
        stderr: `不支持的语言: ${language}`,
        success: false,
        duration: 0,
      };
  }
}

/**
 * 检查 Python 运行时是否已准备好
 * @returns 是否准备好
 */
export function isPythonReady(): boolean {
  return pyodideReady;
}

/**
 * 预加载 Python 运行时
 * 可以在页面加载时提前调用，加快首次执行速度
 */
export function preloadPython(): void {
  if (!pyodideReady && !pyodideLoading) {
    loadPyodide().catch(() => {
      // 预加载失败不报错，用户执行时会重新尝试
    });
  }
}

/**
 * 获取各语言的示例代码
 * @param language 编程语言
 * @returns 示例代码
 */
export function getDefaultCode(language: SupportedLanguage): string {
  const examples: Record<SupportedLanguage, string> = {
    javascript: `// JavaScript 示例
// 计算斐波那契数列
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("斐波那契数列前 10 项:");
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}

// 数组操作
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("\\n原数组:", numbers);
console.log("翻倍后:", doubled);
console.log("求和:", numbers.reduce((a, b) => a + b, 0));
`,
    python: `# Python 示例
# 计算斐波那契数列
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print("斐波那契数列前 10 项:")
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")

# 列表操作
numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print("\\n原数组:", numbers)
print("翻倍后:", doubled)
print("求和:", sum(numbers))
`,
  };

  return examples[language];
}
