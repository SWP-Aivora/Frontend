import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  className?: string;
  size?: number;
  readonly?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  max = 5,
  className,
  size = 24,
  readonly = false,
}) => {
  const [hover, setHover] = React.useState<number | null>(null);

  return (
    <div className={cn('flex gap-1', className)}>
      {[...Array(max)].map((_, index) => {
        const ratingValue = index + 1;
        const active = (hover || value) >= ratingValue;

        return (
          <button
            key={index}
            type="button"
            className={cn(
              'transition-colors focus:outline-none',
              readonly ? 'cursor-default' : 'cursor-pointer'
            )}
            onClick={() => !readonly && onChange?.(ratingValue)}
            onMouseEnter={() => !readonly && setHover(ratingValue)}
            onMouseLeave={() => !readonly && setHover(null)}
          >
            <Star
              size={size}
              className={cn(
                'transition-all duration-200',
                active ? 'fill-[#1f6eeb] text-[#1f6eeb]' : 'fill-none text-[#c7dbf5]'
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

interface DotRatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  className?: string;
}

export const DotRating: React.FC<DotRatingProps> = ({
  value,
  onChange,
  max = 5,
  className,
}) => {
  return (
    <div className={cn('flex gap-2', className)}>
      {[...Array(max)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            key={index}
            type="button"
            className={cn(
              'w-4 h-4 rounded-full transition-colors focus:outline-none',
              value >= ratingValue ? 'bg-[#1f6eeb]' : 'bg-[#c7dbf5]'
            )}
            onClick={() => onChange?.(ratingValue)}
          />
        );
      })}
    </div>
  );
};
