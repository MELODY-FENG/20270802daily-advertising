import React, { useMemo, useState } from 'react';
import { Table, type ColumnsType } from 'antd';
import { useDashboardStore } from '../../store/dashboardStore';
import { groupByCampaign } from '../../utils/calc';
import { fmtInt, fmtMoney, fmtPct, fmtRatio } from '../../utils/format';
import { computeTableStats } from '../../utils/table-stats';
import { ProgressBarCell } from '../shared/ProgressBarCell';
import type { CampaignAgg } from '../../types/data';

export const FullDataTable: React.FC = () => {
  const { filteredData } = useDashboardStore();
  const [page, setPage] = useState(1);
  const pageSize = 100;

  const campaigns = useMemo(() => filteredData.length ? groupByCampaign(filteredData) : [], [filteredData]);
  const stats = useMemo(() => computeTableStats(campaigns), [campaigns]);
  const paginated = useMemo(() => campaigns.slice((page - 1) * pageSize, page * pageSize), [campaigns, page]);

  const columns: ColumnsType<CampaignAgg> = [
    { title: '广告活动', dataIndex: 'name', key: 'name', width: 200, fixed: 'left', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: '店铺', dataIndex: '店铺', key: 'store', width: 120, sorter: (a, b) => a.店铺.localeCompare(b.店铺) },
    { title: '业务组', dataIndex: '业务组', key: 'biz', width: 100, sorter: (a, b) => a.业务组.localeCompare(b.业务组) },
    { title: '业务负责人', dataIndex: '业务负责人', key: 'owner', width: 100, sorter: (a, b) => a.业务负责人.localeCompare(b.业务负责人) },
    { title: '三级分类', dataIndex: '三级分类', key: 'cat', width: 120, sorter: (a, b) => a.三级分类.localeCompare(b.三级分类) },
    { title: '广告类型', dataIndex: '广告类型', key: 'adtype', width: 100, sorter: (a, b) => a.广告类型.localeCompare(b.广告类型) },
    { title: '花费', dataIndex: 'spend', key: 'spend', width: 140, render: (v: number) => <ProgressBarCell value={v} maxValue={stats.maxSpend} />, sorter: (a, b) => a.spend - b.spend, defaultSortOrder: 'descend' },
    { title: '点击量', dataIndex: 'clicks', key: 'clicks', width: 120, render: (v: number) => <ProgressBarCell value={v} maxValue={stats.maxClicks} format="int" />, sorter: (a, b) => a.clicks - b.clicks },
    { title: '$CPC', dataIndex: 'cpc', key: 'cpc', width: 100, render: (v: number) => fmtMoney(v), sorter: (a, b) => a.cpc - b.cpc },
    { title: 'CTR%', dataIndex: 'ctr', key: 'ctr', width: 90, render: (v: number) => fmtPct(v), sorter: (a, b) => a.ctr - b.ctr },
    { title: 'CVR%', dataIndex: 'cvr', key: 'cvr', width: 90, render: (v: number) => fmtPct(v), sorter: (a, b) => a.cvr - b.cvr },
    { title: '销额', dataIndex: 'salesAmount', key: 'sales', width: 140, render: (v: number) => <ProgressBarCell value={v} maxValue={stats.maxSalesAmount} />, sorter: (a, b) => a.salesAmount - b.salesAmount },
    { title: '$CPO', dataIndex: 'cpo', key: 'cpo', width: 100, render: (v: number) => fmtMoney(v), sorter: (a, b) => a.cpo - b.cpo },
    { title: 'ACOS%', dataIndex: 'acos', key: 'acos', width: 100, render: (v: number) => <span className={v > 1 ? 'cell-acos-critical' : v > 0.5 ? 'cell-acos-high' : 'cell-acos-low'} style={{ padding: '2px 6px', borderRadius: 4 }}>{fmtPct(v)}</span>, sorter: (a, b) => a.acos - b.acos },
    { title: 'ROAS', dataIndex: 'roas', key: 'roas', width: 80, render: (v: number) => fmtRatio(v), sorter: (a, b) => a.roas - b.roas },
    { title: '直购率%', dataIndex: 'directRate', key: 'dr', width: 90, render: (v: number) => fmtPct(v), sorter: (a, b) => a.directRate - b.directRate },
  ];

  if (!campaigns.length) {
    return (
      <div className="data-module fade-in-section">
        <div className="module-heading">全量数据</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>暂无数据。</p>
      </div>
    );
  }

  return (
    <div className="data-module fade-in-section">
      <div className="module-heading">全量数据</div>
      <Table<CampaignAgg>
        columns={columns}
        dataSource={paginated}
        rowKey="name"
        size="small"
        scroll={{ x: 1800, y: 500 }}
        pagination={{ current: page, pageSize, total: campaigns.length, showSizeChanger: true, showTotal: (t) => `共 ${t} 条`, onChange: (p) => setPage(p) }}
      />
    </div>
  );
};
