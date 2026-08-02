/**
 * 看板全局状态 — Zustand Store
 *
 * 管理: 多文件数据、当前文件、筛选器、排序、分页
 * 数据处理逻辑在 utils/ 中，Store 只负责状态管理
 */

import { create } from 'zustand';
import type { AdRow, CampaignAgg, FileEntry, SortState } from '../types/data';
import type { FilterState } from '../types/filters';
import { applyFilters } from '../utils/filter';
import { calcAggregates, groupByCampaign } from '../utils/calc';

interface DashboardState {
  // === 数据 ===
  allFiles: Record<string, FileEntry>;
  currentFileName: string | null;
  currentData: AdRow[];
  filteredData: AdRow[];

  // === 筛选器 ===
  filters: FilterState;

  // === 排序 ===
  tableSort: Record<string, SortState>;

  // === 分页 ===
  detailTablePages: Record<string, number>;
  fullDataPage: number;

  // === 缓存 ===
  campaignCache: CampaignAgg[] | null;
  isLoading: boolean;
  uploadProgress: number;

  // === Actions ===
  setAllFiles: (files: Record<string, FileEntry>) => void;
  addFile: (name: string, entry: FileEntry) => void;
  removeFile: (name: string) => void;
  setCurrentFileName: (name: string | null) => void;
  setFilters: (key: string, values: string[]) => void;
  batchSetFilters: (f: FilterState) => void;
  clearFilters: () => void;
  setSort: (tableId: string, key: string, dir: 'asc' | 'desc') => void;
  setDetailPage: (tableId: string, page: number) => void;
  setFullDataPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
  setUploadProgress: (pct: number) => void;
  refreshData: () => void;
  /** 加载默认数据 */
  loadDefaultData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // === 初始状态 ===
  allFiles: {},
  currentFileName: null,
  currentData: [],
  filteredData: [],
  filters: {},
  tableSort: {},
  detailTablePages: {},
  fullDataPage: 0,
  campaignCache: null,
  isLoading: false,
  uploadProgress: 0,

  // === Actions ===
  setAllFiles: (files) => {
    const fileNames = Object.keys(files);
    const sorted = fileNames.sort((a, b) => {
      const cleanA = a.replace(/\.(xlsx|xls)$/i, '');
      const cleanB = b.replace(/\.(xlsx|xls)$/i, '');
      return cleanA.localeCompare(cleanB);
    });
    const latest = sorted[sorted.length - 1] || null;
    const currentData = latest ? files[latest].data : [];

    set({
      allFiles: files,
      currentFileName: latest,
      currentData,
      campaignCache: null,
    });
    // 触发数据刷新
    get().refreshData();
  },

  addFile: (name, entry) => {
    const { allFiles } = get();
    const newFiles = { ...allFiles, [name]: entry };
    const sorted = Object.keys(newFiles).sort((a, b) => {
      const cleanA = a.replace(/\.(xlsx|xls)$/i, '');
      const cleanB = b.replace(/\.(xlsx|xls)$/i, '');
      return cleanA.localeCompare(cleanB);
    });
    const latest = sorted[sorted.length - 1] || null;

    set({
      allFiles: newFiles,
      currentFileName: latest,
      currentData: latest ? newFiles[latest].data : [],
      campaignCache: null,
    });
    get().refreshData();
  },

  removeFile: (name) => {
    const { allFiles, currentFileName } = get();
    const newFiles = { ...allFiles };
    delete newFiles[name];
    const sorted = Object.keys(newFiles).sort();
    const latest = sorted.length > 0 ? sorted[sorted.length - 1] : null;

    set({
      allFiles: newFiles,
      currentFileName: currentFileName === name ? latest : currentFileName,
      currentData: latest ? newFiles[latest].data : [],
      campaignCache: null,
    });
    get().refreshData();
  },

  setCurrentFileName: (name) => {
    const { allFiles } = get();
    if (name && allFiles[name]) {
      set({
        currentFileName: name,
        currentData: allFiles[name].data,
        campaignCache: null,
      });
      get().refreshData();
    }
  },

  setFilters: (key, values) => {
    const { filters } = get();
    const newFilters = { ...filters };
    if (values.length === 0) {
      delete newFilters[key];
    } else {
      newFilters[key] = values;
    }
    set({ filters: newFilters, campaignCache: null });
    // 不自动刷新，等用户点击"确认"
  },

  batchSetFilters: (f) => {
    set({ filters: f, campaignCache: null });
  },

  clearFilters: () => {
    set({ filters: {}, campaignCache: null });
  },

  setSort: (tableId, key, dir) => {
    const { tableSort } = get();
    set({ tableSort: { ...tableSort, [tableId]: { key, dir } } });
  },

  setDetailPage: (tableId, page) => {
    const { detailTablePages } = get();
    set({ detailTablePages: { ...detailTablePages, [tableId]: page } });
  },

  setFullDataPage: (page) => {
    set({ fullDataPage: page });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setUploadProgress: (pct) => {
    set({ uploadProgress: pct });
  },

  refreshData: () => {
    const { currentData, filters } = get();

    // 应用筛选
    const filtered = applyFilters(currentData, filters);

    // 计算聚合缓存
    const campaigns = filtered.length > 0 ? groupByCampaign(filtered) : [];
    const agg = filtered.length > 0 ? calcAggregates(filtered) : null;

    set({
      filteredData: filtered,
      campaignCache: campaigns,
    });

    return { filteredData: filtered, campaigns, agg };
  },

  loadDefaultData: async () => {
    const { allFiles } = get();
    // 如果已有数据则不重复加载
    if (Object.keys(allFiles).length > 0) return;
    try {
      set({ isLoading: true });
      const resp = await fetch('/default-data.json');
      if (!resp.ok) throw new Error('Default data not found');
      const rows: AdRow[] = await resp.json();
      const entry = { data: rows, rawName: 'default-data.json' };
      set({
        allFiles: { '20260715_20260721': entry },
        currentFileName: '20260715_20260721',
        currentData: rows,
        isLoading: false,
      });
      get().refreshData();
      console.log(`✅ 默认数据已加载: ${rows.length} 行`);
    } catch (err) {
      set({ isLoading: false });
      console.log('ℹ️ 无默认数据文件，请上传 Excel');
    }
  },
}));
