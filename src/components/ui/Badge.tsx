import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  children: ReactNode;
  className?: string;
}

export default function Badge({ variant = 'primary', children, className = '' }: BadgeProps) {
  const variantClass = {
    primary: 'badge-primary',
    secondary: 'bg-surface-container-high text-on-surface-variant',
    success: 'badge-verified',
    warning: 'badge-pending',
    error: 'badge-rejected',
  }[variant];

  return (
    <span className={`badge ${variantClass} ${className}`}>
      {children}
    </span>
  );
}
