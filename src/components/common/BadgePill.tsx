/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Check, ShieldCheck, Pin, Star, Award, Sparkles } from 'lucide-react';
import { VerificationCategory } from '../../types';

interface VerifiedBadgeProps {
  size?: number;
  category?: VerificationCategory;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 15,
  category = 'notable_figure',
  className = '',
  onClick
}) => {
  const isOfficial = category === 'official_platform' || category === 'special_official';
  const isOrg = category === 'organization_brand';

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation();
      onClick(e);
    }
  };

  return (
    <span
      onClick={handleClick}
      className={`inline-flex items-center justify-center rounded-full shrink-0 select-none ${
        onClick ? 'cursor-pointer hover:scale-110 active:scale-95 transition-transform' : ''
      } ${
        isOfficial
          ? 'bg-gradient-to-tr from-[#9C7E45] via-[#C5A46D] to-[#DFCA98] text-black shadow-[0_0_8px_rgba(197,164,109,0.4)]'
          : isOrg
          ? 'bg-gradient-to-tr from-[#7C3AED] via-[#8B5CF6] to-[#C5A46D] text-white shadow-[0_0_8px_rgba(139,92,246,0.3)]'
          : 'bg-[#1D9BF0] text-white shadow-sm'
      } ${className}`}
      style={{ width: size, height: size }}
      title={
        isOfficial
          ? 'حساب رسمي معتمد من منصة Q'
          : isOrg
          ? 'منظمة أو استوديو موثق في Q'
          : 'حساب موثق وشخصية عامة'
      }
    >
      {isOrg ? (
        <ShieldCheck size={size * 0.75} strokeWidth={2.8} />
      ) : (
        <Check size={size * 0.72} strokeWidth={3.4} />
      )}
    </span>
  );
};

export const OGBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <span
      className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase text-black bg-gradient-to-r from-[#DFCA98] via-[#C5A46D] to-[#9C7E45] shadow-[0_0_8px_rgba(197,164,109,0.3)] shrink-0 ${className}`}
      title="عضو أصلي - الجيل الأول (OG Founder Era)"
    >
      OG
    </span>
  );
};

export const PinnedBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-[#C5A46D] bg-[#1C160C] border border-[#C5A46D]/30 shadow-sm ${className}`}
    >
      <Pin size={10} className="rotate-45" />
      <span>مثبت</span>
    </span>
  );
};

export const LevelBadge: React.FC<{ level: number; size?: 'sm' | 'md' | 'lg'; onClick?: () => void; className?: string }> = ({
  level,
  size = 'sm',
  onClick,
  className = ''
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
    lg: 'text-sm px-3.5 py-1 gap-2'
  };

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center font-bold text-[#C5A46D] bg-[#161208] border border-[#C5A46D]/40 rounded-full shadow-[0_0_8px_rgba(197,164,109,0.2)] select-none ${
        onClick ? 'cursor-pointer hover:border-[#C5A46D] hover:scale-105 active:scale-95 transition-all' : ''
      } ${sizeStyles[size]} ${className}`}
      title={`المستوى ${level} - انقر للاطلاع على تفاصيل الخبرة`}
    >
      <Star size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} fill="#C5A46D" />
      <span className="force-ltr font-mono font-bold">Lv.{level}</span>
    </span>
  );
};

interface TitleChipProps {
  icon?: string;
  text: string;
  color?: 'gold' | 'purple' | 'blue' | 'silver';
  size?: 'sm' | 'md';
  className?: string;
  onClick?: () => void;
}

export const TitleChip: React.FC<TitleChipProps> = ({
  icon,
  text,
  color = 'gold',
  size = 'md',
  className = '',
  onClick
}) => {
  const getColorStyles = () => {
    switch (color) {
      case 'gold':
        return 'bg-[#1C160C] text-[#C5A46D] border border-[#C5A46D]/35 shadow-[0_0_10px_rgba(197,164,109,0.15)]';
      case 'purple':
        return 'bg-[#160E29] text-[#A78BFA] border border-[#8B5CF6]/35 shadow-[0_0_10px_rgba(139,92,246,0.15)]';
      case 'blue':
        return 'bg-[#0B1A2E] text-[#60A5FA] border border-[#3B82F6]/35';
      case 'silver':
      default:
        return 'bg-[#191919] text-[#D1D5DB] border border-white/10';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-medium rounded-full backdrop-blur-sm select-none ${getColorStyles()} ${sizeClasses} ${
        onClick ? 'cursor-pointer hover:brightness-110 active:scale-95' : ''
      } ${className}`}
    >
      {icon && <span className="text-[13px]">{icon}</span>}
      <span className="truncate">{text}</span>
    </span>
  );
};
