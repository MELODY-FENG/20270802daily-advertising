import React, { useMemo } from 'react';
import { Table, type ColumnsType } from 'antd';
import { useDashboardStore } from '../../store/dashboardStore';
import { groupByCampaign, groupBy } from '../../utils/calc';
import { safeDiv } from '../../utils/format';
import { fmtInt, fmtMoney, fmtPct, fmtRatio } from '../../utils/format';
import type { CampaignAgg, GroupAgg } from '../../types/data';

interface WarningTableProps {
  colIdx: number;
  dimensionLabel: string;
}

/**
 * 通用警示表格
 *
 * 数据范围: ACOS＞50% 的所有数据 + ACOS=0%且点击量≥50 的数据
 * 列: 维度名称, 广告活动去重计数, 花费, 曝光量, 点击量, 销量, $CPC, CTR%, $CPO, ACOS%, ROAS, 直购率
 */
export const WarningTable: React.FC<WarningTableProps> = ({ colIdx, dimensionLabel }) => {
  const { filteredData, campaignCache } = useDashboardStore();

  const campaigns = useMemo(() => {
    if (campaignCache?.length) return campaignCache;
    return filteredData.length ? groupByCampaign(filteredData) : [];
  }, [filteredData, campaignCache]);

  // 筛选: ACOS＞50% OR (ACOS=0%且点击量≥50)
  const warningCampaigns = useMemo(
    () => campaigns.filter((c) => c.acos > 0.50 || (c.acos <= 0 && c.clicks >= 50)),
    [campaigns],
  );

  const groups = useMemo(() => {
    if (!warningCampaigns.length) return [] as (GroupAgg & { spendRatio: number })[];
    const rows = warningCampaigns.flatMap((c) => c.rows);
    const raw = groupBy(rows, colIdx);
    const totalSpend = raw.reduce((s, g) => s + g.spend, 0);
    return raw.map((g) => ({ ...g, spendRatio: safeDiv(g.spend, totalSpend) }));
  }, [warningCampaigns, colIdx]);

  const columns: ColumnsType<GroupAgg & { spendRatio: number }> = [
    { title: dimensionLabel, dataIndex: 'key', key: 'key', width: 140, sorter: (a, b) => a.key.localeCompare(b.key) },
    { title: '广告活动去重计数', dataIndex: 'campaignCount', key: 'cnt', width: 130, render: (v: number) => fmtInt(v), sorter: (a, b) => a.campaignCount - b.campaignCount },
    { title: '花费', dataIndex: 'spend', key: 'spend', width: 120, render: (v: number) => fmtMoney(v), sorter: (a, b) => a.spend - b.spend, defaultSortOrder: 'descend' },
    { title: '曝光量', dataIndex: 'impressions', key: 'imp', width: 110, render: (v: number) => fmtInt(v), sorter: (a, b) => a.impressions - b.impressions },
    { title: '点击量', dataIndex: 'clicks', key: 'clicks', width: 100, render: (v: number) => fmtInt(v), sorter: (a, b) => a.clicks - b.clicks },
    { title: '销量', dataIndex: 'sales', key: 'sales', width: 90, render: (v: number) => fmtInt(v), sorter: (a, b) => a.sales - b.sales },
    { title: '$CPC', dataIndex: 'cpc', key: 'cpc', width: 90, render: (v: number) => fmtMoney(v), sorter: (a, b) => a.cpc - b.cpc },
    { title: 'CTR%', dataIndex: 'ctr', key: 'ctr', width: 90, render: (v: number) => fmtPct(v), sorter: (a, b) => a.ctr - b.ctr },
    { title: '$CPO', dataIndex: 'cpo', key: 'cpo', width: 90, render: (v: number) => fmtMoney(v), sorter: (a, b) => a.cpo - b.cpo },
    { title: 'ACOS%', dataIndex: 'acos', key: 'acos', width: 100, render: (v: number) => <span style={{ color: v > 1 ? 'var(--c-bad)' : v > 0.5 ? '#D4A857' : '#B0A090', fontWeight: 600 }}>{fmtPct(v)}</span>, sorter: (a, b) => a.acos - b.acos },
    { title: 'ROAS', dataIndex: 'roas', key: 'roas', width: 80, render: (v: number) => fmtRatio(v), sorter: (a, b) => a.roas - b.roas },
    { title: '直购率', dataIndex: 'directRate', key: 'dr', width: 90, render: (v: number) => fmtPct(v), sorter: (a, b) => a.directRate - b.directRate },
  ];

  if (!groups.length) {
    return (
      <div className="data-module fade-in-section">
        <div className="module-heading">{dimensionLabel}警示</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>暂无符合条件的数据。</p>
      </div>
    );
  }

  return (
    <div className="data-module fade-in-section">
      <div className="module-heading">{dimensionLabel}警示</div>
      <div className="module-subtitle">ACOS＞50%, ACOS=0%且点击量≥50</div>
      <Table<GroupAgg & { spendRatio: number }>
        columns={columns}
        dataSource={groups}
        rowKey="key"
        size="small"
        scroll={{ x: 1300 }}
        pagination={{ pageSize: 20, showTotal: (t) => `共 ${t} 条` }}
      />
    </div>
  );
};
