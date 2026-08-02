import React, { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useDashboardStore } from '../../store/dashboardStore';
import { calcAggregates } from '../../utils/calc';
import { echartsWarmBrownPalette } from '../../theme/tokens';
import { sortFileNamesByDate } from '../../utils/file-name';

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, CanvasRenderer]);

export const TrendLineChart: React.FC = () => {
  const { allFiles } = useDashboardStore();
  const option = useMemo(() => {
    const fileNames = sortFileNamesByDate(Object.keys(allFiles));
    if (fileNames.length < 2) return null;
    const dates: string[] = [], acosData: number[] = [], roasData: number[] = [];
    for (const fn of fileNames) {
      const agg = calcAggregates(allFiles[fn].data);
      dates.push(fn); acosData.push(+(agg.acos * 100).toFixed(1)); roasData.push(+agg.roas.toFixed(2));
    }
    return {
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0, textStyle: { color: '#776251', fontSize: 11 } },
      grid: { top: 10, left: 55, right: 55, bottom: 35 },
      xAxis: { type: 'category', data: dates, axisLabel: { rotate: 30, fontSize: 10, color: '#776251' } },
      yAxis: [
        { type: 'value', name: 'ACOS%', nameTextStyle: { color: echartsWarmBrownPalette[0], fontSize: 10 }, axisLabel: { formatter: '{value}%', fontSize: 10 } },
        { type: 'value', name: 'ROAS', nameTextStyle: { color: echartsWarmBrownPalette[3], fontSize: 10 }, axisLabel: { fontSize: 10 } },
      ],
      series: [
        { name: 'ACOS%', type: 'line', data: acosData, yAxisIndex: 0, smooth: true, lineStyle: { color: echartsWarmBrownPalette[0], width: 2 }, itemStyle: { color: echartsWarmBrownPalette[0] }, markLine: { silent: true, symbol: 'none', data: [{ yAxis: 50, label: { formatter: '50%', fontSize: 10 }, lineStyle: { color: '#D4A857', type: 'dashed', width: 1 } }] } },
        { name: 'ROAS', type: 'line', data: roasData, yAxisIndex: 1, smooth: true, lineStyle: { color: echartsWarmBrownPalette[3], width: 2 }, itemStyle: { color: echartsWarmBrownPalette[3] } },
      ],
      color: echartsWarmBrownPalette,
    };
  }, [allFiles]);
  if (!option) return null;
  return (
    <div className="data-module fade-in-section">
      <ReactEChartsCore echarts={echarts} option={option} style={{ height: 280 }} />
    </div>
  );
};
