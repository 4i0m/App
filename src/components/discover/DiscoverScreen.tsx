/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Flame, Users, Sparkles, X, UserPlus, UserCheck, SlidersHorizontal, Trophy, ArrowRight, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AndroidTopBar } from '../common/AndroidTopBar';
import { UserAvatar } from '../common/UserAvatar';
import { VerifiedBadge, OGBadge } from '../common/BadgePill';
import { PostCard } from '../common/PostCard';

export const DiscoverScreen: React.FC = () => {
  const {
    allUsers,
    posts,
    currentUserId,
    isFollowing,
    toggleFollow,
    openUserProfile,
    navigateTo,
    setSelectedEventId,
    events,
    t
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  const trendingTags = [
    'الذكاء_الاصطناعي',
    'التقنية',
    'القراءة',
    'الألعاب',
    'التصميم',
    'الأنمي'
  ];

  // Search Results filtering
  const matchingUsers = Object.values(allUsers).filter(u =>
    searchQuery && (
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.bio && u.bio.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  const matchingPosts = posts.filter(p => {
    if (!searchQuery) return false;
    return (
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const suggestedUsers = Object.values(allUsers)
    .filter(u => u.id !== currentUserId && u.status === 'active')
    .slice(0, 6);

  const upcomingEvent = events[0];

  return (
    <div className="pb-28 max-w-md mx-auto w-full min-h-screen bg-black text-white select-none">
      {/* 1. Top Bar matching Screenshot 5 */}
      <AndroidTopBar
        title={t.discover}
        showSearch={true}
        onSearchClick={() => {}}
        rightAction={
          <button className="w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
            <SlidersHorizontal size={18} />
          </button>
        }
      />

      {/* 2. Search Input */}
      <div className="px-4 py-2">
        <div className="relative flex items-center">
          <Search size={17} className="absolute start-3.5 text-[#8E8E93] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث عن أصدقاء، منشورات، أو هاشتاغات..."
            className="w-full bg-[#141414] border border-white/10 rounded-2xl ps-10 pe-9 py-2.5 text-xs text-white placeholder-white/35 focus:outline-none focus:border-[#C5A46D] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute end-3 text-white/50 hover:text-white"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Search results mode */}
      {searchQuery ? (
        <div className="p-4 space-y-6">
          <div>
            <span className="text-xs font-bold text-white mb-3 block">المستخدمون ({matchingUsers.length})</span>
            {matchingUsers.length === 0 ? (
              <p className="text-xs text-[#8E8E93]">لم يتم العثور على مستخدمين يطابقون البحث.</p>
            ) : (
              <div className="space-y-2">
                {matchingUsers.map(user => (
                  <div
                    key={user.id}
                    onClick={() => openUserProfile(user.id)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#141414] border border-white/[0.06] hover:bg-white/[0.04] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        userId={user.id}
                        avatarUrl={user.avatarUrl}
                        name={user.displayName}
                        size="md"
                        clickable={false}
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-white text-xs">{user.displayName}</span>
                          {user.isVerified && <VerifiedBadge size={13} category={user.verificationCategory} />}
                        </div>
                        <span className="text-[11px] text-[#8E8E93] force-ltr block">@{user.username}</span>
                      </div>
                    </div>

                    {user.id !== currentUserId && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleFollow(user.id);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-transform active:scale-95 ${
                          isFollowing(user.id)
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'bg-[#C5A46D] text-black'
                        }`}
                      >
                        {isFollowing(user.id) ? t.unfollow : t.follow}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className="text-xs font-bold text-white mb-3 block">المنشورات ({matchingPosts.length})</span>
            {matchingPosts.length === 0 ? (
              <p className="text-xs text-[#8E8E93]">لا توجد منشورات مطابقة للبحث.</p>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {matchingPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Default Discovery matching Screenshot 5 */
        <div className="p-4 space-y-5">
          {/* Section 1: المواضيع الرائجة (Trending Topics) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>المواضيع الرائجة</span>
              </span>
              <button className="text-[11px] text-[#8E8E93] hover:text-[#C5A46D] transition-colors">
                عرض الكل &gt;
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {trendingTags.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => setSearchQuery(tag)}
                  className="px-3.5 py-1.5 rounded-full bg-[#141414] border border-white/[0.08] text-xs text-[#EDEDED] hover:border-[#C5A46D] hover:text-[#C5A46D] transition-all force-ltr active:scale-95 shrink-0"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: مقترحون لك (Suggested for you) matching Screenshot 5 */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">مقترحون لك</span>
              <button className="text-[11px] text-[#8E8E93] hover:text-[#C5A46D] transition-colors">
                عرض الكل &gt;
              </button>
            </div>

            {/* 3 User Cards in a row matching Screenshot 5 */}
            <div className="grid grid-cols-3 gap-2.5">
              {suggestedUsers.map(user => {
                const following = isFollowing(user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => openUserProfile(user.id)}
                    className="p-3 rounded-2xl bg-[#141414] border border-white/[0.08] flex flex-col items-center text-center cursor-pointer hover:border-[#C5A46D]/40 transition-all group"
                  >
                    <div className="relative mb-2">
                      <div className="w-14 h-14 rounded-full p-[1.5px] bg-gradient-to-tr from-[#9C7E45] to-[#DFCA98]">
                        <img
                          src={user.avatarUrl}
                          alt={user.displayName}
                          className="w-full h-full object-cover rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    <span className="font-bold text-white text-xs truncate max-w-full block">
                      {user.displayName}
                    </span>
                    <span className="text-[10px] text-[#8E8E93] force-ltr block mb-2.5 truncate max-w-full">
                      @{user.username}
                    </span>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleFollow(user.id);
                      }}
                      className={`w-full py-1 rounded-full text-[11px] font-bold transition-all active:scale-95 ${
                        following
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'bg-[#C5A46D] text-black shadow-sm'
                      }`}
                    >
                      {following ? t.unfollow : t.follow}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: فعاليات قادمة (Upcoming Events Card) matching Screenshot 5 */}
          <div className="space-y-2.5 pt-1">
            <span className="text-xs font-bold text-white block">فعاليات قادمة</span>

            {upcomingEvent && (
              <div
                onClick={() => {
                  setSelectedEventId(upcomingEvent.id);
                  navigateTo('events');
                }}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-[#1E1911] via-[#161410] to-[#121212] border border-[#C5A46D]/30 flex items-center justify-between cursor-pointer hover:border-[#C5A46D]/60 transition-all shadow-lg group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#C5A46D]/20 border border-[#C5A46D]/40 flex items-center justify-center text-[#DFCA98] shrink-0">
                    <Trophy size={22} className="text-[#C5A46D]" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block group-hover:text-[#DFCA98] transition-colors">
                      {upcomingEvent.title}
                    </span>
                    <span className="text-[11px] text-[#A8A8A8] block mt-0.5">
                      {upcomingEvent.dateStr} · {upcomingEvent.timeStr}
                    </span>
                  </div>
                </div>

                <div className="text-[#C5A46D] text-xs font-semibold flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform">
                  <span>تفاصيل</span>
                  <ArrowRight size={14} className="rtl:rotate-180" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
