/* ============================================
   VIDYA AI — Progress Components
   ============================================ */
import React from 'react';
import './Progress.css';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  color?: string;
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  color,
  animated = true,
  className = '',
}) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`progress-bar progress-bar--${size} ${className}`}>
      <div className="progress-bar__track">
        <div
          className={`progress-bar__fill progress-bar__fill--${variant} ${animated ? 'progress-bar__fill--animated' : ''}`}
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className="progress-bar__label">{Math.round(percent)}%</span>
      )}
    </div>
  );
};

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  showValue?: boolean;
  label?: string;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  max = 100,
  size = 80,
  strokeWidth = 6,
  color = 'var(--color-primary)',
  trackColor = 'var(--color-surface-overlay)',
  showValue = true,
  label,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="progress-ring__svg">
        <circle
          className="progress-ring__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          className="progress-ring__circle"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="progress-ring__content">
        {children || (
          <>
            {showValue && (
              <span className="progress-ring__value">{Math.round(percent)}%</span>
            )}
            {label && <span className="progress-ring__label">{label}</span>}
          </>
        )}
      </div>
    </div>
  );
};
