import React, { useMemo } from 'react';
import { MetricCard } from './MetricCard';
import { useDashboardStore } from '../../store/dashboardStore';
import { calcAggregates } from '../../utils/calc';
import { fmtInt, fmtMoney, fmtPct, fmtRatio } from '../../utils/format';

/** 指标卡片行 — 自动从 store 获取数据 */
export const MetricCardRow: React.FC = () => {
  const { filteredData } = useDashboardStore();
  const agg = useMemo(() => filteredData.length ? calcAggregates(filteredData) : null, [filteredData]);

  if (!agg) {
    return (
      <div className="data-module" style={{ textAlign: 'center', padding: 32 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>请上传 Excel 文件以查看指标</p>
      </div>
    );
  }

  const row1Defs = [
    { label: '广告活动去重计数', value: fmtInt(agg.campaignCount), cls: '' },
    { label: '日预算', value: fmtMoney(agg.dailyBudget), cls: 'money' },
    { label: '当前预算', value: fmtMoney(agg.currentBudget), cls: 'money' },
    { label: '花费', value: fmtMoney(agg.spend), cls: 'money' },
    { label: '曝光量', value: fmtInt(agg.impressions), cls: '' },
    { label: '点击量', value: fmtInt(agg.clicks), cls: '' },
    { label: '销量', value: fmtInt(agg.sales), cls: '' },
  ];

  const row2Defs = [
    { label: '$CPC', value: fmtMoney(agg.cpc), cls: 'money' },
    { label: 'CTR%', value: fmtPct(agg.ctr), cls: 'percent' },
    { label: 'CVR%', value: fmtPct(agg.cvr), cls: 'percent' },
    { label: '销额', value: fmtMoney(agg.salesAmount), cls: 'money' },
    { label: '$CPO', value: fmtMoney(agg.cpo), cls: 'money' },
    { label: 'ACOS%', value: fmtPct(agg.acos), cls: agg.acos > 0.5 ? 'bad' : 'good' },
    { label: 'ROAS', value: fmtRatio(agg.roas), cls: agg.roas >= 2 ? 'good' : 'bad' },
    { label: '直购率%', value: fmtPct(agg.directRate), cls: 'percent' },
  ];

  const renderRow = (defs: typeof row1Defs) => (
    <div className="metric-cards fade-in-section">
      {defs.map((d) => (
        <MetricCard key={d.label} label={d.label} value={d.value} valueClass={d.cls} />
      ))}
    </div>
  );

  return (
    <>
      <div className="section-title fade-in-section">指标概览</div>
      {renderRow(row1Defs)}
      {renderRow(row2Defs)}
    </>
  );
};
