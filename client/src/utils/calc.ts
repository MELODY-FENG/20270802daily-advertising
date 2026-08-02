/**
 * 聚合计算函数
 *
 * 从原始 app.js 100% 迁移
 * 参考: 交接规范.json §指标计算规范
 */

import { COL } from '../constants/col-mapping';
import { safeDiv } from './format';
import type { AdRow, AggregateResult, CampaignAgg, GroupAgg, TwoKeyGroupAgg } from '../types/data';

/**
 * 计算聚合指标
 *
 * 对一组数据行计算: campaignCount, dailyBudget, currentBudget,
 * spend, impressions, clicks, sales, salesAmount, promotedSales,
 * cpc, ctr, cvr, cpo, acos, roas, directRate
 */
export function calcAggregates(rows: AdRow[]): AggregateResult {
  const campaigns = new Set<string>();
  let dailyBudget = 0;
  let currentBudget = 0;
  let spend = 0;
  let impressions = 0;
  let clicks = 0;
  let sales = 0;
  let salesAmount = 0;
  let promotedSales = 0;

  for (const r of rows) {
    if (!r) continue;
    campaigns.add(r[COL.广告活动]);
    dailyBudget += r[COL.日预算] || 0;
    currentBudget += r[COL.当前预算] || 0;
    spend += r[COL.花费] || 0;
    impressions += r[COL.曝光量] || 0;
    clicks += r[COL.点击量] || 0;
    sales += r[COL.销量] || 0;
    salesAmount += r[COL.销售额] || 0;
    promotedSales += r[COL.推广商品销量] || 0;
  }

  return {
    campaignCount: campaigns.size,
    dailyBudget,
    currentBudget,
    spend,
    impressions,
    clicks,
    sales,
    salesAmount,
    promotedSales,
    cpc: safeDiv(spend, clicks),
    ctr: safeDiv(clicks, impressions),
    cvr: safeDiv(sales, clicks),
    cpo: safeDiv(spend, sales),
    acos: safeDiv(spend, salesAmount),
    roas: safeDiv(salesAmount, spend),
    directRate: safeDiv(promotedSales, sales),
  };
}

/**
 * 按广告活动 (CAM) 分组聚合
 */
export function groupByCampaign(rows: AdRow[]): CampaignAgg[] {
  const map = new Map<string, {
    name: string;
    rows: AdRow[];
    业务组: string;
    业务负责人: string;
    三级分类: string;
    广告类型: string;
    店铺: string;
    投放状态: string;
  }>();

  for (const r of rows) {
    if (!r) continue;
    const name = r[COL.广告活动];
    if (!map.has(name)) {
      map.set(name, {
        name,
        rows: [],
        业务组: r[COL.业务组],
        业务负责人: r[COL.业务负责人],
        三级分类: r[COL.三级分类],
        广告类型: r[COL.广告类型],
        店铺: r[COL.店铺],
        投放状态: r[COL.投放状态],
      });
    }
    map.get(name)!.rows.push(r);
  }

  const result: CampaignAgg[] = [];
  for (const [, info] of map) {
    const agg = calcAggregates(info.rows);
    result.push({ ...info, ...agg });
  }
  return result;
}

/**
 * 按单列分组聚合
 */
export function groupBy(rows: AdRow[], colIdx: number): GroupAgg[] {
  const map = new Map<string, AdRow[]>();
  for (const r of rows) {
    if (!r) continue;
    const key = r[colIdx] || '(空)';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  const result: GroupAgg[] = [];
  for (const [key, rs] of map) {
    result.push({ key, ...calcAggregates(rs) });
  }
  return result.sort((a, b) => b.spend - a.spend);
}

/**
 * 按双列分组聚合
 */
export function groupByTwo(rows: AdRow[], col1: number, col2: number): TwoKeyGroupAgg[] {
  const map = new Map<string, AdRow[]>();
  for (const r of rows) {
    if (!r) continue;
    const k1 = r[col1] || '(空)';
    const k2 = r[col2] || '(空)';
    const key = k1 + '|||' + k2;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  const result: TwoKeyGroupAgg[] = [];
  for (const [, rs] of map) {
    const agg = calcAggregates(rs);
    if (rs.length > 0) {
      result.push({
        key1: rs[0][col1] || '(空)',
        key2: rs[0][col2] || '(空)',
        ...agg,
      });
    }
  }
  return result.sort((a, b) => b.spend - a.spend);
}

/**
 * 获取某列的唯一值列表
 */
export function getUniqueValues(rows: AdRow[], colIdx: number): string[] {
  const set = new Set<string>();
  for (const r of rows) {
    if (!r) continue;
    const v = r[colIdx];
    if (v !== null && v !== undefined && v !== '') {
      set.add(String(v));
    }
  }
  return [...set].sort();
}
