import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number; // 0 - 5
  max?: number;
  interactive?: boolean;
  onChange?: (val: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  reviewCount?: number;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  interactive = false,
  onChange,
  size = 'md',
  showNumber = true,
  reviewCount,
  className = ''
}) => {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  }[size];

  const activeVal = hoverValue !== null ? hoverValue : value;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, i) => {
          const starIndex = i + 1;
          const isFilled = starIndex <= activeVal;
          const isHalf = !isFilled && starIndex - 0.5 <= activeVal;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onMouseEnter={() => interactive && setHoverValue(starIndex)}
              onMouseLeave={() => interactive && setHoverValue(null)}
              onClick={() => interactive && onChange && onChange(starIndex)}
              className={`${interactive ? 'cursor-pointer p-0.5 hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
            >
              <Star
                className={`${starSizes} transition-colors`}
                style={{
                  fill: isFilled ? 'var(--color-primary)' : isHalf ? 'var(--color-soft)' : 'transparent',
                  color: isFilled ? 'var(--color-primary)' : isHalf ? 'var(--color-primary)' : 'var(--color-soft)'
                }}
              />
            </button>
          );
        })}
      </div>

      {showNumber && (
        <span className="text-xs font-medium ml-0.5" style={{ color: 'var(--color-text)' }}>
          {value.toFixed(1)}
        </span>
      )}

      {reviewCount !== undefined && (
        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
};
