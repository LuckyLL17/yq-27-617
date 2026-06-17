import { useState, useMemo } from 'react';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  maxCollapsedLines?: number;
}

const languageAliases: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  golang: 'go',
  sh: 'bash',
  shell: 'bash',
  yaml: 'yml',
  md: 'markdown',
};

const getLanguageName = (lang: string): string => {
  const normalized = languageAliases[lang.toLowerCase()] || lang.toLowerCase();
  return normalized;
};

const highlightJava = (code: string): string => {
  return code
    .replace(/(\/\/.*$)/gm, '<span class="text-dark-500">$1</span>')
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-dark-500">$1</span>')
    .replace(/(".*?"|'.*?')/g, '<span class="text-green-400">$1</span>')
    .replace(/\b(public|private|protected|class|interface|extends|implements|static|final|void|new|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|throws|import|package|this|super|null|true|false|instanceof|assert|enum|abstract|native|strictfp|transient|volatile)\b/g, '<span class="text-pink-400">$1</span>')
    .replace(/\b(int|long|short|byte|char|boolean|float|double|String|Integer|Long|Boolean|Double|Float|List|Map|Set|Object|StringBuilder|System|Math|Thread|Runnable|Callable|Future|Executor|ExecutorService|ThreadPoolExecutor|Lock|ReentrantLock|synchronized|Optional|Stream|Collectors|Arrays|Collections|Date|LocalDate|LocalDateTime|BigDecimal|BigInteger)\b/g, '<span class="text-cyan-400">$1</span>')
    .replace(/\b(\d+[LDF]?|0x[0-9a-fA-F]+|0b[01]+|.\d+f?)\b/g, '<span class="text-orange-400">$1</span>')
    .replace(/(@\w+)/g, '<span class="text-yellow-400">$1</span>');
};

const highlightPython = (code: string): string => {
  return code
    .replace(/(#.*$)/gm, '<span class="text-dark-500">$1</span>')
    .replace(/('''[\s\S]*?'''|"""[\s\S]*?""")/g, '<span class="text-dark-500">$1</span>')
    .replace(/(".*?"|'.*?')/g, '<span class="text-green-400">$1</span>')
    .replace(/\b(def|class|return|if|elif|else|for|while|break|continue|try|except|finally|raise|import|from|as|with|pass|lambda|yield|global|nonlocal|assert|del|in|is|not|and|or|True|False|None)\b/g, '<span class="text-pink-400">$1</span>')
    .replace(/\b(int|str|float|bool|list|dict|tuple|set|frozenset|type|object|print|len|range|enumerate|zip|map|filter|reduce|sorted|reversed|sum|min|max|abs|round|open|input|isinstance|issubclass|super|self|cls)\b/g, '<span class="text-cyan-400">$1</span>')
    .replace(/\b(\d+\.?\d*j?|0x[0-9a-fA-F]+|0o[0-7]+|0b[01]+)\b/g, '<span class="text-orange-400">$1</span>')
    .replace(/(@\w+)/g, '<span class="text-yellow-400">$1</span>');
};

const highlightGo = (code: string): string => {
  return code
    .replace(/(\/\/.*$)/gm, '<span class="text-dark-500">$1</span>')
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-dark-500">$1</span>')
    .replace(/(".*?"|`[^`]*`)/g, '<span class="text-green-400">$1</span>')
    .replace(/\b(func|package|import|var|const|type|struct|interface|return|if|else|for|range|switch|case|default|break|continue|go|defer|select|chan|map|make|new|len|cap|append|copy|close|delete|panic|recover|true|false|nil|iota)\b/g, '<span class="text-pink-400">$1</span>')
    .replace(/\b(int|int8|int16|int32|int64|uint|uint8|uint16|uint32|uint64|float32|float64|complex64|complex128|bool|string|byte|rune|error|interface{}|struct)\b/g, '<span class="text-cyan-400">$1</span>')
    .replace(/\b(\d+\.?\d*|0x[0-9a-fA-F]+|0o[0-7]+|0b[01]+)\b/g, '<span class="text-orange-400">$1</span>');
};

const highlightJavaScript = (code: string): string => {
  return code
    .replace(/(\/\/.*$)/gm, '<span class="text-dark-500">$1</span>')
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-dark-500">$1</span>')
    .replace(/(`[^`]*`)/g, '<span class="text-green-400">$1</span>')
    .replace(/(".*?"|'.*?')/g, '<span class="text-green-400">$1</span>')
    .replace(/\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|class|extends|super|import|export|default|from|as|async|await|yield|typeof|instanceof|delete|void|this|arguments|true|false|null|undefined|NaN|Infinity|of|in)\b/g, '<span class="text-pink-400">$1</span>')
    .replace(/\b(String|Number|Boolean|Array|Object|Function|Date|Math|JSON|RegExp|Promise|Map|Set|WeakMap|WeakSet|Symbol|BigInt|console|window|document|navigator|globalThis|process)\b/g, '<span class="text-cyan-400">$1</span>')
    .replace(/\b(\d+\.?\d*|0x[0-9a-fA-F]+|0o[0-7]+|0b[01]+)\b/g, '<span class="text-orange-400">$1</span>');
};

const highlightTypeScript = (code: string): string => {
  let highlighted = highlightJavaScript(code);
  highlighted = highlighted
    .replace(/\b(interface|type|enum|implements|private|protected|public|readonly|abstract|static|namespace|module|declare|keyof|typeof|infer|never|unknown|any|void|never|string|number|boolean|object|symbol|bigint)\b/g, '<span class="text-cyan-400">$1</span>');
  return highlighted;
};

const highlightSQL = (code: string): string => {
  return code
    .replace(/(--.*$)/gm, '<span class="text-dark-500">$1</span>')
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-dark-500">$1</span>')
    .replace(/('.*?')/g, '<span class="text-green-400">$1</span>')
    .replace(/\b(SELECT|FROM|WHERE|AND|OR|NOT|IN|EXISTS|LIKE|BETWEEN|IS|NULL|ORDER|BY|ASC|DESC|GROUP|HAVING|LIMIT|OFFSET|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|ON|AS|UNION|ALL|DISTINCT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|VIEW|ALTER|DROP|TRUNCATE|PRIMARY|KEY|FOREIGN|REFERENCES|UNIQUE|DEFAULT|CHECK|AUTO_INCREMENT|COMMIT|ROLLBACK|BEGIN|TRANSACTION|GRANT|REVOKE|USE|SHOW|DESCRIBE|EXPLAIN)\b/gi, '<span class="text-pink-400">$1</span>')
    .replace(/\b(INT|INTEGER|BIGINT|SMALLINT|TINYINT|DECIMAL|FLOAT|DOUBLE|CHAR|VARCHAR|TEXT|BLOB|DATE|TIME|DATETIME|TIMESTAMP|BOOLEAN|ENUM|SET|BINARY|VARBINARY)\b/gi, '<span class="text-cyan-400">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-orange-400">$1</span>');
};

const highlightRedis = (code: string): string => {
  return code
    .replace(/(#.*$)/gm, '<span class="text-dark-500">$1</span>')
    .replace(/\b(SET|GET|DEL|EXISTS|KEYS|TYPE|EXPIRE|TTL|PERSIST|RENAME|MSET|MGET|INCR|INCRBY|DECR|DECRBY|APPEND|STRLEN|GETRANGE|SETRANGE|GETSET|SETEX|SETNX|MSETNX|INCRBYFLOAT|HSET|HGET|HMSET|HMGET|HGETALL|HDEL|HEXISTS|HLEN|HKEYS|HVALS|HINCRBY|HINCRBYFLOAT|HSETNX|LPUSH|RPUSH|LPOP|RPOP|LLEN|LRANGE|LINDEX|LSET|LREM|LTRIM|LPOS|SADD|SREM|SMEMBERS|SISMEMBER|SCARD|SINTER|SUNION|SDIFF|SPOP|SRANDMEMBER|SMOVE|ZADD|ZREM|ZSCORE|ZINCRBY|ZRANGE|ZREVRANGE|ZRANGEBYSCORE|ZREVRANGEBYSCORE|ZRANK|ZREVRANK|ZCOUNT|ZCARD|ZPOPMAX|ZPOPMIN|XADD|XREAD|XLEN|XGROUP|XACK|PUBLISH|SUBSCRIBE|UNSUBSCRIBE|PSUBSCRIBE|PUNSUBSCRIBE|CONFIG|INFO|CLIENT|DBSIZE|FLUSHDB|FLUSHALL|SAVE|BGSAVE|LASTSAVE|BGREWRITEAOF|SHUTDOWN|SLOWLOG|MONITOR|EXPLAIN|SCAN|HSCAN|SSCAN|ZSCAN)\b/gi, '<span class="text-pink-400">$1</span>')
    .replace(/(".*?"|'.*?')/g, '<span class="text-green-400">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-orange-400">$1</span>');
};

const highlightBash = (code: string): string => {
  return code
    .replace(/(#.*$)/gm, '<span class="text-dark-500">$1</span>')
    .replace(/(".*?"|'.*?')/g, '<span class="text-green-400">$1</span>')
    .replace(/\b(echo|cd|ls|pwd|mkdir|rm|cp|mv|cat|grep|find|sed|awk|sort|uniq|head|tail|wc|cut|tr|chmod|chown|chgrp|tar|gzip|gunzip|zip|unzip|ssh|scp|curl|wget|ps|kill|top|htop|df|du|free|uptime|who|whoami|uname|date|cal|history|export|source|if|then|else|fi|for|do|done|while|case|esac|function|return|exit|test|\[|\[\[|==|=~|!|&&|\|\|)\b/g, '<span class="text-pink-400">$1</span>')
    .replace(/\$[a-zA-Z_][a-zA-Z0-9_]*/g, '<span class="text-cyan-400">$&</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-orange-400">$1</span>');
};

const highlightProperties = (code: string): string => {
  return code
    .replace(/(#.*$)/gm, '<span class="text-dark-500">$1</span>')
    .replace(/^([^=]+)=/gm, '<span class="text-cyan-400">$1</span>=')
    .replace(/=(.+)$/gm, '=<span class="text-green-400">$1</span>');
};

const highlightJSON = (code: string): string => {
  return code
    .replace(/"([^"]+)"(\s*:)/g, '<span class="text-cyan-400">"$1"</span>$2')
    .replace(/:\s*"([^"]*)"/g, ': <span class="text-green-400">"$1"</span>')
    .replace(/:\s*(true|false|null)\b/gi, ': <span class="text-pink-400">$1</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span class="text-orange-400">$1</span>');
};

const highlightYaml = (code: string): string => {
  return code
    .replace(/(#.*$)/gm, '<span class="text-dark-500">$1</span>')
    .replace(/^(\s*[^:#]+):/gm, '<span class="text-cyan-400">$1</span>:')
    .replace(/:\s*(".*?"|'.*?')/g, ': <span class="text-green-400">$1</span>')
    .replace(/:\s*(true|false|null|yes|no)\b/gi, ': <span class="text-pink-400">$1</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span class="text-orange-400">$1</span>')
    .replace(/^(\s*-\s+)/gm, '<span class="text-pink-400">$1</span>');
};

const highlightGeneric = (code: string): string => {
  return code
    .replace(/(\/\/.*$|#.*$)/gm, '<span class="text-dark-500">$1</span>')
    .replace(/(".*?"|'.*?')/g, '<span class="text-green-400">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-orange-400">$1</span>');
};

const highlightCode = (code: string, language: string): string => {
  const lang = getLanguageName(language);
  
  switch (lang) {
    case 'java':
      return highlightJava(code);
    case 'python':
      return highlightPython(code);
    case 'go':
      return highlightGo(code);
    case 'javascript':
      return highlightJavaScript(code);
    case 'typescript':
      return highlightTypeScript(code);
    case 'sql':
      return highlightSQL(code);
    case 'redis':
      return highlightRedis(code);
    case 'bash':
      return highlightBash(code);
    case 'properties':
    case 'ini':
      return highlightProperties(code);
    case 'json':
      return highlightJSON(code);
    case 'yaml':
    case 'yml':
      return highlightYaml(code);
    default:
      return highlightGeneric(code);
  }
};

export default function CodeBlock({ 
  code, 
  language = 'java', 
  collapsible = true,
  defaultCollapsed = false,
  maxCollapsedLines = 15
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  
  const lines = useMemo(() => code.split('\n'), [code]);
  const lineCount = lines.length;
  const canCollapse = collapsible && lineCount > maxCollapsedLines;
  
  const displayedCode = useMemo(() => {
    if (isCollapsed && canCollapse) {
      return lines.slice(0, maxCollapsedLines).join('\n');
    }
    return code;
  }, [code, isCollapsed, canCollapse, lines, maxCollapsedLines]);
  
  const displayedLines = useMemo(() => displayedCode.split('\n'), [displayedCode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const highlightedCode = highlightCode(displayedCode, language);
  const highlightedLines = highlightedCode.split('\n');

  return (
    <div className="code-block my-4">
      <div className="code-block-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="uppercase text-xs font-medium">{language}</span>
          <span className="text-dark-500 text-xs">{lineCount} 行</span>
        </div>
        <div className="flex items-center gap-2">
          {canCollapse && (
            <button
              onClick={toggleCollapse}
              className="flex items-center gap-1 px-2 py-1 text-xs hover:text-white transition-colors"
            >
              {isCollapsed ? (
                <>
                  <ChevronDown className="w-3 h-3" />
                  展开
                </>
              ) : (
                <>
                  <ChevronRight className="w-3 h-3" />
                  折叠
                </>
              )}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-green-400" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                复制
              </>
            )}
          </button>
        </div>
      </div>
      <div className="code-block-content">
        <pre className="m-0 flex">
          <div className="code-line-numbers select-none text-right pr-3 text-dark-500 text-sm border-r border-dark-700 mr-3">
            {displayedLines.map((_, index) => (
              <div key={index} className="leading-6">
                {index + 1}
              </div>
            ))}
          </div>
          <div className="flex-1 overflow-x-auto">
            <code
              dangerouslySetInnerHTML={{ 
                __html: highlightedLines.map((line, i) => 
                  `<div class="leading-6">${line || '&nbsp;'}</div>`
                ).join('') 
              }}
            />
          </div>
        </pre>
      </div>
      {isCollapsed && canCollapse && (
        <div 
          className="code-block-expand-tip py-2 text-center text-dark-400 text-sm cursor-pointer hover:text-white transition-colors border-t border-dark-700"
          onClick={toggleCollapse}
        >
          还有 {lineCount - maxCollapsedLines} 行代码，点击展开查看全部
        </div>
      )}
    </div>
  );
}
