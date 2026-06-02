import React from 'react';
import { Star } from 'lucide-react';

export default function Rating({ rating, reviews, size = 'sm', showCount = true }) {
  const starSize = size === 'sm' ? 14 : size === 'md' ? 18 : 22;
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} size={starSize} className="text-amber-400 fill-amber-400" />
        ))}
        {hasHalf && (
          <span style={{ position: 'relative', display: 'inline-block', width: starSize, height: starSize }}>
            <Star size={starSize} className="text-gray-200 fill-gray-200" style={{ position: 'absolute', top: 0, left: 0 }} />
            <span style={{
              position: 'absolute', top: 0, left: 0, width: '50%', overflow: 'hidden',
              display: 'inline-block', height: '100%'
            }}>
              <Star size={starSize} className="text-amber-400 fill-amber-400" />
            </span>
          </span>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} size={starSize} className="text-gray-200 fill-gray-200" />
        ))}
      </div>
      {showCount && reviews !== undefined && (
        <span className={`text-gray-400 font-medium ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          ({reviews})
        </span>
      )}
    </div>
  );
}
