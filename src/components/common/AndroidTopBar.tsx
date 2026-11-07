/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, Bell, Wifi, BatteryMedium, Signal, ChevronRight, ChevronLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QLogo } from './QLogo';
import { UserAvatar } from './UserAvatar';

interface AndroidTopBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  onSearchClick?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

export const AndroidTopBar: React.FC<AndroidTopBarProps> = ({
  title,
  showBack = false,
  onBack,
  showSearch = false,
  onSearchClick,
  rightAction,
  transparent = false
}) => {
  const {
    currentUser,
    navigateTo,
    goBack,
    unreadNotificationsCount,
    setIsDrawerOpen,
    isRTL
  } = useApp();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      goBack();
    }
  };

  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  return (
    <header className={`sticky top-0 z-30 w-full transition-colors ${
      transparent ? 'bg-transparent' : 'bg-black/95 backdrop-blur-md border-b border-white/[0.06]'
    }`}>
      {/* Native Android Status Bar (9:41, Camera cutout, Signal, Wifi, Battery) */}
      <div className="flex items-center justify-between px-6 pt-2 pb-1 text-xs text-[#A8A8A8] select-none">
        <span className="font-semibold tracking-tight text-white force-ltr">9:41</span>
        
        {/* Subtle camera punch hole indicator */}
        <div className="w-3.5 h-3.5 rounded-full bg-black ring-1 ring-white/10 shrink-0 shadow-inner" />

        <div className="flex items-center gap-1.5 force-ltr">
          <Signal size={12} strokeWidth={2.2} />
          <Wifi size={12} strokeWidth={2.2} />
          <BatteryMedium size={14} strokeWidth={2.2} className="text-white" />
        </div>
      </div>

      {/* Main Top Bar Zone matching Screenshot 2 */}
      <div className="flex items-center justify-between px-4 h-12">
        {/* Left/Start Slot: Q Logo (on home) or Back Arrow (on sub-pages) or Search */}
        <div className="flex items-center gap-2 min-w-[40px]">
          {showBack ? (
            <button
              onClick={handleBack}
              aria-label="Back"
              className="w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-white/10 active:scale-95 transition-transform"
            >
              <BackIcon size={22} strokeWidth={2.4} />
            </button>
          ) : showSearch ? (
            <button
              onClick={onSearchClick}
              aria-label="Search"
              className="w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-white/10 active:scale-95 transition-transform"
            >
              <Search size={20} strokeWidth={2.2} />
            </button>
          ) : (
            <button
              onClick={() => navigateTo('home')}
              aria-label="Q Social Home"
              className="flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <QLogo size={28} withGlow={true} />
            </button>
          )}

          {title && (
            <h1 className="text-base font-bold text-white tracking-wide truncate max-w-[190px]">
              {title}
            </h1>
          )}
        </div>

        {/* Right Slot: Search, Notification Bell & Profile Avatar Drawer Trigger */}
        <div className="flex items-center justify-end gap-1.5 min-w-[40px]">
          {rightAction ? (
            rightAction
          ) : (
            <>
              {/* Search button */}
              <button
                onClick={() => navigateTo('discover')}
                aria-label="Search"
                className="w-9 h-9 flex items-center justify-center rounded-full text-white/90 hover:bg-white/10 active:scale-95 transition-transform"
              >
                <Search size={19} strokeWidth={2.2} />
              </button>

              {/* Notification Bell -> FULL SCREEN Notifications page */}
              <button
                onClick={() => navigateTo('notifications')}
                aria-label="Notifications"
                className="relative w-9 h-9 flex items-center justify-center rounded-full text-white/90 hover:bg-white/10 active:scale-95 transition-transform"
              >
                <Bell size={19} strokeWidth={2} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-[#C5A46D] ring-2 ring-black" />
                )}
              </button>

              {/* Avatar trigger -> Opens Profile Drawer */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                aria-label="Open Profile Menu"
                className="relative active:scale-95 transition-transform ms-1"
              >
                <UserAvatar
                  userId={currentUser.id}
                  avatarUrl={currentUser.avatarUrl}
                  name={currentUser.displayName}
                  size="sm"
                  clickable={false}
                  showOnline={true}
                  borderStyle="subtle"
                />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
