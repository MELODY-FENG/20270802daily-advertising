import React, { useMemo } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useDashboardStore } from '../../store/dashboardStore';
import { groupByCampaign } from '../../utils/calc';
import { rowPassesFilters } from '../../utils/filter';
import { fmtInt, fmtMoney, fmtPct, fmtRatio } from '../../utils/format';
import { sortFileNamesByDate } from '../../utils/file-name';
import type { CampaignAgg } from '../../types/data';

interface TrendCampaign extends CampaignAgg {
  isNew: boolean;
}

/**
 * 最新趋势警示
 *
 * 默认只展示最新日期范围的数据
 * 副标题: 最新文件名，环比前一天
 * 数据范围: ACOS=0%且点击≥50，ACOS＞100%
 * 列: 广告活动, 点击量, $CPC, CTR%, CVR%, 销额, $CPO, ACOS%, ROAS, 直购率, 是否新增
 * 是否新增: ✓ (新增) / ✗ (持续)
 */
export const LatestTrendTable: React.FC = () => {
  const { allFiles, filters } = useDashboardStore();

  const { latestFile, previousFile, trendData, summary } = useMemo(() => {
    const sorted = sortFileNamesByDate(Object.keys(allFiles));
    if (sorted.length < 2) return { latestFile: '', previousFile: '', trendData: [], summary: null };

    const latest = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];

    // 应用全局筛选
    const latestData = (allFiles[latest]?.data || []).filter((r) => rowPassesFilters(r, filters));
    const previousData = (allFiles[previous]?.data || []).filter((r) => rowPassesFilters(r, filters));
    const latestCampaigns = groupByCampaign(latestData);
    const previousCampaigns = groupByCampaign(previousData);

    const previousAbnormalNames = new Set(
      previousCampaigns.filter((c) => (c.acos <= 0 && c.clicks >= 50) || c.acos > 1.00).map((c) => c.name),
    );

    const latestAbnormal = latestCampaigns.filter(
      (c) => (c.acos <= 0 && c.clicks >= 50) || c.acos > 1.00,
    );

    // 应用"是否新增"筛选
    let filtered = latestAbnormal;
    if (filters['filter-isnew']?.length === 1) {
      const val = filters['filter-isnew'][0];
      filtered = latestAbnormal.filter((c) => {
        const isNew = !previousAbnormalNames.has(c.name);
        return val === '✓ 新增' ? isNew : !isNew;
      });
    }

    const data: TrendCampaign[] = filtered.map((c) => ({
      ...c,
      isNew: !previousAbnormalNames.has(c.name),
    }));

    const newCount = data.filter((c) => c.isNew).length;
    const persistCount = data.filter((c) => !c.isNew).length;

    return {
      latestFile: latest,
      previousFile: previous,
      trendData: data.sort((a, b) => b.spend - a.spend),
      summary: { total: data.length, newCount, persistCount },
    };
  }, [allFiles, filters]);

  if (!latestFile || !trendData.length) return null;

  const columns: ColumnsType<TrendCampaign> = [
    { title: '广告活动', dataIndex: 'name', key: 'name', width: 200 },
    {
      title: '是否新增', dataIndex: 'isNew', key: 'isNew', width: 90,
      render: (v: boolean) => <span style={{ fontSize: 16, color: v ? 'var(--c-good)' : 'var(--c-bad)' }}>{v ? '✓' : '✗'}</span>,
    },
    { title: '点击量', dataIndex: 'clicks', key: 'clicks', width: 90, render: (v: number) => fmtInt(v) },
    { title: '$CPC', dataIndex: 'cpc', key: 'cpc', width: 80, render: (v: number) => fmtMoney(v) },
    { title: 'CTR%', dataIndex: 'ctr', key: 'ctr', width: 75, render: (v: number) => fmtPct(v) },
    { title: 'CVR%', dataIndex: 'cvr', key: 'cvr', width: 75, render: (v: number) => fmtPct(v) },
    { title: '销额', dataIndex: 'salesAmount', key: 'sales', width: 100, render: (v: number) => fmtMoney(v) },
    { title: '$CPO', dataIndex: 'cpo', key: 'cpo', width: 80, render: (v: number) => fmtMoney(v) },
    { title: 'ACOS%', dataIndex: 'acos', key: 'acos', width: 90,
      render: (v: number) => <span className={v > 1 ? 'cell-acos-critical' : 'cell-acos-high'} style={{ padding: '2px 6px', borderRadius: 4 }}>{fmtPct(v)}</span>,
    },
    { title: 'ROAS', dataIndex: 'roas', key: 'roas', width: 70, render: (v: number) => fmtRatio(v) },
    { title: '直购率', dataIndex: 'directRate', key: 'dr', width: 80, render: (v: number) => fmtPct(v) },
    { title: '花费', dataIndex: 'spend', key: 'spend', width: 100, render: (v: number) => fmtMoney(v), sorter: (a, b) => a.spend - b.spend, defaultSortOrder: 'descend' },
  ];

  return (
    <div className="data-module" style={{ marginTop: 16 }}>
      <div className="module-heading">最新趋势警示</div>
      <div className="module-subtitle">
        {latestFile}，环比前一天（{previousFile}）
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 11, background: 'rgba(217,200,180,0.3)', padding: '2px 10px', borderRadius: 10 }}>
          异常CAM: {summary?.total || 0}
        </span>
        <span style={{ fontSize: 11, background: 'rgba(123,160,104,0.15)', padding: '2px 10px', borderRadius: 10, color: 'var(--c-good)' }}>
          ✓ 新增: {summary?.newCount || 0}
        </span>
        <span style={{ fontSize: 11, background: 'rgba(192,128,90,0.12)', padding: '2px 10px', borderRadius: 10, color: 'var(--c-bad)' }}>
          ✗ 持续: {summary?.persistCount || 0}
        </span>
      </div>
      <Table<TrendCampaign> columns={columns} dataSource={trendData} rowKey="name" size="small"
        scroll={{ x: 1300 }} pagination={{ pageSize: 30, showTotal: (t) => `共 ${t} 条` }} />
    </div>
  );
};
