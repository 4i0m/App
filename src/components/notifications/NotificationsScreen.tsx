/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Heart,
  MessageCircle,
  UserPlus,
  Calendar,
  Sparkles,
  ShieldAlert,
  Settings,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AndroidTopBar } from '../common/AndroidTopBar';
import { UserAvatar } from '../common/UserAvatar';
import { NotificationType } from '../../types';

export const NotificationsScreen: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    navigateTo,
    openUserProfile,
    openConversation,
    goBack,
    t
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | NotificationType>('all');

  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'comment' && (notif.type === 'comment' || notif.type === 'like')) return true;
    return notif.type === activeFilter;
  });

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'follow':
        return <UserPlus size={14} className="text-[#1D9BF0]" />;
      case 'like':
        return <Heart size={14} className="text-[#FF3040]" fill="#FF3040" />;
      case 'comment':
        return <MessageCircle size={14} className="text-emerald-400" />;
      case 'message':
        return <MessageSquare size={14} className="text-purple-400" />;
      case 'event':
        return <Calendar size={14} className="text-[#C5A46D]" />;
      case 'achievement':
        return <Sparkles size={14} className="text-amber-400" />;
      case 'admin':
        return <ShieldAlert size={14} className="text-rose-400" />;
      default:
        return <Bell size={14} className="text-white" />;
    }
  };

  const handleNotificationClick = (notif: any) => {
    markNotificationRead(notif.id);

    // Deep link routing based on notification type
    switch (notif.type) {
      case 'follow':
        if (notif.targetId) openUserProfile(notif.targetId);
        break;
      case 'like':
      case 'comment':
        // Navigate to home feed
        navigateTo('home');
        break;
      case 'message':
        if (notif.targetId) openConversation(notif.targetId);
        else navigateTo('inbox');
        break;
      case 'event':
        navigateTo('events', { eventId: notif.targetId });
        break;
      case 'achievement':
        openUserProfile(notif.actorId);
        break;
      case 'admin':
        navigateTo('settings');
        break;
      default:
        break;
    }
  };

  const filterTabs: { id: 'all' | NotificationType; label: string }[] = [
    { id: 'all', label: t.filterAll },
    { id: 'follow', label: t.filterFollows },
    { id: 'comment', label: t.filterInteractions },
    { id: 'message', label: t.filterMessages },
    { id: 'event', label: t.filterEvents },
    { id: 'achievement', label: t.filterAchievements },
    { id: 'admin', label: t.filterAdmin }
  ];

  return (
    <div className="pb-24 max-w-md mx-auto w-full min-h-screen bg-black">
      {/* 1. Full-screen Top Bar with Back & Mark All Read */}
      <AndroidTopBar
        title={t.notificationsTitle}
        showBack={true}
        onBack={goBack}
        rightAction={
          <div className="flex items-center gap-1">
            <button
              onClick={markAllNotificationsRead}
              className="p-2 text-[#C5A46D] hover:bg-white/10 rounded-full text-xs font-semibold flex items-center gap-1 active:scale-95"
              title={t.markAllRead}
            >
              <CheckCheck size={17} />
            </button>
            <button
              onClick={() => navigateTo('settings')}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
              title="إعدادات الإشعارات"
            >
              <Settings size={18} />
            </button>
          </div>
        }
      />

      {/* 2. Notification Filters Bar */}
      <div className="sticky top-12 z-20 flex items-center gap-1.5 p-3 overflow-x-auto no-scrollbar border-b border-white/[0.08] bg-black/95 backdrop-blur-md">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all ${
              activeFilter === tab.id
                ? 'bg-[#C5A46D] text-black font-bold shadow-[0_0_8px_rgba(197,164,109,0.3)]'
                : 'bg-white/[0.04] text-[#A8A8A8] border border-white/[0.06] hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Notifications List */}
      <main className="divide-y divide-white/[0.06]">
        {filteredNotifications.length === 0 ? (
          <div className="py-24 text-center px-6 space-y-2">
            <Bell size={36} className="mx-auto text-white/20 mb-2" />
            <p className="text-white text-sm font-semibold">{t.noNotifications}</p>
            <p className="text-xs text-[#8E8E93]">ستظهر هنا إشعارات المتابعات، التفاعلات، والمشاركات فور حدوثها.</p>
          </div>
        ) : (
          filteredNotifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`flex items-start gap-3.5 p-4 transition-colors cursor-pointer hover:bg-white/[0.02] ${
                !notif.isRead ? 'bg-[#1C160C]/25 border-s-2 border-s-[#C5A46D]' : ''
              }`}
            >
              {/* Actor Avatar with Type Badge overlay */}
              <div className="relative shrink-0">
                <UserAvatar
                  userId={notif.actorId}
                  avatarUrl={notif.actorAvatar}
                  name={notif.actorName}
                  size="md"
                  clickable={false}
                />
                <span className="absolute -bottom-1 -end-1 w-5 h-5 rounded-full bg-black ring-2 ring-black flex items-center justify-center shadow">
                  {getIconForType(notif.type)}
                </span>
              </div>

              {/* Notification Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#EDEDED] leading-relaxed">
                  <span className="font-bold text-white hover:underline me-1">
                    {notif.actorName}
                  </span>
                  {notif.content}
                </p>

                {/* Optional target preview snippet */}
                {notif.targetPreview && (
                  <div className="mt-1.5 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-[#A8A8A8] truncate">
                    "{notif.targetPreview}"
                  </div>
                )}

                <span className="text-[10px] text-[#8E8E93] block mt-1.5 force-ltr">
                  {notif.timestamp}
                </span>
              </div>

              {/* Unread dot */}
              {!notif.isRead && (
                <span className="w-2 h-2 rounded-full bg-[#C5A46D] shrink-0 mt-1 shadow-[0_0_6px_rgba(197,164,109,0.5)]" />
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
};
