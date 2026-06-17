import { useState } from 'react';
import { Save, Trash2, FileCode, Clock, Plus, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCodeSnippetStore } from '@/store/useCodeSnippetStore';
import type { CodeSnippet, SupportedLanguage } from '@/types';

interface SnippetManagerProps {
  /** 当前代码 */
  currentCode: string;
  /** 当前语言 */
  currentLanguage: SupportedLanguage;
  /** 加载代码片段回调 */
  onLoadSnippet: (snippet: CodeSnippet) => void;
  /** 是否展开 */
  isOpen: boolean;
  /** 切换展开状态 */
  onToggle: () => void;
}

/**
 * 代码片段管理组件
 * 提供保存、加载、删除代码片段的功能
 */
export default function SnippetManager({
  currentCode,
  currentLanguage,
  onLoadSnippet,
  isOpen,
  onToggle,
}: SnippetManagerProps) {
  const { 
    snippets, 
    saveSnippet, 
    deleteSnippet, 
    getCurrentSnippet,
    setCurrentSnippet,
    currentSnippetId 
  } = useCodeSnippetStore();
  
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  /**
   * 打开保存对话框
   */
  const handleOpenSaveDialog = () => {
    const current = getCurrentSnippet();
    setSnippetTitle(current ? current.title : `未命名 ${new Date().toLocaleString()}`);
    setShowSaveDialog(true);
  };

  /**
   * 保存代码片段
   */
  const handleSave = () => {
    const title = snippetTitle.trim() || '未命名代码';
    const current = getCurrentSnippet();
    
    if (current) {
      // 更新现有片段
      useCodeSnippetStore.getState().updateSnippet(current.id, {
        title,
        code: currentCode,
        language: currentLanguage,
      });
    } else {
      // 创建新片段
      saveSnippet(title, currentCode, currentLanguage);
    }
    
    setShowSaveDialog(false);
  };

  /**
   * 加载代码片段
   */
  const handleLoad = (snippet: CodeSnippet) => {
    setCurrentSnippet(snippet.id);
    onLoadSnippet(snippet);
    onToggle();
  };

  /**
   * 删除代码片段
   */
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('确定要删除这个代码片段吗？')) {
      deleteSnippet(id);
    }
  };

  /**
   * 开始重命名
   */
  const startEdit = (e: React.MouseEvent, snippet: CodeSnippet) => {
    e.stopPropagation();
    setEditingId(snippet.id);
    setEditingTitle(snippet.title);
  };

  /**
   * 完成重命名
   */
  const finishEdit = () => {
    if (editingId && editingTitle.trim()) {
      useCodeSnippetStore.getState().updateSnippet(editingId, {
        title: editingTitle.trim(),
      });
    }
    setEditingId(null);
  };

  /**
   * 格式化时间
   */
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString('zh-CN');
  };

  /**
   * 获取语言标签颜色
   */
  const getLanguageColor = (lang: string): string => {
    switch (lang) {
      case 'javascript':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'python':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-dark-600 text-dark-300';
    }
  };

  /**
   * 获取语言名称
   */
  const getLanguageName = (lang: string): string => {
    switch (lang) {
      case 'javascript':
        return 'JavaScript';
      case 'python':
        return 'Python';
      default:
        return lang;
    }
  };

  return (
    <>
      {/* 切换按钮 */}
      <button
        onClick={onToggle}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 p-2 bg-dark-800 border border-dark-700 border-r-0 rounded-l-lg hover:bg-dark-700 transition-colors"
        title={isOpen ? '收起代码片段' : '展开代码片段'}
      >
        {isOpen ? (
          <ChevronRight className="w-5 h-5 text-dark-400" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-dark-400" />
        )}
      </button>

      {/* 侧边栏 */}
      <div 
        className={`fixed right-0 top-0 h-full w-72 bg-dark-800 border-l border-dark-700 z-30 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-primary-400" />
            代码片段
          </h3>
          <button
            onClick={handleOpenSaveDialog}
            className="p-1.5 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
            title="保存当前代码"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>

        {/* 保存当前代码按钮 */}
        <div className="p-3 border-b border-dark-700">
          <button
            onClick={handleOpenSaveDialog}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-500/10 text-primary-400 rounded-lg hover:bg-primary-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            保存当前代码
          </button>
        </div>

        {/* 代码片段列表 */}
        <div className="flex-1 overflow-y-auto p-2">
          {snippets.length === 0 ? (
            <div className="text-center py-8 text-dark-500">
              <FileCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无保存的代码片段</p>
              <p className="text-xs mt-1">点击上方按钮保存你的代码</p>
            </div>
          ) : (
            <div className="space-y-1">
              {snippets.map((snippet) => (
                <div
                  key={snippet.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                    currentSnippetId === snippet.id
                      ? 'bg-primary-500/20 border border-primary-500/30'
                      : 'hover:bg-dark-700 border border-transparent'
                  }`}
                  onClick={() => handleLoad(snippet)}
                >
                  {editingId === snippet.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={finishEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') finishEdit();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="flex-1 bg-dark-900 border border-dark-600 rounded px-2 py-1 text-sm text-white outline-none focus:border-primary-500"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          finishEdit();
                        }}
                        className="p-1 text-green-400 hover:text-green-300"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span 
                          className="text-sm font-medium text-white truncate flex-1"
                          onDoubleClick={(e) => startEdit(e, snippet)}
                          title="双击重命名"
                        >
                          {snippet.title}
                        </span>
                        <button
                          onClick={(e) => handleDelete(e, snippet.id)}
                          className="p-1 text-dark-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-dark-500">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${getLanguageColor(snippet.language)}`}>
                          {getLanguageName(snippet.language)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(snippet.updatedAt)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 保存对话框 */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-dark-800 rounded-xl border border-dark-700 w-96 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {getCurrentSnippet() ? '更新代码片段' : '保存代码片段'}
              </h3>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="p-1 text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-dark-400 mb-2">代码标题</label>
              <input
                type="text"
                value={snippetTitle}
                onChange={(e) => setSnippetTitle(e.target.value)}
                placeholder="输入代码标题..."
                className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder:text-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') setShowSaveDialog(false);
                }}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-dark-400 mb-2">编程语言</label>
              <span className={`inline-block px-2.5 py-1 rounded-lg text-sm ${getLanguageColor(currentLanguage)}`}>
                {getLanguageName(currentLanguage)}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 py-2 px-4 bg-dark-700 text-dark-300 rounded-lg hover:bg-dark-600 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


