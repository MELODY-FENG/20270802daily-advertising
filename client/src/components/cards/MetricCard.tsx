import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  valueClass?: string;
}

/** 单张指标卡片 — 纯磨砂玻璃立体效果，无顶部色条 */
export const MetricCard: React.FC<MetricCardProps> = ({ label, value, valueClass = '' }) => (
  <div className="metric-card">
    <div className="metric-label">{label}</div>
    <div className={`metric-value ${valueClass}`}>{value}</div>
  </div>
);
