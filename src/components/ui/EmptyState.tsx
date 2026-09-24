import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 max-w-lg mx-auto ${className}`}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px dashed var(--color-soft)',
        borderRadius: 'var(--radius-card)'
      }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
        style={{
          backgroundColor: 'var(--color-soft)',
          color: 'var(--color-primary)'
        }}
      >
        <Icon className="w-7 h-7" />
      </div>

      <h3
        className="text-lg font-medium mb-1.5"
        style={{
          color: 'var(--color-text)',
          fontFamily: 'var(--font-heading)'
        }}
      >
        {title}
      </h3>

      <p className="text-sm max-w-sm mb-6 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-85 transition-opacity"
          style={{
            backgroundColor: 'var(--color-soft)',
            color: 'var(--color-primary)'
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
