import React, { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useDashboardStore } from '../../store/dashboardStore';
import { calcAggregates } from '../../utils/calc';
import { rowPassesFilters } from '../../utils/filter';
import { sortFileNamesByDate, parseFileDates } from '../../utils/file-name';
import { echartsWarmBrownPalette } from '../../theme/tokens';
import type { AdRow } from '../../types/data';

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

/** 标签通用样式 — 白底 + 暖金文字，贴合页面背景 */
const LABEL_BG = {
  backgroundColor: 'rgba(255,255,255,0.88)',
  borderColor: '#D9C8B4',
  borderWidth: 1,
  borderRadius: 4,
  padding: [2, 6, 2, 6],
};

/** 数据趋势图 — 花费柱状图(立体) + ACOS% 折线图 */
export const DataTrendChart: React.FC = () => {
  const { allFiles, filters } = useDashboardStore();

  const option = useMemo(() => {
    const sorted = sortFileNamesByDate(Object.keys(allFiles));
    if (sorted.length < 2) return null;

    const selected = filters['filter-file']?.length
      ? sorted.filter((f) => filters['filter-file']!.includes(f))
      : sorted;

    const dates: string[] = [];
    const spendData: number[] = [];
    const acosData: number[] = [];

    for (const fn of selected) {
      const rawData: AdRow[] = allFiles[fn]?.data;
      const parsed = parseFileDates(fn);
      const label = parsed ? parsed[1] : fn;
      if (!rawData?.length) {
        dates.push(label);
        spendData.push(0);
        acosData.push(0);
        continue;
      }
      const filtered = rawData.filter((r) => rowPassesFilters(r, filters));
      const agg = calcAggregates(filtered);
      dates.push(label);
      spendData.push(+agg.spend.toFixed(2));
      acosData.push(+(agg.acos * 100).toFixed(2));
    }

    // 立体柱状体 — 渐变 + 圆角 + 阴影
    const barColor = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: echartsWarmBrownPalette[0] },   // 顶部亮
      { offset: 0.5, color: echartsWarmBrownPalette[1] }, // 中段
      { offset: 1, color: echartsWarmBrownPalette[7] },   // 底部深 → 立体感
    ]);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', crossStyle: { color: '#999' } },
        formatter: (params: any[]) => {
          const date = params[0]?.axisValue || '';
          const spend = params.find((p: any) => p.seriesName === '花费');
          const acos = params.find((p: any) => p.seriesName === 'ACOS%');
          return `<strong>${date}</strong><br/>
            ${spend?.marker || ''} 花费: <b>$${spend?.value?.toLocaleString?.() || spend?.value}</b><br/>
            ${acos?.marker || ''} ACOS%: <b>${acos?.value}%</b>`;
        },
      },
      legend: {
        bottom: 0,
        textStyle: { color: '#776251', fontSize: 11 },
      },
      grid: { top: 55, left: 80, right: 80, bottom: 50 },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { rotate: 25, fontSize: 12, color: '#4A3828', margin: 10, fontWeight: 500 },
        axisTick: { alignWithLabel: true },
      },
      yAxis: [
        {
          type: 'value',
          name: '花费 ($)',
          nameTextStyle: { color: echartsWarmBrownPalette[1], fontSize: 11, fontWeight: 500 },
          nameLocation: 'middle',
          nameGap: 55,
          axisLabel: {
            formatter: (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`,
            fontSize: 11,
            margin: 8,
          },
          splitLine: { lineStyle: { color: '#E8DDD0', type: 'dashed' } },
        },
        {
          type: 'value',
          name: 'ACOS%',
          nameTextStyle: { color: echartsWarmBrownPalette[5], fontSize: 11, fontWeight: 500 },
          nameLocation: 'middle',
          nameGap: 55,
          axisLabel: { formatter: '{value}%', fontSize: 11, margin: 8 },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: '花费',
          type: 'bar',
          data: spendData,
          yAxisIndex: 0,
          itemStyle: {
            color: barColor,
            borderRadius: [6, 6, 0, 0],
            shadowBlur: 6,
            shadowColor: 'rgba(107,74,42,0.25)',
            shadowOffsetY: 2,
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: echartsWarmBrownPalette[5] },
                { offset: 1, color: echartsWarmBrownPalette[2] },
              ]),
              shadowBlur: 12,
              shadowColor: 'rgba(107,74,42,0.40)',
            },
          },
          barWidth: '40%',
          label: {
            show: true,
            position: 'insideBottom',
            formatter: (p: any) => p.value >= 1000 ? `$${(p.value / 1000).toFixed(1)}k` : `$${p.value}`,
            fontSize: 11,
            color: '#D4A857',
            fontWeight: 600,
            ...LABEL_BG,
          },
        },
        {
          name: 'ACOS%',
          type: 'line',
          data: acosData,
          yAxisIndex: 1,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { color: echartsWarmBrownPalette[5], width: 2.5 },
          itemStyle: {
            color: echartsWarmBrownPalette[5],
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}%',
            fontSize: 11,
            color: '#D4A857',
            fontWeight: 600,
            distance: 14,
            ...LABEL_BG,
          },
          markLine: {
            silent: true,
            symbol: 'none',
            data: [
              {
                yAxis: 50,
                label: { formatter: '50%', fontSize: 10, color: '#C8854A' },
                lineStyle: { color: '#D4A857', type: 'dashed', width: 1 },
              },
            ],
          },
        },
      ],
      color: echartsWarmBrownPalette,
    };
  }, [allFiles, filters]);

  if (!option) return null;

  return (
    <div className="data-module fade-in-section">
      <div className="module-heading">数据趋势图</div>
      <div className="module-subtitle">花费 & ACOS% 跨日期趋势</div>
      <ReactEChartsCore echarts={echarts} option={option} style={{ height: 360 }} />
    </div>
  );
};
