import React from 'react';
import './DwarfParade.css';

const DWARFS = [
  { hat: '#E85D75', body: '#F0B0B8', eye: 'happy' },
  { hat: '#5DADE2', body: '#98CCF0', eye: 'wink' },
  { hat: '#F4D03F', body: '#F9E076', eye: 'wide' },
  { hat: '#48C9B0', body: '#80DFCE', eye: 'normal' },
  { hat: '#AF7AC5', body: '#CFA8DF', eye: 'sparkle' },
  { hat: '#F1948A', body: '#F7BCB8', eye: 'happy' },
];

/** 可爱手拉手小矮人 */
const DwarfSvg: React.FC<{ hat: string; body: string; eye: string; side: 'left' | 'right' | 'mid'; idx: number }> = ({ hat, body, eye, side, idx }) => {
  const armRight = side !== 'right';
  const armLeft = side !== 'left';
  return (
    <div className="dwarf-figure">
      <svg className="dwarf-svg" viewBox="0 0 40 48" width="36" height="44">
        {/* 身体 - 更圆润 */}
        <rect x="10" y="20" width="18" height="18" rx="9" fill={body} stroke="#6B5B4F" strokeWidth="0.5" />
        {/* 腿 - 短粗 */}
        <rect x="12" y="36" width="6" height="8" rx="3" fill="#E8C8A8" stroke="#6B5B4F" strokeWidth="0.4" />
        <rect x="20" y="36" width="6" height="8" rx="3" fill="#E8C8A8" stroke="#6B5B4F" strokeWidth="0.4" />
        {/* 鞋 */}
        <ellipse cx="15" cy="45" rx="4" ry="2.5" fill="#8B6B4A" />
        <ellipse cx="23" cy="45" rx="4" ry="2.5" fill="#8B6B4A" />
        {/* 左臂 - 伸出去牵手 */}
        {armLeft && (
          <path d="M10,24 Q4,24 4,28 Q4,30 8,30" stroke="#FDDCB5" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        )}
        {/* 右臂 - 伸出去牵手 */}
        {armRight && (
          <path d="M28,24 Q34,24 34,28 Q34,30 30,30" stroke="#FDDCB5" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        )}
        {/* 头 - 更大更圆 */}
        <circle cx="19" cy="11" r="10" fill="#FDDCB5" stroke="#6B5B4F" strokeWidth="0.5" />
        {/* 帽子 */}
        <path d="M6,5 Q5,-5 19,-11 Q33,-5 32,5" fill={hat} stroke="#6B5B4F" strokeWidth="0.5" />
        <ellipse cx="19" cy="5" rx="14" ry="3.5" fill={hat} stroke="#6B5B4F" strokeWidth="0.4" />
        {/* 腮红 */}
        <circle cx="8" cy="14" r="2.5" fill="#F5B7B1" opacity="0.45" />
        <circle cx="30" cy="14" r="2.5" fill="#F5B7B1" opacity="0.45" />
        {/* 鼻子 */}
        <ellipse cx="19" cy="13" rx="1.5" ry="1.2" fill="#E8C8A8" />
        {/* 眼睛 - 不同表情 */}
        {eye === 'happy' && <><path d="M7,10 Q10,7 13,10" stroke="#4A3828" fill="none" strokeWidth="1.3" strokeLinecap="round" /><path d="M25,10 Q28,7 31,10" stroke="#4A3828" fill="none" strokeWidth="1.3" strokeLinecap="round" /></>}
        {eye === 'wink' && <><path d="M7,10 Q10,7 13,10" stroke="#4A3828" fill="none" strokeWidth="1.3" strokeLinecap="round" /><circle cx="28" cy="10" r="2" fill="#4A3828" /></>}
        {eye === 'wide' && <><circle cx="10" cy="10" r="2.8" fill="#4A3828" /><circle cx="28" cy="10" r="2.8" fill="#4A3828" /><circle cx="11" cy="9.5" r="0.9" fill="#fff" /><circle cx="29" cy="9.5" r="0.9" fill="#fff" /></>}
        {eye === 'normal' && <><ellipse cx="10" cy="10" rx="2" ry="2.2" fill="#4A3828" /><ellipse cx="28" cy="10" rx="2" ry="2.2" fill="#4A3828" /></>}
        {eye === 'sparkle' && <><circle cx="10" cy="10" r="2.2" fill="#4A3828" /><circle cx="28" cy="10" r="2.2" fill="#4A3828" /><text x="5" y="7" fontSize="6">✦</text><text x="23" y="7" fontSize="6">✦</text></>}
        {/* 微笑 */}
        <path d="M14,16 Q19,20 24,16" stroke="#4A3828" fill="none" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  );
};

/** 布幔横幅 - 麻绳与布料边缘契合 */
const FabricBanner: React.FC = () => (
  <div className="fabric-banner">
    <svg className="banner-svg" viewBox="0 0 220 60" width="200" height="54">
      <defs>
        <pattern id="ft" width="5" height="5" patternUnits="userSpaceOnUse">
          <line x1="0" y1="2.5" x2="5" y2="2.5" stroke="rgba(139,98,57,0.06)" strokeWidth="0.4" />
          <line x1="2.5" y1="0" x2="2.5" y2="5" stroke="rgba(139,98,57,0.04)" strokeWidth="0.3" />
        </pattern>
        <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C4A070" />
          <stop offset="20%" stopColor="#B89460" />
          <stop offset="50%" stopColor="#A67C52" />
          <stop offset="80%" stopColor="#B89460" />
          <stop offset="100%" stopColor="#C4A070" />
        </linearGradient>
      </defs>
      {/* 布幔主体 - 波浪褶皱 */}
      <path d="M14,6 Q34,2 54,6 Q74,10 94,6 Q114,2 134,6 Q154,10 174,6 Q194,2 208,6 L208,44 Q188,50 168,44 Q148,38 128,44 Q108,50 88,44 Q68,38 48,44 Q28,50 14,44 Z"
        fill="url(#fg)" stroke="#8B6239" strokeWidth="0.6" />
      <path d="M14,6 Q34,2 54,6 Q74,10 94,6 Q114,2 134,6 Q154,10 174,6 Q194,2 208,6 L208,44 Q188,50 168,44 Q148,38 128,44 Q108,50 88,44 Q68,38 48,44 Q28,50 14,44 Z"
        fill="url(#ft)" />
      {/* 包边 */}
      <path d="M14,6 Q34,2 54,6 Q74,10 94,6 Q114,2 134,6 Q154,10 174,6 Q194,2 208,6"
        stroke="#6B4A2A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M14,44 Q28,50 48,44 Q68,38 88,44 Q108,50 128,44 Q148,38 168,44 Q188,50 208,44"
        stroke="#6B4A2A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* 麻绳穿孔环 - 左侧 */}
      <circle cx="14" cy="6" r="4" fill="none" stroke="#A0845C" strokeWidth="1.5" />
      <circle cx="14" cy="44" r="4" fill="none" stroke="#A0845C" strokeWidth="1.5" />
      {/* 麻绳线 - 左侧，连接穿孔环 */}
      <line x1="4" y1="4" x2="10" y2="6" stroke="#C4A070" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="4" y1="4" x2="10" y2="6" stroke="#8B7355" strokeWidth="0.8" strokeLinecap="round" strokeDasharray="2,3" />
      <line x1="4" y1="48" x2="10" y2="44" stroke="#C4A070" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="4" y1="48" x2="10" y2="44" stroke="#8B7355" strokeWidth="0.8" strokeLinecap="round" strokeDasharray="2,3" />
      {/* 麻绳穿孔环 - 右侧 */}
      <circle cx="208" cy="6" r="4" fill="none" stroke="#A0845C" strokeWidth="1.5" />
      <circle cx="208" cy="44" r="4" fill="none" stroke="#A0845C" strokeWidth="1.5" />
      {/* 麻绳线 - 右侧 */}
      <line x1="208" y1="6" x2="216" y2="4" stroke="#C4A070" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="208" y1="6" x2="216" y2="4" stroke="#8B7355" strokeWidth="0.8" strokeLinecap="round" strokeDasharray="2,3" />
      <line x1="208" y1="44" x2="216" y2="48" stroke="#C4A070" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="208" y1="44" x2="216" y2="48" stroke="#8B7355" strokeWidth="0.8" strokeLinecap="round" strokeDasharray="2,3" />
      {/* 文字 */}
      <text x="111" y="30" textAnchor="middle" dominantBaseline="middle"
        fontFamily="'Fira Sans','PingFang SC','Microsoft YaHei',sans-serif"
        fontSize="15" fontWeight="700" fill="#F8F3ED" letterSpacing="3"
        stroke="rgba(0,0,0,0.08)" strokeWidth="0.4">有力有利调整每一天</text>
    </svg>
  </div>
);

/** 小矮人游行 */
export const DwarfParade: React.FC = () => (
  <div className="dwarf-parade-bar">
    <div className="dwarf-runner">
      {DWARFS.slice(0, 3).map((d, i) => (
        <DwarfSvg key={i} hat={d.hat} body={d.body} eye={d.eye} side={i === 0 ? 'left' : 'mid'} idx={i} />
      ))}
      <FabricBanner />
      {DWARFS.slice(3).map((d, i) => (
        <DwarfSvg key={i + 3} hat={d.hat} body={d.body} eye={d.eye} side={i === 2 ? 'right' : 'mid'} idx={i + 3} />
      ))}
    </div>
  </div>
);
