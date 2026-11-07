/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { createGradientAvatar } from '../../data/initialData';

interface UserAvatarProps {
  userId?: string;
  avatarUrl?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showOnline?: boolean;
  isOnline?: boolean;
  className?: string;
  clickable?: boolean;
  borderStyle?: 'none' | 'subtle' | 'gold' | 'purple';
  onClick?: (e: React.MouseEvent) => void;
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-24 h-24 text-2xl'
};

const DOT_SIZE_MAP = {
  xs: 'w-1.5 h-1.5 bottom-0 right-0',
  sm: 'w-2 h-2 bottom-0 right-0',
  md: 'w-2.5 h-2.5 bottom-0.5 right-0.5',
  lg: 'w-3 h-3 bottom-0.5 right-0.5',
  xl: 'w-3.5 h-3.5 bottom-1 right-1',
  '2xl': 'w-4 h-4 bottom-1.5 right-1.5'
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  userId,
  avatarUrl,
  name = 'User',
  size = 'md',
  showOnline = false,
  isOnline = true,
  className = '',
  clickable = true,
  borderStyle = 'subtle',
  onClick
}) => {
  const { openUserProfile, allUsers } = useApp();
  const [imgError, setImgError] = useState(false);

  const resolvedUser = userId ? allUsers[userId] : null;
  const finalAvatar = avatarUrl || resolvedUser?.avatarUrl || createGradientAvatar(name);
  const finalOnline = showOnline && (isOnline || resolvedUser?.isOnline);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
      return;
    }
    if (clickable && userId) {
      e.stopPropagation();
      openUserProfile(userId);
    }
  };

  const getBorderClass = () => {
    switch (borderStyle) {
      case 'gold':
        return 'border-2 border-[#C5A46D] shadow-[0_0_12px_rgba(197,164,109,0.3)]';
      case 'purple':
        return 'border-2 border-[#8B5CF6] shadow-[0_0_12px_rgba(139,92,246,0.3)]';
      case 'subtle':
        return 'border border-white/10';
      default:
        return 'border-0';
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative inline-block shrink-0 rounded-full select-none ${
        clickable && userId ? 'cursor-pointer transition-transform active:scale-95 hover:opacity-95' : ''
      } ${className}`}
      title={name}
      role={clickable && userId ? 'button' : undefined}
      tabIndex={clickable && userId ? 0 : undefined}
      onKeyDown={(e) => {
        if (clickable && userId && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          openUserProfile(userId);
        }
      }}
    >
      <div className={`overflow-hidden rounded-full bg-[#121212] ${SIZE_MAP[size]} ${getBorderClass()}`}>
        {imgError ? (
          <img
            src={createGradientAvatar(name)}
            alt={name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <img
            src={finalAvatar}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      {finalOnline && (
        <span
          className={`absolute rounded-full bg-[#10B981] ring-2 ring-black ${DOT_SIZE_MAP[size]}`}
          title="Online"
        />
      )}
    </div>
  );
};
