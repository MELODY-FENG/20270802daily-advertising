/**
 * 核心数据类型定义
 *
 * 从原始 app.js 迁移
 * 参考: 交接规范.json §数据规范
 */

/**
 * 广告数据行 — 16 列元组
 * 索引: 投放状态(0) 店铺(1) 业务组(2) 业务负责人(3) 三级分类(4)
 *       广告类型(5) 广告活动(6) 日预算(7) 当前预算(8) 花费(9)
 *       曝光量(10) 点击量(11) 销量(12) 销售额(13) 推广商品销量(14) 开关(15)
 */
export type AdRow = [
  string,   // 0  投放状态
  string,   // 1  店铺
  string,   // 2  业务组
  string,   // 3  业务负责人
  string,   // 4  三级分类
  string,   // 5  广告类型
  string,   // 6  广告活动
  number,   // 7  日预算
  number,   // 8  当前预算
  number,   // 9  花费
  number,   // 10 曝光量
  number,   // 11 点击量
  number,   // 12 销量
  number,   // 13 销售额
  number,   // 14 推广商品销量
  string,   // 15 开关
];

/** 聚合指标结果 */
export interface AggregateResult {
  campaignCount: number;
  dailyBudget: number;
  currentBudget: number;
  spend: number;
  impressions: number;
  clicks: number;
  sales: number;
  salesAmount: number;
  promotedSales: number;
  cpc: number;
  ctr: number;
  cvr: number;
  cpo: number;
  acos: number;
  roas: number;
  directRate: number;
}

/** 广告活动 (CAM) 聚合数据 */
export interface CampaignAgg extends AggregateResult {
  name: string;
  rows: AdRow[];
  业务组: string;
  业务负责人: string;
  三级分类: string;
  广告类型: string;
  店铺: string;
  投放状态: string;
}

/** 分组聚合结果 */
export interface GroupAgg extends AggregateResult {
  key: string;
}

/** 双键分组聚合结果 */
export interface TwoKeyGroupAgg extends AggregateResult {
  key1: string;
  key2: string;
}

/** 文件条目 */
export interface FileEntry {
  data: AdRow[];
  rawName: string;
}

/** 表格排序状态 */
export interface SortState {
  key: string;
  dir: 'asc' | 'desc';
}

/** 表格统计 (用于进度条和箭头) */
export interface TableStats {
  maxSpend: number;
  maxClicks: number;
  maxSalesAmount: number;
  avgCpc: number;
  avgCtr: number;
  avgCvr: number;
  avgCpo: number;
}
