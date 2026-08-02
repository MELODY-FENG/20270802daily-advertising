import type { ThemeConfig } from 'antd';

/**
 * 暖棕系 (Warm Brown) + 玻璃拟态 (Glassmorphism) Ant Design 主题配置
 *
 * 不可变约束: 颜色方案不可更改，所有 CSS 自定义属性值保持不变
 * 参考: 交接规范.json §视觉设计规范
 */

const warmBrownTheme: ThemeConfig = {
  token: {
    // --- 主色调 ---
    colorPrimary: '#A67C52',
    colorPrimaryBg: '#F8F3ED',
    colorPrimaryBgHover: '#E8C9B0',
    colorPrimaryBorder: '#D9C8B4',
    colorPrimaryBorderHover: '#A67C52',
    colorPrimaryHover: '#8B6239',
    colorPrimaryActive: '#6B4A2A',
    colorPrimaryTextHover: '#8B6239',
    colorPrimaryText: '#A67C52',
    colorPrimaryTextActive: '#6B4A2A',

    // --- 成功/警告/错误 ---
    colorSuccess: '#7BA068',
    colorWarning: '#D4A857',
    colorError: '#C0805A',

    // --- 背景 ---
    colorBgContainer: 'rgba(237, 227, 216, 0.68)',
    colorBgLayout: '#F8F3ED',
    colorBgElevated: 'rgba(237, 227, 216, 0.92)',
    colorBgSpotlight: 'rgba(74, 56, 40, 0.85)',

    // --- 文字 ---
    colorText: '#4A3828',
    colorTextSecondary: '#776251',
    colorTextTertiary: '#A69480',
    colorTextQuaternary: '#C4B8A8',

    // --- 边框 ---
    colorBorder: 'rgba(166, 124, 82, 0.18)',
    colorBorderSecondary: 'rgba(166, 124, 82, 0.1)',

    // --- 圆角 ---
    borderRadius: 14,
    borderRadiusSM: 8,
    borderRadiusLG: 16,

    // --- 字体 ---
    fontFamily: "'Fira Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    fontFamilyCode: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
    fontSize: 14,
    fontSizeSM: 12,
    fontSizeLG: 16,
    fontSizeXL: 20,

    // --- 阴影 ---
    boxShadow: '0 2px 8px rgba(74, 56, 40, 0.08)',
    boxShadowSecondary: '0 4px 16px rgba(74, 56, 40, 0.12), 0 1px 4px rgba(74, 56, 40, 0.06)',

    // --- 其他 ---
    lineHeight: 1.6,
    controlHeight: 34,
    controlHeightSM: 28,
    controlHeightLG: 42,
    paddingContentHorizontal: 20,
    paddingContentVertical: 16,
  },

  components: {
    // --- 按钮 ---
    Button: {
      borderRadius: 8,
      borderRadiusSM: 6,
      borderRadiusLG: 10,
      paddingBlock: 8,
      paddingInline: 20,
      paddingBlockSM: 4,
      paddingInlineSM: 12,
      fontWeight: 600,
      defaultBg: 'rgba(255, 252, 247, 0.65)',
      defaultBorderColor: 'rgba(166, 124, 82, 0.18)',
      defaultHoverBg: 'rgba(255, 252, 247, 0.85)',
      defaultHoverBorderColor: 'rgba(166, 124, 82, 0.3)',
      defaultActiveBg: 'rgba(232, 201, 176, 0.5)',
      primaryShadow: '0 2px 8px rgba(166, 124, 82, 0.25)',
    },

    // --- 选择器 ---
    Select: {
      borderRadius: 8,
      borderRadiusSM: 6,
      colorBgContainer: 'rgba(255, 252, 247, 0.65)',
      colorBgElevated: 'rgba(255, 252, 247, 0.95)',
      optionSelectedBg: 'rgba(166, 124, 82, 0.15)',
      optionActiveBg: 'rgba(232, 201, 176, 0.2)',
      multipleItemBg: 'rgba(217, 200, 180, 0.5)',
      multipleItemBorderColor: 'rgba(166, 124, 82, 0.18)',
      fontWeightStrong: 600,
    },

    // --- 卡片 ---
    Card: {
      borderRadiusLG: 14,
      colorBgContainer: 'rgba(255, 252, 247, 0.65)',
      boxShadow: '0 4px 16px rgba(74, 56, 40, 0.12), 0 1px 4px rgba(74, 56, 40, 0.06)',
      paddingLG: 20,
    },

    // --- 标签 ---
    Tag: {
      borderRadiusSM: 6,
      defaultBg: 'rgba(217, 200, 180, 0.4)',
      defaultColor: '#4A3828',
    },

    // --- 模态框 ---
    Modal: {
      borderRadiusLG: 14,
      colorBgElevated: 'rgba(255, 252, 247, 0.95)',
      titleFontSize: 16,
      titleColor: '#4A3828',
    },

    // --- 输入框 ---
    Input: {
      borderRadius: 8,
      borderRadiusSM: 6,
      colorBgContainer: 'rgba(255, 252, 247, 0.65)',
      activeBorderColor: '#A67C52',
      hoverBorderColor: '#8B6239',
      activeShadow: '0 0 0 3px rgba(166, 124, 82, 0.15)',
    },

    // --- 分页 ---
    Pagination: {
      itemActiveBg: 'rgba(166, 124, 82, 0.15)',
      colorPrimary: '#A67C52',
      colorPrimaryHover: '#8B6239',
    },

    // --- 下拉菜单 ---
    Dropdown: {
      borderRadiusLG: 8,
      colorBgElevated: 'rgba(255, 252, 247, 0.95)',
      boxShadowSecondary: '0 8px 32px rgba(74, 56, 40, 0.16)',
    },

    // --- 通知 ---
    Notification: {
      borderRadiusLG: 14,
      colorBgElevated: 'rgba(255, 252, 247, 0.95)',
    },

    // --- 消息提示 ---
    Message: {
      borderRadiusLG: 8,
      colorBgElevated: 'rgba(255, 252, 247, 0.95)',
    },

    // --- 上传 ---
    Upload: {
      borderRadiusLG: 14,
      colorBgContainer: 'rgba(255, 252, 247, 0.65)',
    },

    // --- 折叠面板 ---
    Collapse: {
      borderRadiusLG: 14,
      colorBgContainer: 'rgba(237,227,216,0.55)',
      headerBg: 'rgba(237,227,216,0.45)',
      contentBg: 'transparent',
      contentPadding: '16px 20px',
    },

    // --- 表格排序 ---
    Table: {
      headerBg: 'rgba(237,227,216,0.35)',
      headerColor: '#4A3828',
      headerSortActiveBg: 'rgba(166,124,82,0.15)',
      headerSortHoverBg: 'rgba(166,124,82,0.10)',
      rowHoverBg: 'rgba(232,201,176,0.12)',
      borderColor: 'rgba(166,124,82,0.06)',
      cellPaddingBlock: 7,
      cellPaddingInline: 10,
      fontSize: 12,
    },
  },
};

export default warmBrownTheme;
