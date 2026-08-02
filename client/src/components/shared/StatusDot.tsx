import React from 'react';

interface StatusDotProps {
  acos: number;
  size?: number;
}

/**
 * ACOS 状态圆点组件
 *
 * dot-gray / dot-green / dot-amber / dot-orange / dot-red
 */
export const StatusDot: React.FC<StatusDotProps> = ({ acos, size = 10 }) => {
  const getClass = (): string => {
    if (acos <= 0) return 'dot-gray';
    if (acos <= 0.35) return 'dot-green';
    if (acos <= 0.50) return 'dot-amber';
    if (acos <= 1.00) return 'dot-orange';
    return 'dot-red';
  };

  return (
    <span
      className={`status-dot ${getClass()}`}
      style={{ width: size, height: size }}
    />
  );
};
