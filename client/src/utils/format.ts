/**
 * 格式化工具函数
 *
 * 从原始 app.js 100% 迁移
 * 参考: 交接规范.json §指标计算规范.格式化函数
 */

/** 安全除法 — 如果 b 为 0 或 falsy 返回 0 */
export function safeDiv(a: number, b: number): number {
  return b && b !== 0 ? a / b : 0;
}

/** 整数格式化 (en-US locale) */
export function fmtInt(n: number): string {
  return Math.round(n || 0).toLocaleString('en-US');
}

/** 小数格式化，默认 2 位 */
export function fmtDec(n: number, d: number = 2): string {
  return (n || 0).toFixed(d);
}

/** 货币格式化: $X,XXX.XX */
export function fmtMoney(n: number): string {
  return '$' + (n || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** 百分比格式化: XX.XX% */
export function fmtPct(n: number): string {
  return (n * 100).toFixed(2) + '%';
}

/** 比率格式化: X.XX */
export function fmtRatio(n: number): string {
  return (n || 0).toFixed(2);
}
