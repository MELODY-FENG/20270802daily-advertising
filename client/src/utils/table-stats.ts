/**
 * 表格条件格式化辅助函数
 *
 * 从原始 app.js 100% 迁移
 * 参考: 交接规范.json §表格交互规范
 */

import { fmtMoney, fmtInt, fmtPct } from './format';
import type { GroupAgg, TableStats } from '../types/data';

/**
 * 计算表格统计 (最大值 + 均值)
 * 用于进度条宽度计算和箭头指示器
 */
export function computeTableStats(groups: GroupAgg[]): TableStats {
  let maxSpend = 0;
  let maxClicks = 0;
  let maxSalesAmount = 0;
  let sumCpc = 0;
  let sumCtr = 0;
  let sumCvr = 0;
  let sumCpo = 0;
  const n = groups.length;

  for (const g of groups) {
    if (g.spend > maxSpend) maxSpend = g.spend;
    if (g.clicks > maxClicks) maxClicks = g.clicks;
    if (g.salesAmount > maxSalesAmount) maxSalesAmount = g.salesAmount;
    sumCpc += g.cpc || 0;
    sumCtr += g.ctr || 0;
    sumCvr += g.cvr || 0;
    sumCpo += g.cpo || 0;
  }

  return {
    maxSpend: maxSpend || 1,
    maxClicks: maxClicks || 1,
    maxSalesAmount: maxSalesAmount || 1,
    avgCpc: n ? sumCpc / n : 0,
    avgCtr: n ? sumCtr / n : 0,
    avgCvr: n ? sumCvr / n : 0,
    avgCpo: n ? sumCpo / n : 0,
  };
}

/**
 * 进度条 5 档 CSS 类
 * val 相对 maxVal 的百分比 → 档位
 */
export function pbLevel(pct: number): string {
  if (pct >= 80) return 'lvl-5';
  if (pct >= 60) return 'lvl-4';
  if (pct >= 40) return 'lvl-3';
  if (pct >= 20) return 'lvl-2';
  return 'lvl-1';
}

/**
 * 箭头指示器
 * @param value 当前值
 * @param avg 平均值
 * @param higherIsBad true=高值表示差 (如CPC/CPO), false=高值表示好 (如CTR/CVR)
 * @returns HTML 字符串: ▲ (红色↑) / ▼ (绿色↓) / — (灰色)
 */
export function arrowIndicator(value: number, avg: number, higherIsBad: boolean = true): string {
  if (value > avg) {
    return higherIsBad
      ? '<span style="color:var(--c-bad)">▲</span>'    // 高=差 → 红色
      : '<span style="color:var(--c-good)">▲</span>';   // 高=好 → 绿色
  }
  if (value < avg) {
    return higherIsBad
      ? '<span style="color:var(--c-good)">▼</span>'    // 低=好 → 绿色
      : '<span style="color:var(--c-bad)">▼</span>';    // 低=差 → 红色
  }
  return '<span style="color:var(--text-secondary)">—</span>';
}

/**
 * 生成进度条 HTML (花费)
 */
export function pbSpendHtml(val: number, stats: TableStats): string {
  const pct = Math.min(val / stats.maxSpend * 100, 100);
  return `<div class="progress-bar-cell"><span class="progress-bar-value">${fmtMoney(val)}</span><div class="progress-bar-track"><div class="progress-bar-fill ${pbLevel(pct)}" style="width:${pct.toFixed(0)}%"></div></div></div>`;
}

/**
 * 生成进度条 HTML (点击量)
 */
export function pbClicksHtml(val: number, stats: TableStats): string {
  const pct = Math.min(val / stats.maxClicks * 100, 100);
  return `<div class="progress-bar-cell"><span class="progress-bar-value">${fmtInt(val)}</span><div class="progress-bar-track"><div class="progress-bar-fill ${pbLevel(pct)}" style="width:${pct.toFixed(0)}%"></div></div></div>`;
}

/**
 * 生成进度条 HTML (销额)
 */
export function pbSalesAmountHtml(val: number, stats: TableStats): string {
  const pct = Math.min(val / stats.maxSalesAmount * 100, 100);
  return `<div class="progress-bar-cell"><span class="progress-bar-value">${fmtMoney(val)}</span><div class="progress-bar-track"><div class="progress-bar-fill ${pbLevel(pct)}" style="width:${pct.toFixed(0)}%"></div></div></div>`;
}
