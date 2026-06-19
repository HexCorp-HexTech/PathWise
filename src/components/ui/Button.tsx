/* ============================================
   VIDYA AI — Button Component
   ============================================ */
import React from 'react';
import { type LucideIcon } from 'lucide-react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${fullWidth ? 'btn--full' : ''} ${loading ? 'btn--loading' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn__spinner" />}
      {Icon && !loading && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
      {children && <span className="btn__label">{children}</span>}
      {IconRight && <IconRight size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
    </button>
  );
};
