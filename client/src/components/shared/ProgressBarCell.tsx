import React from 'react';
import { fmtInt, fmtMoney, fmtPct } from '../../utils/format';

interface ProgressBarCellProps {
  value: number;
  maxValue: number;
  /** 'money' | 'int' | 'pct' */
  format?: 'money' | 'int' | 'pct';
}

/**
 * 进度条单元格组件
 *
 * 文字值在上 + 底部 3px 高进度条
 * 5 档色阶: lvl-1 ~ lvl-5
 */
export const ProgressBarCell: React.FC<ProgressBarCellProps> = ({
  value,
  maxValue,
  format = 'money',
}) => {
  const pct = Math.min((value / (maxValue || 1)) * 100, 100);

  const fmtVal = (): string => {
    switch (format) {
      case 'money': return fmtMoney(value);
      case 'int': return fmtInt(value);
      case 'pct': return fmtPct(value);
      default: return String(value);
    }
  };

  const levelClass = (): string => {
    if (pct >= 80) return 'lvl-5';
    if (pct >= 60) return 'lvl-4';
    if (pct >= 40) return 'lvl-3';
    if (pct >= 20) return 'lvl-2';
    return 'lvl-1';
  };

  return (
    <div className="progress-bar-cell">
      <span className="progress-bar-value">{fmtVal()}</span>
      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill ${levelClass()}`}
          style={{ width: `${pct.toFixed(0)}%` }}
        />
      </div>
    </div>
  );
};
