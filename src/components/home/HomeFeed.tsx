/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Plus, Megaphone, Sparkles, ExternalLink, ArrowRight, MessageSquarePlus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PostCard } from '../common/PostCard';

export const HomeFeed: React.FC = () => {
  const {
    posts,
    stories,
    setActiveStory,
    addStory,
    currentUser,
    isFollowing,
    platformSettings,
    announcements,
    setIsCreatePostOpen,
    t
  } = useApp();

  const [activeFeedTab, setActiveFeedTab] = useState<'for_you' | 'following' | 'trending'>('for_you');
  const storyFileInputRef = useRef<HTMLInputElement>(null);

  // Filter posts according to active feed tab
  const displayedPosts = posts.filter(post => {
    if (activeFeedTab === 'following') {
      return isFollowing(post.authorId) || post.authorId === currentUser.id;
    }
    if (activeFeedTab === 'trending') {
      return post.likesCount > 1000 || post.repostsCount > 100;
    }
    return true; // For You shows all global posts
  });

  const activeAnnouncements = announcements.filter(a => a.isActive);
  const welcomeBanner = platformSettings?.welcomeBanner;

  const handleStoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        addStory('image', event.target!.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="pb-24 max-w-md mx-auto w-full">
      {/* 1. Stories Carousel */}
      <section className="py-3 px-4 border-b border-white/[0.08] bg-black">
        <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1">
          {/* Add Story Button (+ إنشاء قصة) */}
          <input
            type="file"
            ref={storyFileInputRef}
            onChange={handleStoryUpload}
            accept="image/*"
            className="hidden"
          />
          <div
            onClick={() => storyFileInputRef.current?.click()}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group select-none"
          >
            <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-[#C5A46D]/50 flex items-center justify-center p-1 group-hover:border-[#C5A46D] transition-colors bg-[#121212]">
              <div className="w-full h-full rounded-full overflow-hidden opacity-75">
                <img
                  src={currentUser.avatarUrl}
                  alt="Add story"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute bottom-0 end-0 w-5 h-5 rounded-full bg-[#C5A46D] text-black font-bold flex items-center justify-center shadow-md">
                <Plus size={13} strokeWidth={3} />
              </span>
            </div>
            <span className="text-[11px] text-[#A8A8A8] group-hover:text-white transition-colors truncate max-w-[68px]">
              {t.addStory}
            </span>
          </div>

          {/* Stories List */}
          {stories.map(story => {
            const isLive = story.isLive;
            return (
              <div
                key={story.id}
                onClick={() => setActiveStory(story)}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group select-none"
              >
                <div
                  className={`w-16 h-16 rounded-full p-[2.5px] transition-transform duration-200 group-hover:scale-105 ${
                    isLive
                      ? 'bg-gradient-to-tr from-red-600 via-rose-500 to-orange-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                      : story.hasUnseenStory
                      ? 'bg-gradient-to-tr from-[#9C7E45] via-[#C5A46D] to-[#DFCA98]'
                      : 'bg-white/20'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-black p-[2px]">
                    <img
                      src={story.authorAvatar}
                      alt={story.authorName}
                      className="w-full h-full object-cover rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                <span className="text-[11px] text-[#EDEDED] font-medium truncate max-w-[68px]">
                  {story.authorName}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Welcome Banner (Managed live by Owner in Firestore) */}
      {welcomeBanner && welcomeBanner.enabled && (
        <section className="p-4 border-b border-[#C5A46D]/20 bg-gradient-to-br from-[#1A1813] via-[#0E0E0E] to-black relative overflow-hidden">
          <div className="absolute top-0 end-0 w-32 h-32 bg-[#C5A46D]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C5A46D]/30 to-[#9C7E45]/10 border border-[#C5A46D]/40 flex items-center justify-center shrink-0 text-[#C5A46D]">
              <Sparkles size={20} />
            </div>
            <div className="flex-1">
              <h2 className="text-white font-bold text-sm tracking-wide flex items-center gap-1.5">
                {welcomeBanner.title || 'مرحباً بك في Q'}
              </h2>
              <p className="text-xs text-[#B5B5B5] mt-1 leading-relaxed whitespace-pre-line">
                {welcomeBanner.message || 'مجتمعك الجديد للتواصل الراقي والمشاركة الحقيقية.'}
              </p>
              {welcomeBanner.imageUrl && (
                <div className="mt-3 rounded-lg overflow-hidden border border-white/10 max-h-48">
                  <img
                    src={welcomeBanner.imageUrl}
                    alt="Welcome Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. In-App Announcements & Ads Carousel / Stack */}
      {activeAnnouncements.length > 0 && (
        <section className="px-4 py-3 space-y-2.5 bg-black border-b border-white/[0.08]">
          {activeAnnouncements.map(ann => (
            <div
              key={ann.id}
              className="p-3.5 rounded-xl bg-[#141414] border border-[#C5A46D]/25 hover:border-[#C5A46D]/50 transition-all relative group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#C5A46D]/15 text-[#C5A46D] border border-[#C5A46D]/30">
                  <Megaphone size={10} />
                  {ann.type === 'banner' ? 'إعلان مميز' : 'إعلان رسمي'}
                </span>
                <span className="text-[10px] text-white/40">
                  {new Date(ann.timestamp).toLocaleDateString('ar-EG')}
                </span>
              </div>

              <h3 className="text-white text-xs font-bold leading-snug">{ann.title}</h3>
              <p className="text-[11px] text-[#A8A8A8] mt-1 leading-relaxed">{ann.content}</p>

              {ann.imageUrl && (
                <div className="mt-2.5 rounded-lg overflow-hidden border border-white/10">
                  <img
                    src={ann.imageUrl}
                    alt={ann.title}
                    className="w-full h-36 object-cover"
                  />
                </div>
              )}

              {ann.actionUrl && (
                <div className="mt-3 pt-2 border-t border-white/5 flex justify-end">
                  <a
                    href={ann.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C5A46D] text-black text-xs font-bold hover:bg-[#d8b57b] transition-colors shadow-sm"
                  >
                    <span>{ann.actionText || 'عرض التفاصيل'}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* 4. Feed Tabs (لك / المتابعون) */}
      <div className="sticky top-12 z-20 flex items-center justify-around border-b border-white/[0.08] bg-black/95 backdrop-blur-md px-4">
        <button
          onClick={() => setActiveFeedTab('for_you')}
          className={`py-3 text-sm font-semibold relative transition-colors ${
            activeFeedTab === 'for_you' ? 'text-white' : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <span>{t.forYou}</span>
          {activeFeedTab === 'for_you' && (
            <span className="absolute bottom-0 start-0 end-0 h-[2.5px] bg-[#C5A46D] rounded-t-full shadow-[0_0_8px_rgba(197,164,109,0.5)]" />
          )}
        </button>

        <button
          onClick={() => setActiveFeedTab('following')}
          className={`py-3 text-sm font-semibold relative transition-colors ${
            activeFeedTab === 'following' ? 'text-white' : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <span>المتابعون</span>
          {activeFeedTab === 'following' && (
            <span className="absolute bottom-0 start-0 end-0 h-[2.5px] bg-[#C5A46D] rounded-t-full shadow-[0_0_8px_rgba(197,164,109,0.5)]" />
          )}
        </button>
      </div>

      {/* 5. Posts Stream */}
      <main className="divide-y divide-white/[0.08]">
        {displayedPosts.length === 0 ? (
          <div className="py-24 text-center px-6 space-y-4 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1E1E1E] to-[#121212] border border-[#C5A46D]/30 flex items-center justify-center text-[#C5A46D] shadow-[0_0_20px_rgba(197,164,109,0.15)]">
              <MessageSquarePlus size={28} />
            </div>
            <div className="space-y-1.5 max-w-xs">
              <h3 className="text-white font-bold text-base">لا توجد منشورات حتى الآن</h3>
              <p className="text-xs text-[#8E8E93] leading-relaxed">
                كن أول من يشارك شيئاً ملهمًا مع مجتمع Q
              </p>
            </div>
            <button
              onClick={() => setIsCreatePostOpen(true)}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#9C7E45] via-[#C5A46D] to-[#DFCA98] text-black font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus size={15} strokeWidth={3} />
              <span>نشر أول منشور</span>
            </button>
          </div>
        ) : (
          displayedPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </main>
    </div>
  );
};

