import React, { useEffect, useState, Suspense, lazy } from 'react';
import { ConfigProvider, Layout, Menu, Button, Progress, Spin, Upload, Space, message } from 'antd';
import {
  DashboardOutlined, ShopOutlined, TagOutlined, LineChartOutlined, DatabaseOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, UploadOutlined, FolderOpenOutlined,
  ReloadOutlined, ExportOutlined,
} from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import warmBrownTheme from './theme/antd-theme';
import './theme/globals.css';
import './App.css';
import { DwarfParade } from './components/layout/DwarfParade';
import { FilterBar } from './components/layout/FilterBar';
import { useDashboardStore } from './store/dashboardStore';
import { parseExcelFile } from './services/excel-parser';
import { exportToExcel } from './services/excel-exporter';
import { validateFileName } from './utils/file-name';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const { Sider } = Layout;

const menuItems = [
  { key: 'summary', icon: <DashboardOutlined />, label: '汇总数据' },
  { key: 'store', icon: <ShopOutlined />, label: '店铺数据' },
  { key: 'category', icon: <TagOutlined />, label: '三级分类' },
  { key: 'trend', icon: <LineChartOutlined />, label: '多日趋势' },
  { key: 'full', icon: <DatabaseOutlined />, label: '全量数据' },
];

const sectionMap: Record<string, string> = {
  summary: 'panel-summary', store: 'panel-store', category: 'panel-category',
  trend: 'panel-trend', full: 'panel-full',
};

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('summary');
  const loadDefaultData = useDashboardStore((s) => s.loadDefaultData);
  const isLoading = useDashboardStore((s) => s.isLoading);
  const uploadProgress = useDashboardStore((s) => s.uploadProgress);
  const currentFileName = useDashboardStore((s) => s.currentFileName);
  const filteredData = useDashboardStore((s) => s.filteredData);
  const setLoading = useDashboardStore((s) => s.setLoading);
  const setUploadProgress = useDashboardStore((s) => s.setUploadProgress);
  const addFile = useDashboardStore((s) => s.addFile);
  const refreshData = useDashboardStore((s) => s.refreshData);
  const clearFilters = useDashboardStore((s) => s.clearFilters);

  useEffect(() => { loadDefaultData(); }, [loadDefaultData]);

  // 响应式：小屏自动折叠左栏
  useEffect(() => {
    const onResize = () => { if (window.innerWidth < 1200) setCollapsed(true); };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const onMenuClick = (info: { key: string }) => {
    setSelectedKey(info.key);
    const id = sectionMap[info.key];
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // 上传处理
  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setLoading(true); setUploadProgress(0);
    const total = files.length;
    try {
      for (let i = 0; i < total; i++) {
        const file = files[i];
        if (!file.name.match(/\.(xlsx|xls)$/i)) { message.warning(`跳过: ${file.name}`); continue; }
        if (!validateFileName(file.name)) { message.warning(`格式错误(YYYYMMDD_YYYYMMDD): ${file.name}`); continue; }
        const data = await parseExcelFile(file);
        addFile(file.name.replace(/\.(xlsx|xls)$/i, ''), { data, rawName: file.name });
        setUploadProgress(Math.round(((i + 1) / total) * 100));
      }
      message.success(`成功加载 ${total} 个文件`);
    } catch (err) { message.error(`解析失败: ${(err as Error).message}`); }
    finally { setLoading(false); setUploadProgress(0); }
  };

  // 导出
  const handleExport = () => {
    const store = useDashboardStore.getState();
    if (!Object.keys(store.allFiles).length) { message.warning('无数据可导出'); return; }
    const r = exportToExcel(store.allFiles, currentFileName || '');
    r.success ? message.success(`已导出: ${r.fileName}`) : message.error(`失败: ${r.error}`);
  };

  // 确认筛选 — 接收本地 filter state，推送到 store 后刷新
  const handleConfirmFilter = (localFilters: FilterState) => {
    const store = useDashboardStore.getState();
    // 逐个设置 filter 到 store（不触发 refresh）
    store.batchSetFilters(localFilters);
    // 统一刷新一次
    store.refreshData();
    message.success('筛选条件已应用');
  };

  // 清除筛选
  const handleClearFilter = () => {
    const store = useDashboardStore.getState();
    store.batchSetFilters({});
    store.refreshData();
    message.success('筛选条件已清除');
  };

  const siderWidth = collapsed ? 60 : 200;

  return (
    <ConfigProvider theme={warmBrownTheme} locale={zhCN}>
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="ad-upload-bar">
          <Spin size="small" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>正在加载文件...</span>
          <Progress percent={uploadProgress} strokeColor="#A67C52" style={{ flex: 1, maxWidth: 400 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary)', fontFamily: 'var(--font-mono)' }}>{uploadProgress}%</span>
        </div>
      )}

      <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
        {/* 固定左栏 */}
        <Sider className="ad-sider" collapsible collapsed={collapsed} onCollapse={setCollapsed}
          trigger={null} width={200} collapsedWidth={60}>
          <div style={{ padding: '18px 14px', marginBottom: 8,
            borderBottom: '1px solid rgba(166,124,82,0.08)' }}>
            {!collapsed ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: 0.5 }}>广告日监控</div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>美线客厅家具柜</div>
              </>
            ) : <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-primary)', textAlign: 'center' }}>监控</div>}
          </div>
          <Menu mode="inline" selectedKeys={[selectedKey]} onClick={onMenuClick} items={menuItems}
            style={{ background: 'transparent', borderRight: 'none', fontSize: 13 }} />
          <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center' }}>
            <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)} style={{ color: 'var(--text-secondary)' }} />
          </div>
        </Sider>

        {/* 主内容区 */}
        <div className={`ad-content${collapsed ? ' collapsed' : ''}`} style={{ overflowX: 'hidden' }}>
          {/* 冻结顶部栏：标题行 + 按钮行 + 小矮人 */}
          <div className="ad-header-sticky">
            <h1 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px', letterSpacing: 0.5 }}>
              美线客厅家具柜全部搜索广告-日监控
            </h1>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)', background: 'rgba(217,200,180,0.4)', padding: '1px 8px', borderRadius: 10 }}>
                  {currentFileName || '--'}
                </span>
                <span style={{ fontSize: 10, color: 'var(--c-accent)' }}>{new Date().toLocaleTimeString('zh-CN')}</span>
              </div>
              <Space wrap size="small">
                <Upload multiple directory showUploadList={false} accept=".xlsx,.xls"
                  beforeUpload={(_f, flist) => { handleUpload(flist); return false; }}>
                  <Button icon={<FolderOpenOutlined />} size="small">上传文件夹</Button>
                </Upload>
                <Upload multiple showUploadList={false} accept=".xlsx,.xls"
                  beforeUpload={(_f, flist) => { handleUpload(flist); return false; }}>
                  <Button icon={<UploadOutlined />} size="small">上传文件</Button>
                </Upload>
                <Button icon={<ReloadOutlined />} size="small" onClick={() => { refreshData(); message.success('已刷新'); }}>刷新</Button>
                <Button icon={<ExportOutlined />} size="small"
                  style={{ background: 'var(--text-primary)', color: 'var(--c-bg)' }} onClick={handleExport}>导出</Button>
              </Space>
            </div>
            <DwarfParade />
          </div>

          {/* 冻结筛选器（含确认/清除按钮） */}
          <div className="ad-filters-sticky">
            <FilterBar />
          </div>

          {/* 主内容 */}
          <div style={{ padding: '8px 0 40px', maxWidth: '100%', margin: '0 auto' }}>
            {isLoading && (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <Spin size="large" />
                <div style={{ marginTop: 12, color: 'var(--text-secondary)', fontSize: 13 }}>
                  {uploadProgress > 0 ? `加载中... ${uploadProgress}%` : '正在加载数据...'}
                </div>
                {uploadProgress > 0 && <Progress percent={uploadProgress} strokeColor="#A67C52" style={{ maxWidth: 300, margin: '12px auto' }} />}
              </div>
            )}
            <Suspense fallback={<div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>}>
              <Dashboard onMenuClick={onMenuClick} selectedKey={selectedKey} />
            </Suspense>
          </div>
        </div>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
