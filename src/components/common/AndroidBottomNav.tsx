/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Compass, Plus, MessageSquare, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AndroidBottomNav: React.FC = () => {
  const {
    activeTab,
    navigateTo,
    currentUser,
    setIsCreatePostOpen,
    unreadMessagesCount,
    t
  } = useApp();

  const isHomeActive = activeTab === 'home';
  const isDiscoverActive = activeTab === 'discover';
  const isInboxActive = activeTab === 'inbox';
  const isProfileActive = activeTab === 'profile';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto pointer-events-none">
      <div className="pointer-events-auto mx-4 mb-3 rounded-2xl bg-[#121212]/95 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.8)] px-2 py-1.5 flex items-center justify-around">
        {/* 1. Home */}
        <button
          onClick={() => navigateTo('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] rounded-xl transition-all ${
            isHomeActive ? 'text-[#C5A46D]' : 'text-[#8E8E93] hover:text-white'
          }`}
          aria-label={t.home}
        >
          <Home size={22} strokeWidth={isHomeActive ? 2.4 : 1.8} />
          <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${isHomeActive ? 'font-semibold text-[#C5A46D]' : ''}`}>
            {t.home}
          </span>
        </button>

        {/* 2. Discover */}
        <button
          onClick={() => navigateTo('discover')}
          className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] rounded-xl transition-all ${
            isDiscoverActive ? 'text-[#C5A46D]' : 'text-[#8E8E93] hover:text-white'
          }`}
          aria-label={t.discover}
        >
          <Compass size={22} strokeWidth={isDiscoverActive ? 2.4 : 1.8} />
          <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${isDiscoverActive ? 'font-semibold text-[#C5A46D]' : ''}`}>
            {t.discover}
          </span>
        </button>

        {/* 3. Central Emphasized Create Action */}
        <div className="flex items-center justify-center px-1">
          <button
            onClick={() => setIsCreatePostOpen(true)}
            aria-label={t.create}
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#9C7E45] via-[#C5A46D] to-[#DFCA98] text-black flex items-center justify-center shadow-[0_0_16px_rgba(197,164,109,0.35)] active:scale-90 hover:scale-105 transition-transform"
          >
            <Plus size={24} strokeWidth={2.8} />
          </button>
        </div>

        {/* 4. Inbox (Always opens unified messaging hub) */}
        <button
          onClick={() => navigateTo('inbox', { conversationId: undefined })}
          className={`relative flex flex-col items-center justify-center py-1 px-3 min-w-[56px] rounded-xl transition-all ${
            isInboxActive ? 'text-[#C5A46D]' : 'text-[#8E8E93] hover:text-white'
          }`}
          aria-label={t.inbox}
        >
          <div className="relative">
            <MessageSquare size={22} strokeWidth={isInboxActive ? 2.4 : 1.8} />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#1D9BF0] text-white text-[9px] font-bold flex items-center justify-center">
                {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${isInboxActive ? 'font-semibold text-[#C5A46D]' : ''}`}>
            {t.inbox}
          </span>
        </button>

        {/* 5. Profile */}
        <button
          onClick={() => navigateTo('profile', { userId: currentUser.id })}
          className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] rounded-xl transition-all ${
            isProfileActive ? 'text-[#C5A46D]' : 'text-[#8E8E93] hover:text-white'
          }`}
          aria-label={t.profile}
        >
          <User size={22} strokeWidth={isProfileActive ? 2.4 : 1.8} />
          <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${isProfileActive ? 'font-semibold text-[#C5A46D]' : ''}`}>
            {t.profile}
          </span>
        </button>
      </div>
    </nav>
  );
};
