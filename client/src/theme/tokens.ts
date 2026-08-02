/**
 * 暖棕系设计 Token — CSS 变量名与值
 * 与 globals.css :root 保持同步
 */
export const colorTokens = {
  primary: '#A67C52',
  accent: '#8B6239',
  light: '#D9C8B4',
  bg: '#F8F3ED',
  tint: '#E8C9B0',
  textPrimary: '#4A3828',
  textSecondary: '#776251',
  good: '#7BA068',
  bad: '#C0805A',
} as const;

/** 指标卡片顶部色条 (三色循环) */
export const cardAccentColors = ['#A67C52', '#8B6239', '#7BA068'] as const;

/** ACOS 状态圆点颜色 */
export const acosDotColors = {
  zero: '#B0A090',
  low: '#7BA068',
  mid: '#D4A857',
  high: '#C8854A',
  critical: '#C0805A',
} as const;

/** 进度条 5 档色值 (棕色系) */
export const progressBarColors = {
  lvl1: '#D9C8B4',
  lvl2: '#C4A87E',
  lvl3: '#A67C52',
  lvl4: '#8B6239',
  lvl5: '#6B4A2A',
} as const;

/** 小矮人帽子颜色 */
export const dwarfHatColors = [
  '#E85D75', // 红
  '#5DADE2', // 蓝
  '#F4D03F', // 黄
  '#48C9B0', // 青
  '#AF7AC5', // 紫
  '#F1948A', // 粉
] as const;

/** ECharts 暖棕主题色板 */
export const echartsWarmBrownPalette = [
  '#A67C52',
  '#8B6239',
  '#D9C8B4',
  '#7BA068',
  '#C0805A',
  '#D4A857',
  '#C8854A',
  '#6B4A2A',
  '#C4A87E',
  '#B0A090',
] as const;
