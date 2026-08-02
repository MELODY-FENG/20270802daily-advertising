import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
  subtitle?: string;
}

/** 区块标题 — 商务专业风格，左侧细竖线 */
export const SectionTitle: React.FC<SectionTitleProps> = ({ children, subtitle }) => (
  <div className="section-title fade-in-section">
    {children}
    {subtitle && <span className="subtitle-context">{subtitle}</span>}
  </div>
);
