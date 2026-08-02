/**
 * 筛选器定义 (9个下拉 + 1个文本搜索)
 *
 * 参考: 交接规范.json §筛选器规范
 */

export interface FilterDef {
  id: string;
  label: string;
  type: 'dropdown' | 'text';
  /** 对应的 COL 列索引 */
  colIndex?: number;
  /** 说明文本 */
  description?: string;
}

export const FILTER_DEFS: FilterDef[] = [
  { id: 'filter-switch', label: '开关', type: 'dropdown', colIndex: 15 },
  { id: 'filter-file', label: '文件', type: 'dropdown', description: '选项来自已加载文件列表' },
  { id: 'filter-status', label: '投放状态', type: 'dropdown', colIndex: 0 },
  { id: 'filter-store', label: '店铺', type: 'dropdown', colIndex: 1 },
  { id: 'filter-bizgroup', label: '业务组', type: 'dropdown', colIndex: 2 },
  { id: 'filter-owner', label: '业务负责人', type: 'dropdown', colIndex: 3 },
  { id: 'filter-category', label: '三级分类', type: 'dropdown', colIndex: 4 },
  { id: 'filter-adtype', label: '广告类型', type: 'dropdown', colIndex: 5 },
  {
    id: 'filter-isnew',
    label: '是否新增',
    type: 'dropdown',
    description: '仅影响最新趋势警示表格，不影响其他表格',
  },
  { id: 'filter-campaign', label: '广告活动', type: 'text', colIndex: 6 },
];
