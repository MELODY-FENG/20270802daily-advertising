import React, { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useDashboardStore } from '../../store/dashboardStore';
import { groupBy } from '../../utils/calc';
import { COL } from '../../constants/col-mapping';
import { echartsWarmBrownPalette } from '../../theme/tokens';

echarts.use([BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

export const SpendBarChart: React.FC = () => {
  const { filteredData } = useDashboardStore();
  const option = useMemo(() => {
    if (!filteredData.length) return null;
    const grouped = groupBy(filteredData, COL.业务组).slice(0, 10);
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { top: 5, left: 120, right: 50, bottom: 25 },
      xAxis: { type: 'value', name: '花费 ($)', nameTextStyle: { fontSize: 10 }, axisLabel: { formatter: (v: number) => `$${(v/1000).toFixed(0)}k`, fontSize: 10 } },
      yAxis: { type: 'category', data: grouped.map((g) => g.key).reverse(), inverse: true, axisLabel: { fontSize: 10 } },
      series: [{
        name: '花费', type: 'bar',
        data: grouped.map((g, i) => ({ value: g.spend, itemStyle: { color: echartsWarmBrownPalette[i % echartsWarmBrownPalette.length] } })).reverse(),
        label: { show: true, position: 'right', formatter: (p: any) => `$${(p.value/1000).toFixed(1)}k`, fontSize: 10, color: '#776251' },
      }],
    };
  }, [filteredData]);
  if (!option) return null;
  return (
    <div className="data-module fade-in-section">
      <div className="module-heading">Top 10 业务组 — 花费对比</div>
      <ReactEChartsCore echarts={echarts} option={option} style={{ height: 280 }} />
    </div>
  );
};
