import React, { useMemo, useState } from 'react';
import { Table, Button } from 'antd';
import type { ColumnsType, ColumnGroupType } from 'antd/es/table';
import { useDashboardStore } from '../../store/dashboardStore';
import { calcAggregates } from '../../utils/calc';
import { rowPassesFilters } from '../../utils/filter';
import { sortFileNamesByDate, parseFileDates } from '../../utils/file-name';
import { COL } from '../../constants/col-mapping';
import { safeDiv } from '../../utils/format';
import type { AdRow } from '../../types/data';

interface DateMetrics {
  cpc: number;
  cvr: number;
  acos: number;
}

interface BizTrendRow {
  key: string;
  dates: Record<string, DateMetrics>;
  avgCpc: number;
  avgCvr: number;
  avgAcos: number;
  totalSpend: number;
}

/** 环比箭头 */
function TrendArrow({ current, previous }: { current: number; previous: number | undefined }) {
  if (previous === undefined || previous === current) return null;
  if (current > previous) return <span style={{ color: '#cf1322', marginLeft: 1, fontSize: 10 }}>↑</span>;
  return <span style={{ color: '#389e0d', marginLeft: 1, fontSize: 10 }}>↓</span>;
}

// ── CPC 色阶 (紫色系 — 越低越好) ──
function cpcColor(cpc: number): string {
  if (cpc <= 0) return '#B0A090';
  if (cpc <= 0.5) return '#7BA068';
  if (cpc <= 1.0) return '#D4A857';
  if (cpc <= 2.0) return '#C8854A';
  return '#8E6CAB';
}

// ── CVR 色阶 (蓝青色系 — 越高越好) ──
function cvrColor(cvr: number): string {
  if (cvr <= 0) return '#B0A090';
  if (cvr > 15) return '#389e8c';
  if (cvr > 10) return '#4D9ABF';
  if (cvr > 5)  return '#7EB5E8';
  return '#A8C8E8';
}

// ── ACOS 色阶 (暖棕金系 — 越低越好) ──
function acosColor(acos: number): string {
  if (acos <= 0) return '#B0A090';
  if (acos <= 30) return '#7BA068';
  if (acos <= 50) return '#D4A857';
  if (acos <= 100) return '#C8854A';
  return '#C0805A';
}

function barWidth(val: number, maxVal: number): string {
  const pct = maxVal > 0 ? Math.min((val / maxVal) * 100, 100) : 0;
  return `${pct}%`;
}

function MetricCell({ value, maxValue, colorFn, prevValue, suffix }: {
  value: number | undefined;
  maxValue: number;
  colorFn: (v: number) => string;
  prevValue: number | undefined;
  suffix: string;
}) {
  if (value === undefined) return <span style={{ color: '#ccc', fontSize: 11 }}>—</span>;
  const barW = barWidth(value, maxValue);
  const barColor = colorFn(value);
  const displayVal = value <= 0 ? `0.00${suffix}` : `${value.toFixed(2)}${suffix}`;

  return (
    <div style={{ position: 'relative', padding: '1px 3px' }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: barW, backgroundColor: barColor, opacity: 0.18,
        borderRadius: 2, transition: 'width 0.3s',
      }} />
      <span style={{ position: 'relative', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
        {displayVal}
        <TrendArrow current={value} previous={prevValue} />
      </span>
    </div>
  );
}

// ── 通用趋势表格工厂 ──
interface TrendTableProps {
  dimensionCol: number;       // 分组列索引
  dimensionName: string;      // 表头名称
  heading: string;            // 模块标题
  subtitle: string;           // 副标题
}

function useTrendData(dimensionCol: number) {
  const { allFiles, filters } = useDashboardStore();
  return useMemo(() => {
    const sorted = sortFileNamesByDate(Object.keys(allFiles));
    if (sorted.length < 2) return { dates: [] as string[], tableData: [] as BizTrendRow[], maxCpc: 0, maxCvr: 0, maxAcos: 0 };

    const selected = filters['filter-file']?.length
      ? sorted.filter((f) => filters['filter-file']!.includes(f))
      : sorted;

    const dateLabels: string[] = [];
    const rowMap = new Map<string, BizTrendRow>();
    let gMaxCpc = 0, gMaxCvr = 0, gMaxAcos = 0;

    for (const fn of selected) {
      const rawData: AdRow[] = allFiles[fn]?.data;
      if (!rawData?.length) continue;
      const filtered = rawData.filter((r) => rowPassesFilters(r, filters));
      if (!filtered.length) continue;

      const parsed = parseFileDates(fn);
      const label = parsed ? parsed[1].slice(4) : fn;
      dateLabels.push(label);

      const groupMap = new Map<string, AdRow[]>();
      for (const r of filtered) {
        const key = r[dimensionCol] || '(空)';
        if (!groupMap.has(key)) groupMap.set(key, []);
        groupMap.get(key)!.push(r);
      }

      for (const [key, rows] of groupMap) {
        const agg = calcAggregates(rows);
        const cpcVal = +agg.cpc.toFixed(2);
        const cvrVal = +(safeDiv(agg.sales, agg.clicks) * 100).toFixed(2);
        const acosVal = +(agg.acos * 100).toFixed(2);

        if (cpcVal > gMaxCpc) gMaxCpc = cpcVal;
        if (cvrVal > gMaxCvr) gMaxCvr = cvrVal;
        if (acosVal > gMaxAcos) gMaxAcos = acosVal;

        if (!rowMap.has(key)) {
          rowMap.set(key, { key, dates: {}, avgCpc: 0, avgCvr: 0, avgAcos: 0, totalSpend: 0 });
        }
        const row = rowMap.get(key)!;
        row.dates[label] = { cpc: cpcVal, cvr: cvrVal, acos: acosVal };
        row.totalSpend += agg.spend;
      }
    }

    for (const row of rowMap.values()) {
      const entries = Object.values(row.dates);
      if (entries.length > 0) {
        row.avgCpc = +(entries.reduce((s, m) => s + m.cpc, 0) / entries.length).toFixed(2);
        row.avgCvr = +(entries.reduce((s, m) => s + m.cvr, 0) / entries.length).toFixed(2);
        row.avgAcos = +(entries.reduce((s, m) => s + m.acos, 0) / entries.length).toFixed(2);
      }
    }

    const data = [...rowMap.values()].sort((a, b) => b.totalSpend - a.totalSpend);
    return { dates: dateLabels, tableData: data, maxCpc: gMaxCpc, maxCvr: gMaxCvr, maxAcos: gMaxAcos };
  }, [allFiles, filters]);
}

/** 通用维度趋势表格 */
const DimensionTrendTable: React.FC<TrendTableProps> = ({ dimensionCol, dimensionName, heading, subtitle }) => {
  const [showAll, setShowAll] = useState(false);
  const { dates, tableData, maxCpc, maxCvr, maxAcos } = useTrendData(dimensionCol);

  if (dates.length < 2) return null;

  const TOP_N = 10;
  const display = showAll ? tableData : tableData.slice(0, TOP_N);

  const columns: ColumnsType<BizTrendRow> = [
    {
      title: dimensionName,
      dataIndex: 'key',
      key: 'key',
      width: 130,
      fixed: 'left',
      render: (v: string) => <span style={{ fontSize: 12, fontWeight: 600 }}>{v}</span>,
    },
    ...dates.map((d, dIdx): ColumnGroupType<BizTrendRow> => ({
      title: d,
      key: d,
      children: [
        {
          title: '$CPC',
          key: `${d}-cpc`,
          width: 88,
          align: 'right' as const,
          render: (_: any, r: BizTrendRow) => {
            const prev = dIdx > 0 ? r.dates[dates[dIdx - 1]]?.cpc : undefined;
            return <MetricCell value={r.dates[d]?.cpc} maxValue={maxCpc} colorFn={cpcColor} prevValue={prev} suffix="" />;
          },
        },
        {
          title: 'CVR%',
          key: `${d}-cvr`,
          width: 88,
          align: 'right' as const,
          render: (_: any, r: BizTrendRow) => {
            const prev = dIdx > 0 ? r.dates[dates[dIdx - 1]]?.cvr : undefined;
            return <MetricCell value={r.dates[d]?.cvr} maxValue={maxCvr} colorFn={cvrColor} prevValue={prev} suffix="%" />;
          },
        },
        {
          title: 'ACOS%',
          key: `${d}-acos`,
          width: 88,
          align: 'right' as const,
          render: (_: any, r: BizTrendRow) => {
            const prev = dIdx > 0 ? r.dates[dates[dIdx - 1]]?.acos : undefined;
            return <MetricCell value={r.dates[d]?.acos} maxValue={maxAcos} colorFn={acosColor} prevValue={prev} suffix="%" />;
          },
        },
      ],
    })),
    {
      title: 'CPC均值',
      dataIndex: 'avgCpc',
      key: 'avgCpc',
      width: 80,
      align: 'right' as const,
      render: (v: number) => (
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: cpcColor(v) }}>
          {v.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'CVR均值',
      dataIndex: 'avgCvr',
      key: 'avgCvr',
      width: 80,
      align: 'right' as const,
      render: (v: number) => (
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: cvrColor(v) }}>
          {v.toFixed(2)}%
        </span>
      ),
    },
    {
      title: 'ACOS均值',
      dataIndex: 'avgAcos',
      key: 'avgAcos',
      width: 80,
      align: 'right' as const,
      render: (v: number) => (
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: acosColor(v) }}>
          {v.toFixed(2)}%
        </span>
      ),
    },
  ];

  return (
    <div className="data-module">
      <div className="module-heading">{heading}</div>
      <div className="module-subtitle">{subtitle}</div>
      <Table<BizTrendRow>
        columns={columns}
        dataSource={display}
        rowKey="key"
        size="small"
        scroll={{ x: 130 + dates.length * 264 + 240 }}
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

// ── 业务组趋势表格 ──
export const BusinessGroupTrendTable: React.FC = () => (
  <DimensionTrendTable
    dimensionCol={COL.业务组}
    dimensionName="业务组"
    heading="业务组数据趋势表格"
    subtitle="各业务组 $CPC · CVR% · ACOS% 跨日期对比 — 花费降序 TOP10"
  />
);

// ── 三级分类趋势表格 ──
export const CategoryTrendTable: React.FC = () => (
  <DimensionTrendTable
    dimensionCol={COL.三级分类}
    dimensionName="三级分类"
    heading="三级分类数据趋势表格"
    subtitle="各三级分类 $CPC · CVR% · ACOS% 跨日期对比 — 花费降序 TOP10"
  />
);
