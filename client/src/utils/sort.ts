/**
 * 排序工具函数
 *
 * 从原始 app.js 100% 迁移
 */

import type { SortState } from '../types/data';

/**
 * 按 key 排序对象数组
 */
export function sortByKey<T extends Record<string, any>>(
  arr: T[],
  key: string,
  dir: 'asc' | 'desc',
): T[] {
  return arr.slice().sort((a, b) => {
    let va = a[key];
    let vb = b[key];

    // null/undefined → 末尾
    if (va === undefined || va === null) va = dir === 'asc' ? 1e99 : -1e99;
    if (vb === undefined || vb === null) vb = dir === 'asc' ? 1e99 : -1e99;

    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();

    if (va < vb) return dir === 'asc' ? -1 : 1;
    if (va > vb) return dir === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * 获取排序图标
 */
export function getSortIcon(tableSort: Record<string, SortState>, tableId: string, key: string): string {
  const s = tableSort[tableId];
  if (s && s.key === key) {
    return s.dir === 'asc' ? ' △' : ' ▿';
  }
  return '';
}
