import React, { useMemo, useState } from 'react';
import { Table, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useDashboardStore } from '../../store/dashboardStore';
import { groupByCampaign } from '../../utils/calc';
import { rowPassesFilters } from '../../utils/filter';
import { sortFileNamesByDate } from '../../utils/file-name';

interface AbnormalCamRow {
  owner: string;
  total: number;
  files: Record<string, { count: number; newCount: number; persistCount: number }>;
}

/**
 * 异常CAM日进度表格
 * 标题: 异常CAM日进度表格
 * 副标题: ACOS=0% & 点击量≥50，ACOS＞100%
 * 展示格式: 业务负责人 × 日期 → 异常N/新增N/持续N
 */
export const AbnormalCamTable: React.FC = () => {
  const { allFiles, filters } = useDashboardStore();
  const [showAll, setShowAll] = useState(false);

  const { fileNames, tableData, maxTotal } = useMemo(() => {
    const sorted = sortFileNamesByDate(Object.keys(allFiles));
    if (sorted.length < 2) return { fileNames: [], tableData: [], maxTotal: 0 };

    const selected = filters['filter-file']?.length
      ? sorted.filter((f) => filters['filter-file']!.includes(f)) : sorted;
    const ownerMap = new Map<string, AbnormalCamRow>();

    for (const fn of selected) {
      const rawData = allFiles[fn]?.data; if (!rawData?.length) continue;
      // 应用全局筛选（业务组、店铺等）后再计算异常CAM
      const d = rawData.filter((r) => rowPassesFilters(r, filters));
      if (!d.length) continue;
      const campaigns = groupByCampaign(d);
      const abnormals = campaigns.filter((c) => (c.acos <= 0 && c.clicks >= 50) || c.acos > 1.00);

      for (const c of abnormals) {
        const owner = c.业务负责人 || '(空)';
        if (!ownerMap.has(owner)) ownerMap.set(owner, { owner, total: 0, files: {} });
        const row = ownerMap.get(owner)!;
        if (!row.files[fn]) row.files[fn] = { count: 0, newCount: 0, persistCount: 0 };
        row.files[fn].count++;
      }

      // 与前一天对比计算新增/持续
      const prevIdx = sorted.indexOf(fn) - 1;
      if (prevIdx >= 0) {
        const prevData = allFiles[sorted[prevIdx]]?.data;
        if (prevData?.length) {
          const prevAbnormalNames = new Set(
            groupByCampaign(prevData).filter((c) => (c.acos <= 0 && c.clicks >= 50) || c.acos > 1.00).map((c) => c.name),
          );
          for (const c of abnormals) {
            const row = ownerMap.get(c.业务负责人 || '(空)');
            if (row?.files[fn]) {
              prevAbnormalNames.has(c.name) ? row.files[fn].persistCount++ : row.files[fn].newCount++;
            }
          }
        }
      }
    }

    for (const row of ownerMap.values()) row.total = Object.values(row.files).reduce((s, f) => s + f.count, 0);
    const data = [...ownerMap.values()].sort((a, b) => b.total - a.total);
    return { fileNames: selected, tableData: data, maxTotal: data[0]?.total || 0 };
  }, [allFiles, filters]);

  if (fileNames.length < 2) return null;

  const display = showAll ? tableData : tableData.slice(0, 10);
  const summary: AbnormalCamRow = { owner: '合计', total: tableData.reduce((s, r) => s + r.total, 0), files: {} };
  for (const f of fileNames) {
    summary.files[f] = {
      count: tableData.reduce((s, r) => s + (r.files[f]?.count || 0), 0),
      newCount: tableData.reduce((s, r) => s + (r.files[f]?.newCount || 0), 0),
      persistCount: tableData.reduce((s, r) => s + (r.files[f]?.persistCount || 0), 0),
    };
  }

  const columns: ColumnsType<AbnormalCamRow> = [
    { title: '业务负责人', dataIndex: 'owner', key: 'owner', width: 130, fixed: 'left', render: (v, r) => <strong style={r.owner === '合计' ? { color: 'var(--c-accent)' } : {}}>{v}</strong> },
    ...fileNames.map((f) => ({
      title: f, key: f, width: 160,
      render: (_: any, r: AbnormalCamRow) => {
        const d = r.files[f];
        return d ? <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>异常{d.count}/新增{d.newCount}/持续{d.persistCount}</span> : <span style={{ color: '#ccc' }}>—</span>;
      },
    })),
    { title: '总计', dataIndex: 'total', key: 'total', width: 80, render: (v: number) => <strong>{v}</strong> },
  ];

  const getBg = (r: AbnormalCamRow) => {
    if (r.owner === '合计') return 'rgba(166,124,82,0.12)';
    if (!maxTotal) return 'transparent';
    const ratio = r.total / maxTotal;
    if (ratio > 0.8) return 'rgba(139,98,57,0.18)'; else if (ratio > 0.6) return 'rgba(166,124,82,0.14)';
    else if (ratio > 0.4) return 'rgba(196,168,126,0.12)'; else if (ratio > 0.2) return 'rgba(217,200,180,0.10)';
    return 'transparent';
  };

  return (
    <div className="data-module">
      <div className="module-heading">异常CAM日进度表格</div>
      <div className="module-subtitle">ACOS=0% & 点击量≥50，ACOS＞100%</div>
      <Table<AbnormalCamRow> columns={columns} dataSource={[...display, summary]} rowKey="owner" size="small"
        scroll={{ x: 200 + fileNames.length * 160 }} pagination={false}
        onRow={(r) => ({ style: { background: getBg(r), fontWeight: r.owner === '合计' ? 700 : 400 } })} />
      {tableData.length > 10 && (
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <Button size="small" onClick={() => setShowAll(!showAll)}>{showAll ? '收起' : `展开全部 (${tableData.length}人)`}</Button>
        </div>
      )}
    </div>
  );
};
