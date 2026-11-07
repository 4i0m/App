/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface QLogoProps {
  size?: number;
  className?: string;
  variant?: 'gold' | 'white' | 'monochrome' | 'darkOnGold';
  withGlow?: boolean;
}

export const QLogo: React.FC<QLogoProps> = ({
  size = 28,
  className = '',
  variant = 'gold',
  withGlow = false
}) => {
  const gradientId = `qGoldGradient_${size}_${Math.random().toString(36).substring(2, 7)}`;
  const bevelId = `qBevelGradient_${size}_${Math.random().toString(36).substring(2, 7)}`;
  const filterId = `qGlow_${size}_${Math.random().toString(36).substring(2, 7)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none transition-transform duration-300 ${withGlow ? 'drop-shadow-[0_0_16px_rgba(197,164,109,0.45)]' : ''} ${className}`}
    >
      <defs>
        {/* Luxury multi-stop gold gradient */}
        <linearGradient id={gradientId} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#F9E8C7" />
          <stop offset="25%" stopColor="#DFCA98" />
          <stop offset="50%" stopColor="#C5A46D" />
          <stop offset="75%" stopColor="#9C7E45" />
          <stop offset="100%" stopColor="#705626" />
        </linearGradient>

        {/* Secondary inner ring bevel gradient for sculpted 3D appearance */}
        <linearGradient id={bevelId} x1="70%" y1="15%" x2="30%" y2="85%">
          <stop offset="0%" stopColor="#FFF2D6" />
          <stop offset="50%" stopColor="#C5A46D" />
          <stop offset="100%" stopColor="#4A3715" />
        </linearGradient>

        {withGlow && (
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#C5A46D" floodOpacity="0.5" />
          </filter>
        )}
      </defs>

      {/* Main Sculpted Q Ring */}
      <path
        d="M48 14C28.1177 14 12 30.1177 12 50C12 69.8823 28.1177 86 48 86C56.1259 86 63.6366 83.3087 69.6973 78.7617L77.8281 86.8926C79.7807 88.8452 82.9466 88.8452 84.8992 86.8926C86.8518 84.94 86.8518 81.7741 84.8992 79.8215L76.5332 71.4555C81.206 65.3402 84 57.7121 84 50C84 30.1177 67.8823 14 48 14ZM48 26C61.2548 26 72 36.7452 72 50C72 56.6304 69.3137 62.6304 64.9688 66.9754L55.5 57.5066C53.5474 55.554 50.3815 55.554 48.4289 57.5066C46.4763 59.4592 46.4763 62.6251 48.4289 64.5777L57.8977 74.0465C54.8967 75.3135 51.5471 76 48 76C33.6406 76 22 64.3594 22 50C22 35.6406 33.6406 26 48 26Z"
        fill={variant === 'white' ? '#FFFFFF' : variant === 'darkOnGold' ? '#000000' : `url(#${gradientId})`}
        filter={withGlow ? `url(#${filterId})` : undefined}
      />

      {/* Subtle Inner Highlight Arc */}
      <path
        d="M32 30C36.6 25.8 42.1 24 48 24C53.9 24 59.4 25.8 64 30"
        stroke="#FFFFFF"
        strokeOpacity="0.35"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Diagonal Geometric Tail Accent */}
      <path
        d="M62 64L83 85"
        stroke={variant === 'white' ? '#FFFFFF' : `url(#${bevelId})`}
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
};
