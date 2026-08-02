/**
 * 筛选过滤函数
 *
 * 从原始 app.js 100% 迁移
 * 参考: 交接规范.json §筛选器规范
 */

import { COL } from '../constants/col-mapping';
import type { AdRow } from '../types/data';
import type { FilterState } from '../types/filters';

/**
 * 检查单行数据是否通过所有筛选器
 *
 * 被 applyFilters (当前文件) 和 异常CAM表格 (每个选中文件) 共用
 * 不包含文件筛选和是否新增筛选
 */
export function rowPassesFilters(r: AdRow, filters: FilterState): boolean {
  // 开关筛选
  if (filters['filter-switch']?.length) {
    if (!filters['filter-switch'].includes(r[COL.开关])) return false;
  }

  // 投放状态筛选
  if (filters['filter-status']?.length) {
    if (!filters['filter-status'].includes(r[COL.投放状态])) return false;
  }

  // 店铺筛选
  if (filters['filter-store']?.length) {
    if (!filters['filter-store'].includes(r[COL.店铺])) return false;
  }

  // 业务组筛选
  if (filters['filter-bizgroup']?.length) {
    if (!filters['filter-bizgroup'].includes(r[COL.业务组])) return false;
  }

  // 业务负责人筛选
  if (filters['filter-owner']?.length) {
    if (!filters['filter-owner'].includes(r[COL.业务负责人])) return false;
  }

  // 三级分类筛选
  if (filters['filter-category']?.length) {
    if (!filters['filter-category'].includes(r[COL.三级分类])) return false;
  }

  // 广告类型筛选
  if (filters['filter-adtype']?.length) {
    if (!filters['filter-adtype'].includes(r[COL.广告类型])) return false;
  }

  // 广告活动文本搜索 (模糊匹配)
  if (filters['filter-campaign']?.length) {
    const search = filters['filter-campaign'][0]?.toLowerCase();
    if (search && !(r[COL.广告活动] || '').toLowerCase().includes(search)) return false;
  }

  return true;
}

/**
 * 应用筛选器到数据行列表
 */
export function applyFilters(rows: AdRow[], filters: FilterState): AdRow[] {
  return rows.filter((r) => rowPassesFilters(r, filters));
}
