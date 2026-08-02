import React, { useMemo, useState } from 'react';
import { Table, Button } from 'antd';
import type { ColumnsType, ColumnGroupType } from 'antd/es/table';
import { useDashboardStore } from '../../store/dashboardStore';
import { groupByCampaign } from '../../utils/calc';
import { rowPassesFilters } from '../../utils/filter';
import { sortFileNamesByDate } from '../../utils/file-name';
import { COL } from '../../constants/col-mapping';

interface CamDateMetrics {
  spend: number;
  clicks: number;
  acos: number;
}

interface PerformanceRow {
  campaign: string;
  totalSpend: number;
  dates: Record<string, CamDateMetrics>;
}

/** 环比箭头 */
function TrendArrow({ current, previous }: { current: number; previous: number | undefined }) {
  if (previous === undefined || previous === current) return null;
  if (current > previous) return <span style={{ color: '#cf1322', marginLeft: 2, fontSize: 11 }}>↑</span>;
  return <span style={{ color: '#389e0d', marginLeft: 2, fontSize: 11 }}>↓</span>;
}

/**
 * 异常CAM日表现表格
 * 展示异常CAM在各日期的 花费、点击量、ACOS%
 * 默认折叠，花费降序TOP50，可展开更多
 */
export const AbnormalCamPerformanceTable: React.FC = () => {
  const { allFiles, filters } = useDashboardStore();
  const [showAll, setShowAll] = useState(false);

  const { fileNames, tableData } = useMemo(() => {
    const sorted = sortFileNamesByDate(Object.keys(allFiles));
    if (sorted.length < 2) return { fileNames: [], tableData: [] };

    const selected = filters['filter-file']?.length
      ? sorted.filter((f) => filters['filter-file']!.includes(f))
      : sorted;

    // 收集所有异常CAM及其每日指标
    const camMap = new Map<string, PerformanceRow>();

    for (const fn of selected) {
      const rawData = allFiles[fn]?.data;
      if (!rawData?.length) continue;
      const d = rawData.filter((r) => rowPassesFilters(r, filters));
      if (!d.length) continue;

      const campaigns = groupByCampaign(d);
      const abnormals = campaigns.filter((c) => (c.acos <= 0 && c.clicks >= 50) || c.acos > 1.0);

      for (const c of abnormals) {
        const name = c.name;
        if (!camMap.has(name)) {
          camMap.set(name, { campaign: name, totalSpend: 0, dates: {} });
        }
        const row = camMap.get(name)!;
        row.dates[fn] = {
          spend: c.spend,
          clicks: c.clicks,
          acos: c.acos,
        };
        row.totalSpend += c.spend;
      }
    }

    const data = [...camMap.values()].sort((a, b) => b.totalSpend - a.totalSpend);
    return { fileNames: selected, tableData: data };
  }, [allFiles, filters]);

  if (fileNames.length < 2) return null;

  const TOP_N = 50;
  const display = showAll ? tableData : tableData.slice(0, TOP_N);

  // 构造列: 广告活动 | 日期1(花费/点击量/ACOS%) | 日期2(花费/点击量/ACOS%) ...
  const columns: ColumnsType<PerformanceRow> = [
    {
      title: '广告活动',
      dataIndex: 'campaign',
      key: 'campaign',
      width: 240,
      fixed: 'left',
      ellipsis: true,
      render: (v: string) => (
        <span style={{ fontSize: 12, fontWeight: 600 }} title={v}>{v}</span>
      ),
    },
    ...fileNames.map((fn, fnIdx): ColumnGroupType<PerformanceRow> => ({
      title: fn,
      key: fn,
      children: [
        {
          title: '花费',
          key: `${fn}-spend`,
          width: 100,
          align: 'right' as const,
          render: (_: any, r: PerformanceRow) => {
            const cur = r.dates[fn];
            const prevFn = fnIdx > 0 ? fileNames[fnIdx - 1] : undefined;
            const prev = prevFn ? r.dates[prevFn] : undefined;
            if (!cur) return <span style={{ color: '#ccc' }}>—</span>;
            return (
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                ${cur.spend.toFixed(2)}
                <TrendArrow current={cur.spend} previous={prev?.spend} />
              </span>
            );
          },
        },
        {
          title: '点击量',
          key: `${fn}-clicks`,
          width: 80,
          align: 'right' as const,
          render: (_: any, r: PerformanceRow) => {
            const cur = r.dates[fn];
            const prevFn = fnIdx > 0 ? fileNames[fnIdx - 1] : undefined;
            const prev = prevFn ? r.dates[prevFn] : undefined;
            if (!cur) return <span style={{ color: '#ccc' }}>—</span>;
            return (
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                {cur.clicks.toLocaleString()}
                <TrendArrow current={cur.clicks} previous={prev?.clicks} />
              </span>
            );
          },
        },
        {
          title: 'ACOS%',
          key: `${fn}-acos`,
          width: 90,
          align: 'right' as const,
          render: (_: any, r: PerformanceRow) => {
            const cur = r.dates[fn];
            const prevFn = fnIdx > 0 ? fileNames[fnIdx - 1] : undefined;
            const prev = prevFn ? r.dates[prevFn] : undefined;
            if (!cur) return <span style={{ color: '#ccc' }}>—</span>;
            const acosDisplay = cur.acos <= 0 ? '0.00%' : (cur.acos * 100).toFixed(2) + '%';
            return (
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                {acosDisplay}
                <TrendArrow current={cur.acos} previous={prev?.acos} />
              </span>
            );
          },
        },
      ],
    })),
  ];

  return (
    <div className="data-module">
      <div className="module-heading">异常CAM日表现表格</div>
      <div className="module-subtitle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>ACOS=0% & 点击量≥50，ACOS＞100% — 花费降序 TOP{TOP_N}</span>
        <span style={{ color: '#7BA068', fontWeight: 700, fontSize: 12 }}>
          总计 {tableData.length} 条
        </span>
      </div>
      <Table<PerformanceRow>
        columns={columns}
        dataSource={display}
        rowKey="campaign"
        size="small"
        scroll={{ x: 240 + fileNames.length * 270 }}
        pagination={false}
        bordered
      />
      {tableData.length > TOP_N && (
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <Button size="small" onClick={() => setShowAll(!showAll)}>
            {showAll ? '收起' : `展示更多 (共${tableData.length}条)`}
          </Button>
        </div>
      )}
    </div>
  );
};
