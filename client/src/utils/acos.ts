/**
 * ACOS 相关工具函数
 *
 * 从原始 app.js 100% 迁移
 */

/**
 * ACOS 色阶 CSS 类
 */
export function acosColorClass(acos: number): string {
  if (acos <= 0) return 'cell-acos-zero';
  if (acos <= 0.35) return 'cell-acos-low';
  if (acos <= 0.50) return 'cell-acos-mid';
  if (acos <= 1.00) return 'cell-acos-high';
  return 'cell-acos-critical';
}

/**
 * ACOS 状态圆点 CSS 类
 */
export function acosDotClass(acos: number): string {
  if (acos <= 0) return 'dot-gray';
  if (acos <= 0.35) return 'dot-green';
  if (acos <= 0.50) return 'dot-amber';
  if (acos <= 1.00) return 'dot-orange';
  return 'dot-red';
}

/**
 * CAM 色阶 (异常CAM日进度表格)
 * 将 count/maxVal 比值映射到 0-5 档
 */
export function camScaleClass(count: number, maxVal: number): string {
  const ratio = maxVal > 0 ? count / maxVal : 0;
  if (ratio <= 0) return 'cam-scale-0';
  if (ratio <= 0.2) return 'cam-scale-1';
  if (ratio <= 0.4) return 'cam-scale-2';
  if (ratio <= 0.6) return 'cam-scale-3';
  if (ratio <= 0.8) return 'cam-scale-4';
  return 'cam-scale-5';
}
