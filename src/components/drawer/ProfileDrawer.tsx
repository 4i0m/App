/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  User,
  Calendar,
  Award,
  TrendingUp,
  Settings,
  HelpCircle,
  LogOut,
  X,
  ShieldAlert,
  Code
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';
import { VerifiedBadge, OGBadge, TitleChip } from '../common/BadgePill';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const ProfileDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    currentUser,
    navigateTo,
    openUserProfile,
    setShowAndroidCodeExport,
    logout,
    isRTL,
    t
  } = useApp();

  if (!isDrawerOpen) return null;

  const xpPercent = Math.min(100, Math.round((currentUser.xp / currentUser.nextLevelXp) * 100));

  const menuItems = [
    {
      id: 'profile',
      icon: User,
      label: t.myProfile,
      onClick: () => {
        setIsDrawerOpen(false);
        openUserProfile(currentUser.id);
      }
    },
    {
      id: 'events',
      icon: Calendar,
      label: t.eventsMenu,
      onClick: () => {
        setIsDrawerOpen(false);
        navigateTo('events');
      }
    },
    {
      id: 'badges',
      icon: Award,
      label: t.medalsAndBadges,
      onClick: () => {
        setIsDrawerOpen(false);
        openUserProfile(currentUser.id);
      }
    },
    {
      id: 'levels',
      icon: TrendingUp,
      label: t.levelAndAchievements,
      onClick: () => {
        setIsDrawerOpen(false);
        openUserProfile(currentUser.id);
      }
    },
    {
      id: 'settings',
      icon: Settings,
      label: t.settingsMenu,
      onClick: () => {
        setIsDrawerOpen(false);
        navigateTo('settings');
      }
    },
    {
      id: 'help',
      icon: HelpCircle,
      label: t.helpAndSupport,
      onClick: () => {
        setIsDrawerOpen(false);
        navigateTo('settings');
      }
    }
  ];

  // If user is Admin or Owner, show Administrative Dashboard button
  const isStaff = currentUser.role === 'owner' || currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.role === 'senior_moderator';

  return (
    <div
      onClick={() => setIsDrawerOpen(false)}
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={e => e.stopPropagation()}
        className={`w-full max-w-[320px] h-full bg-[#121212] border-white/10 shadow-2xl flex flex-col justify-between p-5 overflow-y-auto ${
          isRTL ? 'border-r' : 'border-l'
        }`}
      >
        {/* Top Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Info card */}
          <div
            onClick={() => {
              setIsDrawerOpen(false);
              openUserProfile(currentUser.id);
            }}
            className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] cursor-pointer transition-colors"
          >
            <UserAvatar
              userId={currentUser.id}
              avatarUrl={currentUser.avatarUrl}
              name={currentUser.displayName}
              size="lg"
              clickable={false}
              borderStyle="gold"
              showOnline={true}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-white text-sm truncate">{currentUser.displayName}</span>
                {currentUser.isVerified && <VerifiedBadge size={14} />}
                {currentUser.isOG && <OGBadge />}
              </div>
              <span className="text-xs text-[#8E8E93] force-ltr block truncate">@{currentUser.username}</span>

              {/* Founder Title */}
              <div className="mt-1.5">
                <TitleChip
                  icon="👑"
                  text={t.founder}
                  color="gold"
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Navigation Links List */}
          <nav className="space-y-1 pt-2">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#EDEDED] hover:text-[#C5A46D] hover:bg-white/[0.04] active:scale-[0.99] transition-all text-start"
                >
                  <Icon size={19} strokeWidth={1.8} className="text-[#8E8E93]" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* In-App PWA Install Trigger */}
            <div className="py-1">
              <PWAInstallButton variant="menuItem" />
            </div>

            {/* Admin Dashboard trigger for staff */}
            {isStaff && (
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  navigateTo('admin_dashboard');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#C5A46D] bg-[#C5A46D]/10 hover:bg-[#C5A46D]/20 transition-all text-start border border-[#C5A46D]/20 mt-2"
              >
                <ShieldAlert size={19} strokeWidth={2} />
                <span>{t.adminDashboard}</span>
              </button>
            )}

            {/* Android Native Jetpack Compose Export & Architecture View */}
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                setShowAndroidCodeExport(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#A78BFA] hover:bg-[#8B5CF6]/10 transition-all text-start mt-1"
            >
              <Code size={17} strokeWidth={1.8} />
              <span>{t.androidArchitecture}</span>
            </button>
          </nav>
        </div>

        {/* Bottom Section: Log Out & Cosmic Nebula XP Card */}
        <div className="space-y-4 pt-4 border-t border-white/[0.08]">
          <button
            onClick={() => {
              setIsDrawerOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors text-start cursor-pointer"
          >
            <LogOut size={16} />
            <span>{t.logout}</span>
          </button>

          {/* Cosmic Nebula XP Card matching Screenshot 6 */}
          <div className="relative overflow-hidden rounded-2xl p-3.5 border border-[#8B5CF6]/30 shadow-[0_4px_24px_rgba(139,92,246,0.2)] bg-gradient-to-br from-[#1C0F38] via-[#100926] to-[#0A0515]">
            {/* Background subtle nebula noise or stars */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#8B5CF6]/20 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-[#C5A46D]/20 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center gap-1 text-[#DFCA98]">
                  <span>⭐</span>
                  <span>Lv.{currentUser.level}</span>
                </span>
                <span className="text-[11px] text-[#A78BFA] force-ltr">
                  EXP {currentUser.xp} / {currentUser.nextLevelXp}
                </span>
              </div>

              {/* Glowing progress bar */}
              <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#C5A46D] transition-all duration-500 shadow-[0_0_8px_rgba(197,164,109,0.5)]"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
