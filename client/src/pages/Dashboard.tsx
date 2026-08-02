import React, { useMemo, useCallback } from 'react';
import { Collapse } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { MetricCardRow } from '../components/cards/MetricCardRow';
import { AcosSummaryWarning } from '../components/tables/AcosSummaryWarning';
import { WarningTable } from '../components/tables/WarningTable';
import { AbnormalCamTable } from '../components/tables/AbnormalCamTable';
import { AbnormalCamPerformanceTable } from '../components/tables/AbnormalCamPerformanceTable';
import { LatestTrendTable } from '../components/tables/LatestTrendTable';
import { DetailTable } from '../components/tables/DetailTable';
import { FullDataTable } from '../components/tables/FullDataTable';
import { DataTrendChart } from '../components/charts/DataTrendChart';
import { BusinessGroupTrendTable, CategoryTrendTable } from '../components/tables/BusinessGroupTrendTable';
import { COL } from '../constants/col-mapping';
import { useDashboardStore } from '../store/dashboardStore';

interface DashboardProps {
  onMenuClick: (info: { key: string }) => void;
  selectedKey: string;
}

const Diamond = () => <span className="sub-panel-icon" />;
const SubLabel: React.FC<{ text: string }> = ({ text }) => (
  <span style={{ display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 700 }}>
    <Diamond />{text}
  </span>
);

const subStyle: React.CSSProperties = {
  marginBottom: 8,
  background: 'rgba(237,227,216,0.40)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: 10,
  boxShadow: 'var(--shadow-sm)',
  border: 'none',
};

const Dashboard: React.FC<DashboardProps> = ({ selectedKey }) => {
  const allFiles = useDashboardStore((s) => s.allFiles);
  const filteredData = useDashboardStore((s) => s.filteredData);
  const fileCount = Object.keys(allFiles).length;

  // 手风琴展开时自动滚动到对应二级标题
  const handleChange = useCallback((key: string | string[]) => {
    const activeKey = Array.isArray(key) ? key[0] : key;
    if (activeKey) {
      setTimeout(() => {
        document.getElementById(`sub-${activeKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, []);

  const content = useMemo(() => {
    const expandIcon = ({ isActive }: { isActive: boolean }) => <CaretRightOutlined rotate={isActive ? 90 : 0} style={{ fontSize: 10 }} />;
    const baseProps = { expandIcon, style: { background: 'transparent', border: 'none' } as React.CSSProperties, accordion: true, onChange: handleChange };

    switch (selectedKey) {
      case 'summary':
        return (
          <div className="ad-panel-body">
            <Collapse {...baseProps} defaultActiveKey={['metrics']} items={[
              { key: 'metrics', label: <div id="sub-metrics"><SubLabel text="指标概览" /></div>, style: subStyle, children: <MetricCardRow /> },
              { key: 'acos', label: <div id="sub-acos"><SubLabel text="汇总警示" /></div>, style: subStyle, children: <AcosSummaryWarning /> },
              ...(fileCount >= 2 ? [{ key: 'trend', label: <div id="sub-trend"><SubLabel text="最新趋势警示" /></div>, style: subStyle, children: <LatestTrendTable /> as React.ReactNode }] : []),
              ...(filteredData.length > 0 ? [
                { key: 'biz', label: <div id="sub-biz"><SubLabel text="业务组数据" /></div>, style: subStyle, children: <WarningTable colIdx={COL.业务组} dimensionLabel="业务组数据" /> },
                { key: 'owner', label: <div id="sub-owner"><SubLabel text="业务负责人数据" /></div>, style: subStyle, children: <WarningTable colIdx={COL.业务负责人} dimensionLabel="业务负责人数据" /> },
              ] : []),
            ]} />
          </div>
        );
      case 'store':
        return (
          <div className="ad-panel-body">
            <Collapse {...baseProps} defaultActiveKey={['store-detail']} items={[
              { key: 'store-detail', label: <div id="sub-store-detail"><SubLabel text="店铺明细" /></div>, style: subStyle, children: <DetailTable colIdx={COL.店铺} dimensionLabel="店铺明细" /> },
              { key: 'adtype-detail', label: <div id="sub-adtype-detail"><SubLabel text="广告类型明细" /></div>, style: subStyle, children: <DetailTable colIdx={COL.广告类型} dimensionLabel="广告类型明细" /> },
            ]} />
          </div>
        );
      case 'category':
        return (
          <div className="ad-panel-body">
            <Collapse {...baseProps} defaultActiveKey={['cat-detail']} items={[
              { key: 'cat-detail', label: <div id="sub-cat-detail"><SubLabel text="三级分类明细" /></div>, style: subStyle, children: <DetailTable colIdx={COL.三级分类} dimensionLabel="三级分类明细" /> },
              { key: 'cat-adtype', label: <div id="sub-cat-adtype"><SubLabel text="三级分类+广告类型明细" /></div>, style: subStyle, children: <DetailTable colIdx={COL.三级分类} dimensionLabel="三级分类+广告类型明细" colIdx2={COL.广告类型} /> },
            ]} />
          </div>
        );
      case 'trend':
        return (
          <div className="ad-panel-body">
            {fileCount >= 2 ? (
              <Collapse {...baseProps} defaultActiveKey={['trend-chart']} items={[
                { key: 'trend-chart', label: <div id="sub-trend-chart"><SubLabel text="数据趋势图" /></div>, style: subStyle, children: <DataTrendChart /> },
                { key: 'biz-trend', label: <div id="sub-biz-trend"><SubLabel text="业务组数据趋势表格" /></div>, style: subStyle, children: <BusinessGroupTrendTable /> },
                { key: 'cat-trend', label: <div id="sub-cat-trend"><SubLabel text="三级分类数据趋势表格" /></div>, style: subStyle, children: <CategoryTrendTable /> },
                { key: 'abnormal', label: <div id="sub-abnormal"><SubLabel text="异常CAM日进度表格" /></div>, style: subStyle, children: <AbnormalCamTable /> },
                { key: 'performance', label: <div id="sub-performance"><SubLabel text="异常CAM日表现表格" /></div>, style: subStyle, children: <AbnormalCamPerformanceTable /> },
              ]} />
            ) : <p style={{ color: 'var(--text-secondary)', fontSize: 13, padding: 20 }}>需要上传至少 2 个文件。</p>}
          </div>
        );
      case 'full':
        return (
          <div className="ad-panel-body">
            <Collapse {...baseProps} defaultActiveKey={['fulldata']} items={[
              { key: 'fulldata', label: <div id="sub-fulldata"><SubLabel text="全量数据" /></div>, style: subStyle, children: <FullDataTable /> },
            ]} />
          </div>
        );
      default:
        return null;
    }
  }, [selectedKey, fileCount, filteredData.length, handleChange]);

  return <div>{content}</div>;
};

export default Dashboard;
