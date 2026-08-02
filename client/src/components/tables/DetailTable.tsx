import React, { useMemo, useState } from 'react';
import { Table, type ColumnsType } from 'antd';
import { useDashboardStore } from '../../store/dashboardStore';
import { groupBy, groupByTwo } from '../../utils/calc';
import { fmtInt, fmtMoney, fmtPct, fmtRatio } from '../../utils/format';
import { computeTableStats } from '../../utils/table-stats';
import { ProgressBarCell } from '../shared/ProgressBarCell';
import { arrowIndicator } from '../../utils/table-stats';
import type { GroupAgg } from '../../types/data';

interface DetailTableProps {
  colIdx: number;
  dimensionLabel: string;
  colIdx2?: number;
}

export const DetailTable: React.FC<DetailTableProps> = ({ colIdx, dimensionLabel, colIdx2 }) => {
  const { filteredData } = useDashboardStore();
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const groups = useMemo(() => {
    if (!filteredData.length) return [];
    return colIdx2 !== undefined
      ? groupByTwo(filteredData, colIdx, colIdx2)
      : groupBy(filteredData, colIdx);
  }, [filteredData, colIdx, colIdx2]);

  const stats = useMemo(() => computeTableStats(groups as GroupAgg[]), [groups]);
  const paginatedData = useMemo(() => groups.slice((page - 1) * pageSize, page * pageSize), [groups, page]);
  const isTwoKey = colIdx2 !== undefined;

  const columns: ColumnsType<any> = [
    ...(isTwoKey
      ? [
          { title: '三级分类', dataIndex: 'key1', key: 'key1', width: 140 },
          { title: '广告类型', dataIndex: 'key2', key: 'key2', width: 160 },
        ]
      : [{ title: dimensionLabel, dataIndex: 'key', key: 'key', width: 160 }]),
    { title: 'CAM数', dataIndex: 'campaignCount', key: 'cnt', width: 80, render: (v: number) => fmtInt(v), sorter: (a: any, b: any) => a.campaignCount - b.campaignCount },
    { title: '花费', dataIndex: 'spend', key: 'spend', width: 140, render: (v: number) => <ProgressBarCell value={v} maxValue={stats.maxSpend} />, sorter: (a: any, b: any) => a.spend - b.spend, defaultSortOrder: 'descend' },
    { title: '点击量', dataIndex: 'clicks', key: 'clicks', width: 120, render: (v: number) => <ProgressBarCell value={v} maxValue={stats.maxClicks} format="int" />, sorter: (a: any, b: any) => a.clicks - b.clicks },
    { title: '$CPC', dataIndex: 'cpc', key: 'cpc', width: 100, render: (v: number) => <span dangerouslySetInnerHTML={{ __html: fmtMoney(v) + ' ' + arrowIndicator(v, stats.avgCpc, true) }} />, sorter: (a: any, b: any) => a.cpc - b.cpc },
    { title: 'CTR%', dataIndex: 'ctr', key: 'ctr', width: 100, render: (v: number) => <span dangerouslySetInnerHTML={{ __html: fmtPct(v) + ' ' + arrowIndicator(v, stats.avgCtr, false) }} />, sorter: (a: any, b: any) => a.ctr - b.ctr },
    { title: 'CVR%', dataIndex: 'cvr', key: 'cvr', width: 100, render: (v: number) => <span dangerouslySetInnerHTML={{ __html: fmtPct(v) + ' ' + arrowIndicator(v, stats.avgCvr, false) }} />, sorter: (a: any, b: any) => a.cvr - b.cvr },
    { title: '销额', dataIndex: 'salesAmount', key: 'sales', width: 140, render: (v: number) => <ProgressBarCell value={v} maxValue={stats.maxSalesAmount} />, sorter: (a: any, b: any) => a.salesAmount - b.salesAmount },
    { title: '$CPO', dataIndex: 'cpo', key: 'cpo', width: 100, render: (v: number) => <span dangerouslySetInnerHTML={{ __html: fmtMoney(v) + ' ' + arrowIndicator(v, stats.avgCpo, true) }} />, sorter: (a: any, b: any) => a.cpo - b.cpo },
    { title: 'ACOS%', dataIndex: 'acos', key: 'acos', width: 100, render: (v: number) => <span className={v > 1 ? 'cell-acos-critical' : v > 0.5 ? 'cell-acos-high' : 'cell-acos-low'} style={{ padding: '2px 6px', borderRadius: 4 }}>{fmtPct(v)}</span>, sorter: (a: any, b: any) => a.acos - b.acos },
    { title: 'ROAS', dataIndex: 'roas', key: 'roas', width: 80, render: (v: number) => fmtRatio(v), sorter: (a: any, b: any) => a.roas - b.roas },
    { title: '直购率%', dataIndex: 'directRate', key: 'dr', width: 90, render: (v: number) => fmtPct(v), sorter: (a: any, b: any) => a.directRate - b.directRate },
  ];

  if (!groups.length) {
    return (
      <div className="data-module fade-in-section">
        <div className="module-heading">{dimensionLabel}</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>暂无数据。</p>
      </div>
    );
  }

  return (
    <div className="data-module fade-in-section">
      <div className="module-heading">{dimensionLabel}</div>
      <Table
        columns={columns}
        dataSource={paginatedData}
        rowKey={isTwoKey ? (r: any) => `${r.key1}-${r.key2}` : 'key'}
        size="small"
        scroll={{ x: 1500 }}
        pagination={{ current: page, pageSize, total: groups.length, showSizeChanger: true, showTotal: (t) => `共 ${t} 条`, onChange: (p) => setPage(p) }}
      />
    </div>
  );
};
