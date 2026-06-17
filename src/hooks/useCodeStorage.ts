import { useState, useEffect, useCallback } from 'react';
import type { SavedCode, SupportedLanguage } from '@/types';

const STORAGE_KEY = 'playground_saved_codes';

/**
 * 代码存储 Hook
 * 使用 localStorage 持久化保存用户的代码片段
 * 支持保存、加载、删除和更新代码片段
 */
export function useCodeStorage() {
  const [savedCodes, setSavedCodes] = useState<SavedCode[]>([]);

  /**
   * 从 localStorage 加载保存的代码
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedCodes(JSON.parse(stored));
      }
    } catch (err) {
      console.error('加载保存的代码失败:', err);
    }
  }, []);

  /**
   * 保存代码列表到 localStorage
   */
  const saveToStorage = useCallback((codes: SavedCode[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
      setSavedCodes(codes);
    } catch (err) {
      console.error('保存代码失败:', err);
    }
  }, []);

  /**
   * 保存新的代码片段
   * @param name 代码片段名称
   * @param code 代码内容
   * @param language 编程语言
   * @returns 保存后的代码片段对象
   */
  const saveCode = useCallback((name: string, code: string, language: SupportedLanguage): SavedCode => {
    const now = Date.now();
    const newCode: SavedCode = {
      id: `code_${now}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      language,
      code,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newCode, ...savedCodes];
    saveToStorage(updated);
    return newCode;
  }, [savedCodes, saveToStorage]);

  /**
   * 更新已保存的代码片段
   * @param id 代码片段 ID
   * @param updates 更新的字段
   */
  const updateCode = useCallback((id: string, updates: Partial<Omit<SavedCode, 'id' | 'createdAt'>>) => {
    const updated = savedCodes.map((item) =>
      item.id === id
        ? { ...item, ...updates, updatedAt: Date.now() }
        : item
    );
    saveToStorage(updated);
  }, [savedCodes, saveToStorage]);

  /**
   * 删除保存的代码片段
   * @param id 代码片段 ID
   */
  const deleteCode = useCallback((id: string) => {
    const updated = savedCodes.filter((item) => item.id !== id);
    saveToStorage(updated);
  }, [savedCodes, saveToStorage]);

  /**
   * 根据 ID 获取代码片段
   * @param id 代码片段 ID
   */
  const getCodeById = useCallback((id: string): SavedCode | undefined => {
    return savedCodes.find((item) => item.id === id);
  }, [savedCodes]);

  /**
   * 根据语言过滤代码片段
   * @param language 编程语言
   */
  const getCodesByLanguage = useCallback((language: SupportedLanguage): SavedCode[] => {
    return savedCodes.filter((item) => item.language === language);
  }, [savedCodes]);

  return {
    savedCodes,
    saveCode,
    updateCode,
    deleteCode,
    getCodeById,
    getCodesByLanguage,
  };
}
