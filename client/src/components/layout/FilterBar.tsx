import React, { useState, useMemo, useRef } from 'react';
import { Input, Button, Tag, message } from 'antd';
import { CheckOutlined, ClearOutlined, SearchOutlined } from '@ant-design/icons';
import { useDashboardStore } from '../../store/dashboardStore';
import { FILTER_DEFS } from '../../constants/filter-defs';
import { getUniqueValues } from '../../utils/calc';
import type { FilterState } from '../../types/filters';

/**
 * 零弹窗筛选 — 内嵌面板 + 搜索框
 * 面板始终在 DOM，固定高度，无任何弹窗
 */
export const FilterBar: React.FC = React.memo(() => {
  const currentData = useDashboardStore((s) => s.currentData);
  const allFiles = useDashboardStore((s) => s.allFiles);
  const appliedFilters = useDashboardStore((s) => s.filters);

  const [local, setLocal] = useState<FilterState>(appliedFilters);
  const [activeKey, setActiveKey] = useState<string>('filter-bizgroup');
  const [searchText, setSearchText] = useState('');

  // 与 store 同步
  const syncRef = useRef(appliedFilters);
  if (syncRef.current !== appliedFilters) { syncRef.current = appliedFilters; setLocal(appliedFilters); }

  const toggleVal = (key: string, val: string) => {
    setLocal((prev) => {
      const cur = prev[key] || [];
      const next = cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val];
      if (!next.length) { const n = { ...prev }; delete n[key]; return n; }
      return { ...prev, [key]: next };
    });
  };

  const confirm = () => {
    useDashboardStore.getState().batchSetFilters(local);
    useDashboardStore.getState().refreshData();
    message.success('已应用');
  };
  const clear = () => {
    setLocal({});
    useDashboardStore.getState().batchSetFilters({});
    useDashboardStore.getState().refreshData();
    message.success('已清除');
  };

  // 缓存选项
  const dataRef = useRef(currentData);
  const cacheRef = useRef<Record<string, string[]>>({});
  const opts = useMemo(() => {
    if (dataRef.current === currentData && Object.keys(cacheRef.current).length) return cacheRef.current;
    dataRef.current = currentData;
    const r: Record<string, string[]> = {};
    if (!currentData.length) { cacheRef.current = r; return r; }
    for (const def of FILTER_DEFS) {
      if (def.id === 'filter-isnew') r[def.id] = ['✓ 新增', '✗ 持续'];
      else if (def.id === 'filter-file') r[def.id] = Object.keys(allFiles);
      else if (def.colIndex !== undefined) r[def.id] = getUniqueValues(currentData, def.colIndex);
    }
    cacheRef.current = r;
    return r;
  }, [currentData, allFiles]);

  const activeOpts = opts[activeKey] || [];
  const activeSelected = local[activeKey] || [];
  // 搜索过滤
  const filteredOpts = searchText
    ? activeOpts.filter((v) => v.toLowerCase().includes(searchText.toLowerCase()))
    : activeOpts;
  const textDef = FILTER_DEFS.find((d) => d.type === 'text');
  const btnDefs = FILTER_DEFS.filter((d) => d.type !== 'text');

  return (
    <div>
      {/* 标签按钮行 */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {btnDefs.map((d) => {
          const cnt = (local[d.id] || []).length;
          return (
            <Button key={d.id} size="small"
              type={activeKey === d.id ? 'primary' : 'default'}
              onClick={() => { setActiveKey(d.id); setSearchText(''); }}
              style={{ fontSize: 11, fontWeight: activeKey === d.id ? 700 : 500, padding: '1px 10px', borderRadius: 6 }}>
              {d.label}{cnt > 0 ? ` ${cnt}` : ''}
            </Button>
          );
        })}
        {textDef && (
          <Input size="small" prefix={<SearchOutlined style={{ fontSize: 11, color: 'var(--text-secondary)' }} />}
            allowClear placeholder={textDef.label} style={{ width: 160, marginLeft: 'auto' }}
            value={local[textDef.id]?.[0] || ''}
            onChange={(e) => setLocal((p) => {
              const v = e.target.value;
              if (!v) { const n = { ...p }; delete n[textDef.id]; return n; }
              return { ...p, [textDef.id]: [v] };
            })} />
        )}
        <Button type="primary" icon={<CheckOutlined />} size="small" onClick={confirm}>确认</Button>
        <Button icon={<ClearOutlined />} size="small" onClick={clear}
          style={{ color: 'var(--c-bad)', borderColor: 'rgba(192,128,90,0.2)' }}>清除</Button>
      </div>

      {/* 固定内嵌面板 + 搜索 */}
      <div style={{
        minHeight: 52, maxHeight: 140,
        overflowY: 'auto',
        marginTop: 4, padding: '6px 8px',
        background: 'rgba(237,227,216,0.35)',
        borderRadius: 8,
        border: '1px solid rgba(166,124,82,0.06)',
      }}>
        {/* 面板内搜索 */}
        <Input size="small" prefix={<SearchOutlined style={{ fontSize: 10 }} />}
          allowClear placeholder={`搜索${btnDefs.find((d) => d.id === activeKey)?.label || ''}选项...`}
          style={{ width: '100%', marginBottom: 4, fontSize: 11 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* 全选/清除 */}
          <Tag color={activeSelected.length === 0 ? 'default' : 'orange'}
            style={{ cursor: 'pointer', fontSize: 10, margin: 0 }}
            onClick={() => setLocal((prev) => {
              if ((prev[activeKey] || []).length) { const n = { ...prev }; delete n[activeKey]; return n; }
              return { ...prev, [activeKey]: [...activeOpts] };
            })}>
            {activeSelected.length ? '✕ 清除' : '全选'}
          </Tag>
          {filteredOpts.map((v) => {
            const on = activeSelected.includes(v);
            return (
              <Tag key={v} color={on ? 'orange' : 'default'}
                style={{ cursor: 'pointer', fontSize: 10, margin: 0, opacity: on ? 1 : 0.65 }}
                onClick={() => toggleVal(activeKey, v)}>
                {on ? '✓' : ''} {v}
              </Tag>
            );
          })}
        </div>
      </div>
    </div>
  );
});
