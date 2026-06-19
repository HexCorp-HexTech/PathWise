/* ============================================
   VIDYA AI — Card Component
   ============================================ */
import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass' | 'outlined' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  style,
}) => {
  return (
    <div
      className={`card card--${variant} card--pad-${padding} ${onClick ? 'card--clickable' : ''} ${className}`}
      onClick={onClick}
      style={style}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
    >
      {children}
    </div>
  );
};

/* Stat Card */
interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, change, icon, color }) => {
  return (
    <Card variant="elevated" className="stat-card">
      <div className="stat-card__header">
        <span className="stat-card__label">{label}</span>
        {icon && <div className="stat-card__icon" style={{ color }}>{icon}</div>}
      </div>
      <div className="stat-card__value">{value}</div>
      {change !== undefined && (
        <div className={`stat-card__change ${change >= 0 ? 'stat-card__change--up' : 'stat-card__change--down'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </div>
      )}
    </Card>
  );
};
