/**
 * 广告数据 16 列映射 (不可变约束)
 *
 * 从原始 app.js 迁移，索引映射不可更改
 * 参考: 交接规范.json §数据规范.COL列映射
 */

export const COL = {
  /** 投放状态 */ 投放状态: 0 as const,
  /** 店铺 */ 店铺: 1 as const,
  /** 业务组 */ 业务组: 2 as const,
  /** 业务负责人 */ 业务负责人: 3 as const,
  /** 三级分类 */ 三级分类: 4 as const,
  /** 广告类型 */ 广告类型: 5 as const,
  /** 广告活动 */ 广告活动: 6 as const,
  /** 日预算 */ 日预算: 7 as const,
  /** 当前预算 */ 当前预算: 8 as const,
  /** 花费 */ 花费: 9 as const,
  /** 曝光量 */ 曝光量: 10 as const,
  /** 点击量 */ 点击量: 11 as const,
  /** 销量 */ 销量: 12 as const,
  /** 销售额 */ 销售额: 13 as const,
  /** 推广商品销量 */ 推广商品销量: 14 as const,
  /** 开关 */ 开关: 15 as const,
} as const;

/** 列索引 → 列名 */
export const COL_NAMES: Record<number, string> = {
  0: '投放状态',
  1: '店铺',
  2: '业务组',
  3: '业务负责人',
  4: '三级分类',
  5: '广告类型',
  6: '广告活动',
  7: '日预算',
  8: '当前预算',
  9: '花费',
  10: '曝光量',
  11: '点击量',
  12: '销量',
  13: '销售额',
  14: '推广商品销量',
  15: '开关',
};

/** Excel 列名列表 (用于表头匹配) */
export const NEEDED_COLS = [
  '投放状态', '店铺', '业务组', '业务负责人', '三级分类',
  '广告类型', '广告活动', '日预算', '当前预算', '花费',
  '曝光量', '点击量', '销量', '销售额', '推广商品销量', '开关',
] as const;

/** 广告类型标签映射 */
export const AD_TYPE_LABELS: Record<string, string> = {
  sponsoredProducts: 'SP (Sponsored Products)',
  sponsoredBrands: 'SB (Sponsored Brands)',
  sponsoredDisplay: 'SD (Sponsored Display)',
};

/** 文件名格式: YYYYMMDD_YYYYMMDD */
export const FILE_NAME_REGEX = /^(\d{8})_(\d{8})$/;
