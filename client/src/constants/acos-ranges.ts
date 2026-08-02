/**
 * ACOS 五区间警示系统定义 (不可变约束)
 *
 * 参考: 交接规范.json §ACOS五区间警示系统
 */

export interface AcosRange {
  /** 是否为异常区间 (ACOS=0%) */
  isZero: boolean;
  /** 区间最小值 (isZero时忽略) */
  min?: number;
  /** 区间最大值 (isZero时忽略) */
  max?: number;
  /** 区间标签 */
  label: string;
  /** 区间名称 */
  name: string;
  /** 状态圆点 CSS 类 */
  dotClass: string;
}

/**
 * ACOS 五区间定义 (顺序不可更改)
 *
 * 1. 异常ACOS区间: ACOS=0% 且 点击量≥50
 * 2. 正常ACOS区间: ACOS≤35%
 * 3. 中高ACOS区间: ACOS＞35%且≤50%
 * 4. 高ACOS区间: ACOS＞50%且≤100%
 * 5. 超高ACOS区间: ACOS＞100%
 */
export const ACOS_RANGES: AcosRange[] = [
  {
    isZero: true,
    label: 'ACOS=0%且点击≥50',
    name: '异常ACOS区间',
    dotClass: 'dot-gray',
  },
  {
    isZero: false,
    min: 0,
    max: 0.35,
    label: 'ACOS≤35%',
    name: '正常ACOS区间',
    dotClass: 'dot-green',
  },
  {
    isZero: false,
    min: 0.35,
    max: 0.50,
    label: 'ACOS＞35%且≤50%',
    name: '中高ACOS区间',
    dotClass: 'dot-amber',
  },
  {
    isZero: false,
    min: 0.50,
    max: 1.00,
    label: 'ACOS＞50%且≤100%',
    name: '高ACOS区间',
    dotClass: 'dot-orange',
  },
  {
    isZero: false,
    min: 1.00,
    max: Infinity,
    label: 'ACOS＞100%',
    name: '超高ACOS区间',
    dotClass: 'dot-red',
  },
];
