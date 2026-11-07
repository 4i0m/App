/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, CheckCircle2, ShieldCheck, Award, Star, TrendingUp, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VerifiedBadge, LevelBadge } from './BadgePill';

export const VerificationDetailModal: React.FC = () => {
  const { verificationDetailUser, setVerificationDetailUser, t } = useApp();

  if (!verificationDetailUser) return null;

  const category = verificationDetailUser.verificationCategory || 'notable_figure';
  const details = verificationDetailUser.verificationDetails;

  const getCategoryTitle = () => {
    switch (category) {
      case 'official_platform':
        return t.officialPlatformVerified;
      case 'organization_brand':
        return t.organizationBrandVerified;
      case 'creator_professional':
        return t.creatorProfessionalVerified;
      case 'special_official':
        return t.specialOfficialVerified;
      case 'notable_figure':
      default:
        return t.notableFigureVerified;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-[#141414] border border-[#C5A46D]/40 p-5 shadow-2xl text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#C5A46D]/15 border-2 border-[#C5A46D] mx-auto flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(197,164,109,0.3)]">
          <VerifiedBadge size={32} category={category} />
        </div>

        <div>
          <h3 className="text-base font-bold text-white flex items-center justify-center gap-1.5">
            <span>@{verificationDetailUser.username}</span>
            <VerifiedBadge size={16} category={category} />
          </h3>
          <span className="text-xs text-[#C5A46D] font-semibold mt-1 block">
            {getCategoryTitle()}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/50 border border-white/[0.08] text-xs text-start space-y-1.5">
          <div className="flex justify-between py-1 border-b border-white/[0.04]">
            <span className="text-[#8E8E93]">جهة الاعتماد:</span>
            <span className="font-semibold text-white">{details?.verifiedBy || 'طاقم إدارة Q'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/[0.04]">
            <span className="text-[#8E8E93]">تاريخ التوثيق:</span>
            <span className="font-semibold text-white">{details?.verifiedAt || '2024'}</span>
          </div>
          {details?.reason && (
            <div className="pt-1">
              <span className="text-[#8E8E93] text-[10px] block mb-0.5">مذكرة التوثيق الرسمية:</span>
              <p className="text-[#EDEDED] leading-relaxed">{details.reason}</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setVerificationDetailUser(null)}
          className="w-full py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
};

export const LevelDetailModal: React.FC = () => {
  const { levelDetailUser, setLevelDetailUser, t } = useApp();

  if (!levelDetailUser) return null;

  const xpPercent = Math.min(100, Math.round((levelDetailUser.xp / levelDetailUser.nextLevelXp) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-[#141414] border border-[#C5A46D]/40 p-5 shadow-2xl text-center space-y-4">
        {/* Level Emblem */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#9C7E45] to-[#DFCA98] mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(197,164,109,0.35)]">
          <Star size={32} className="text-black" fill="black" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-white flex items-center justify-center gap-1.5 font-mono">
            <span>المستوى {levelDetailUser.level}</span>
          </h3>
          <span className="text-xs text-[#C5A46D] font-semibold mt-0.5 block">
            رتبة التفاعل المتقدمة في شبكة Q
          </span>
        </div>

        {/* Progress bar */}
        <div className="p-3.5 rounded-2xl bg-black/50 border border-white/[0.08] space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[#8E8E93]">{t.exp}:</span>
            <span className="text-[#C5A46D] force-ltr">{levelDetailUser.xp} / {levelDetailUser.nextLevelXp} XP</span>
          </div>

          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#DFCA98] to-[#C5A46D] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(197,164,109,0.5)]"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* Earn Rules List */}
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-start space-y-1.5">
          <span className="font-bold text-white block mb-1">{t.howToEarnXP}</span>
          <ul className="space-y-1 text-[#A8A8A8] text-[11px]">
            {t.earnRules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-[#C5A46D]">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => setLevelDetailUser(null)}
          className="w-full py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
};
