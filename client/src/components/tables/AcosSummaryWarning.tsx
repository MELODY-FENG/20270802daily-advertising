import React, { useMemo, useState } from 'react';
import { Table, Collapse } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useDashboardStore } from '../../store/dashboardStore';
import { calcAggregates, groupByCampaign } from '../../utils/calc';
import { safeDiv } from '../../utils/format';
import { fmtInt, fmtMoney, fmtPct, fmtRatio } from '../../utils/format';
import { ACOS_RANGES } from '../../constants/acos-ranges';
import { StatusDot } from '../shared/StatusDot';
import type { CampaignAgg } from '../../types/data';

/** ACOS 五区间汇总警示 — 直接展开，不折叠 */
export const AcosSummaryWarning: React.FC = () => {
  const { filteredData, campaignCache } = useDashboardStore();
  const campaigns = useMemo(() => {
    if (campaignCache?.length) return campaignCache;
    return filteredData.length ? groupByCampaign(filteredData) : [];
  }, [filteredData, campaignCache]);

  const totalSpend = useMemo(() => campaigns.reduce((s, c) => s + c.spend, 0), [campaigns]);

  const camColumns: ColumnsType<CampaignAgg> = [
    { title: '广告活动', dataIndex: 'name', key: 'name', width: 200, sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: '花费', dataIndex: 'spend', key: 'spend', render: (v) => fmtMoney(v), sorter: (a, b) => a.spend - b.spend, defaultSortOrder: 'descend' },
    { title: '点击量', dataIndex: 'clicks', key: 'clicks', render: (v) => fmtInt(v), sorter: (a, b) => a.clicks - b.clicks },
    { title: '$CPC', dataIndex: 'cpc', key: 'cpc', render: (v) => fmtMoney(v), sorter: (a, b) => a.cpc - b.cpc },
    { title: 'CTR%', dataIndex: 'ctr', key: 'ctr', render: (v) => fmtPct(v), sorter: (a, b) => a.ctr - b.ctr },
    { title: 'CVR%', dataIndex: 'cvr', key: 'cvr', render: (v) => fmtPct(v), sorter: (a, b) => a.cvr - b.cvr },
    { title: '销额', dataIndex: 'salesAmount', key: 'sales', render: (v) => fmtMoney(v), sorter: (a, b) => a.salesAmount - b.salesAmount },
    { title: '$CPO', dataIndex: 'cpo', key: 'cpo', render: (v) => fmtMoney(v), sorter: (a, b) => a.cpo - b.cpo },
    { title: 'ACOS%', dataIndex: 'acos', key: 'acos', render: (v) => <span className={v > 1 ? 'cell-acos-critical' : v > 0.5 ? 'cell-acos-high' : 'cell-acos-low'} style={{ padding: '2px 6px', borderRadius: 4 }}>{fmtPct(v)}</span>, sorter: (a, b) => a.acos - b.acos },
    { title: 'ROAS', dataIndex: 'roas', key: 'roas', render: (v) => fmtRatio(v), sorter: (a, b) => a.roas - b.roas },
    { title: '直购率%', dataIndex: 'directRate', key: 'dr', render: (v) => fmtPct(v), sorter: (a, b) => a.directRate - b.directRate },
  ];

  if (!campaigns.length) {
    return (
      <div className="data-module fade-in-section">
        <div className="module-heading">汇总警示（按ACOS区间）</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>暂无数据。</p>
      </div>
    );
  }

  return (
    <div className="data-module fade-in-section">
      <div className="module-heading">汇总警示（按ACOS区间）</div>
      <div className="module-subtitle">ACOS 五区间分布概览</div>

      {ACOS_RANGES.map((range) => {
        const rangeCampaigns = range.isZero
          ? campaigns.filter((c) => c.acos <= 0 && c.clicks >= 50)
          : campaigns.filter((c) => c.acos > (range.min ?? 0) && c.acos <= (range.max ?? Infinity));

        if (!rangeCampaigns.length) return null;

        const rangeRows = rangeCampaigns.flatMap((c) => c.rows);
        const agg = calcAggregates(rangeRows);
        const spendRatio = safeDiv(agg.spend, totalSpend);
        // 异常区间使用修正后的标签
        const label = range.isZero ? "ACOS=0%, 点击量≥50" : range.label;

        return (
          <div key={range.label} style={{ marginBottom: 12 }}>
            <Collapse
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} style={{ fontSize: 10 }} />}
              style={{ background: 'transparent', border: 'none' }}
              items={[{
                key: range.label,
                label: (
                  <div className="acos-range-header" style={{ marginBottom: 0, cursor: 'pointer' }}>
                    <StatusDot acos={range.isZero ? 0 : ((range.min ?? 0) + (range.max ?? 1)) / 2} size={10} />
                    <span className="acos-range-label">{label}</span>
                    <span className="acos-range-name">| {range.name}</span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginLeft: 'auto' }}>
                      <span className="metric-pill"><span className="pill-label">CAM</span><span className="pill-value">{fmtInt(agg.campaignCount)}</span></span>
                      <span className="metric-pill"><span className="pill-label">花费</span><span className="pill-value">{fmtMoney(agg.spend)}</span></span>
                      <span className="metric-pill"><span className="pill-label">占比</span><span className="pill-value">{fmtPct(spendRatio)}</span></span>
                      <span className="metric-pill"><span className="pill-label">点击</span><span className="pill-value">{fmtInt(agg.clicks)}</span></span>
                      <span className="metric-pill"><span className="pill-label">$CPC</span><span className="pill-value">{fmtMoney(agg.cpc)}</span></span>
                      <span className="metric-pill"><span className="pill-label">CTR</span><span className="pill-value">{fmtPct(agg.ctr)}</span></span>
                      {!range.isZero && (
                        <>
                          <span className="metric-pill"><span className="pill-label">CVR</span><span className="pill-value">{fmtPct(agg.cvr)}</span></span>
                          <span className="metric-pill"><span className="pill-label">销额</span><span className="pill-value">{fmtMoney(agg.salesAmount)}</span></span>
                        </>
                      )}
                      <span className="metric-pill"><span className="pill-label">$CPO</span><span className="pill-value">{fmtMoney(agg.cpo)}</span></span>
                    </div>
                  </div>
                ),
                style: { background: 'rgba(237,227,216,0.35)', backdropFilter: 'blur(10px)', borderRadius: 10, border: 'none', marginBottom: 0 },
                children: (
                  <Table<CampaignAgg>
                    columns={camColumns}
                    dataSource={rangeCampaigns.sort((a, b) => b.spend - a.spend)}
                    rowKey="name" size="small" scroll={{ x: 1300 }}
                    pagination={{ pageSize: 15, showTotal: (t) => `共 ${t} 条` }}
                  />
                ),
              }]}
            />
          </div>
        );
      })}
    </div>
  );
};
