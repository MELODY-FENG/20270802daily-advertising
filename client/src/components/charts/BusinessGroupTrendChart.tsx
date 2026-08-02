import React, { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useDashboardStore } from '../../store/dashboardStore';
import { calcAggregates } from '../../utils/calc';
import { rowPassesFilters } from '../../utils/filter';
import { sortFileNamesByDate, parseFileDates } from '../../utils/file-name';
import { COL } from '../../constants/col-mapping';
import { echartsWarmBrownPalette } from '../../theme/tokens';
import type { AdRow } from '../../types/data';

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

/** 业务组数据趋势图 — 多业务组 ACOS% 折线对比 */
export const BusinessGroupTrendChart: React.FC = () => {
  const { allFiles, filters } = useDashboardStore();

  const option = useMemo(() => {
    const sorted = sortFileNamesByDate(Object.keys(allFiles));
    if (sorted.length < 2) return null;

    const selected = filters['filter-file']?.length
      ? sorted.filter((f) => filters['filter-file']!.includes(f))
      : sorted;

    // 收集所有业务组和每日ACOS%
    const bizGroupSet = new Set<string>();
    const dateBizMap = new Map<string, Map<string, number>>();

    for (const fn of selected) {
      const rawData: AdRow[] = allFiles[fn]?.data;
      if (!rawData?.length) continue;
      const filtered = rawData.filter((r) => rowPassesFilters(r, filters));
      if (!filtered.length) continue;

      const bizMap = new Map<string, AdRow[]>();
      for (const r of filtered) {
        const biz = r[COL.业务组] || '(空)';
        if (!bizMap.has(biz)) bizMap.set(biz, []);
        bizMap.get(biz)!.push(r);
      }

      const parsed = parseFileDates(fn);
      const label = parsed ? parsed[1].slice(4) : fn; // 取 MMDD

      const acosMap = new Map<string, number>();
      for (const [biz, rows] of bizMap) {
        bizGroupSet.add(biz);
        const agg = calcAggregates(rows);
        acosMap.set(biz, +(agg.acos * 100).toFixed(2));
      }
      dateBizMap.set(label, acosMap);
    }

    const dates = [...dateBizMap.keys()];
    const bizGroups = [...bizGroupSet].sort();

    if (bizGroups.length === 0) return null;

    const series = bizGroups.map((biz, i) => ({
      name: biz,
      type: 'line' as const,
      data: dates.map((d) => dateBizMap.get(d)?.get(biz) ?? null),
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2 },
      itemStyle: { color: echartsWarmBrownPalette[i % echartsWarmBrownPalette.length] },
      label: {
        show: true,
        position: 'top' as const,
        formatter: (p: any) => p.value != null ? `${p.value}%` : '',
        fontSize: 9,
        color: echartsWarmBrownPalette[i % echartsWarmBrownPalette.length],
        fontWeight: 500,
      },
    }));

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
          let html = `<strong>${params[0]?.axisValue || ''}</strong>`;
          for (const p of params) {
            if (p.value != null) {
              html += `<br/>${p.marker} ${p.seriesName}: <b>${p.value}%</b>`;
            }
          }
          return html;
        },
      },
      legend: {
        type: 'scroll' as const,
        bottom: 0,
        textStyle: { color: '#776251', fontSize: 10 },
        pageTextStyle: { color: '#776251' },
      },
      grid: { top: 20, left: 65, right: 30, bottom: 40 },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { fontSize: 11, color: '#776251' },
        axisTick: { alignWithLabel: true },
      },
      yAxis: {
        type: 'value',
        name: 'ACOS%',
        nameTextStyle: { color: '#776251', fontSize: 11, fontWeight: 500 },
        axisLabel: { formatter: '{value}%', fontSize: 11 },
        splitLine: { lineStyle: { color: '#E8DDD0', type: 'dashed' } },
      },
      series,
      color: [...echartsWarmBrownPalette],
    };
  }, [allFiles, filters]);

  if (!option) return null;

  return (
    <div className="data-module fade-in-section">
      <div className="module-heading">业务组数据趋势图</div>
      <div className="module-subtitle">各业务组 ACOS% 跨日期对比（点击图例可切换显示）</div>
      <ReactEChartsCore echarts={echarts} option={option} style={{ height: 340 }} />
    </div>
  );
};
