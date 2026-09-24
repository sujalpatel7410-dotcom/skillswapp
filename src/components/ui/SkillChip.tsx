import React from 'react';
import { SkillLevel } from '../../types';

interface SkillChipProps {
  name: string;
  level?: SkillLevel;
  type?: 'teach' | 'learn';
  onRemove?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const levelColors: Record<SkillLevel, string> = {
  Beginner: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  Intermediate: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  Advanced: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
  Expert: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20'
};

export const SkillChip: React.FC<SkillChipProps> = ({
  name,
  level,
  type,
  onRemove,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-3.5 py-1.5'
  }[size];

  const typeBadge = type === 'teach' ? (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
      style={{ backgroundColor: 'var(--color-primary)' }}
      title="Teaching"
    />
  ) : type === 'learn' ? (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 opacity-60"
      style={{ backgroundColor: 'var(--color-primary)' }}
      title="Learning"
    />
  ) : null;

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium transition-colors ${sizeClasses} ${className}`}
      style={{
        backgroundColor: 'var(--color-soft)',
        color: 'var(--color-primary)',
        border: '1px solid var(--color-soft)'
      }}
    >
      {typeBadge}
      <span>{name}</span>
      {level && (
        <span className="ml-1.5 text-[10px] uppercase font-normal tracking-wider opacity-75">
          • {level}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1.5 -mr-1 p-0.5 rounded-full hover:opacity-75 transition-opacity"
          style={{ color: 'var(--color-primary)' }}
          title="Remove skill"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};
