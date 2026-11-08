/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  MoreVertical,
  MoreHorizontal,
  MessageSquare,
  Phone,
  UserPlus,
  UserCheck,
  Flag,
  Ban,
  MapPin,
  Calendar,
  Sparkles,
  Shield,
  ShieldAlert,
  Award,
  Crown,
  Share2,
  ExternalLink,
  Pin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AndroidTopBar } from '../common/AndroidTopBar';
import { VerifiedBadge, OGBadge, TitleChip, LevelBadge } from '../common/BadgePill';
import { PostCard } from '../common/PostCard';
import { UserProfile } from '../../types';

export const UserProfileScreen: React.FC = () => {
  const {
    viewingUser,
    currentUserId,
    currentUser,
    isFollowing,
    toggleFollow,
    startDirectMessageWith,
    startVoiceCall,
    navigateTo,
    goBack,
    openReportModal,
    openAdminProfileMenu,
    isStaff,
    hasPermission,
    toggleBlockUser,
    blockedUserIds,
    posts,
    setVerificationDetailUser,
    setLevelDetailUser,
    language,
    t
  } = useApp();

  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'about'>('posts');
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);
  const [showMemberOptionsMenu, setShowMemberOptionsMenu] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const isMe = viewingUser.id === currentUserId;
  const isUserBlocked = blockedUserIds.includes(viewingUser.id);
  const following = isFollowing(viewingUser.id);
  const userIsStaff = isStaff();

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/?user=${viewingUser.username}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${viewingUser.displayName} (@${viewingUser.username}) | Q`,
          text: `Check out ${viewingUser.displayName}'s profile on Q Social Network`,
          url: profileUrl,
        });
        setShareFeedback(language === 'en' ? 'Profile shared' : 'تمت المشاركة بنجاح');
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(profileUrl);
      setShareFeedback(language === 'en' ? 'Profile link copied' : 'تم نسخ رابط الملف الشخصي');
    }
    setShowMemberOptionsMenu(false);
    setTimeout(() => setShareFeedback(null), 2500);
  };

  // User's own posts
  const userPosts = posts.filter(p => p.authorId === viewingUser.id && !p.isHidden);
  const userMediaPosts = userPosts.filter(p => p.mediaUrls && p.mediaUrls.length > 0);

  return (
    <div className="pb-28 max-w-md mx-auto w-full min-h-screen bg-black text-white select-none relative">
      {/* Share feedback toast */}
      {shareFeedback && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#121212] border border-[#C5A46D]/60 text-[#DFCA98] px-4 py-2 rounded-full text-xs shadow-2xl flex items-center gap-2 backdrop-blur-md animate-in fade-in">
          <Share2 size={13} className="text-[#C5A46D]" />
          <span>{shareFeedback}</span>
        </div>
      )}

      {/* 1. Profile Top Bar with Back & Context Actions matching Screenshot 3 */}
      <AndroidTopBar
        showBack={true}
        onBack={goBack}
        transparent={true}
        rightAction={
          <div className="flex items-center gap-2">
            {isMe ? (
              <>
                {/* Share own profile */}
                <button
                  onClick={handleShareProfile}
                  aria-label="Share profile"
                  className="w-9 h-9 flex items-center justify-center rounded-full text-white bg-white/10 hover:bg-white/20 active:scale-95 transition-all"
                  title="مشاركة حسابي"
                >
                  <Share2 size={16} />
                </button>

                {/* Edit Profile Button -> Opens FULL SCREEN Profile Editor */}
                <button
                  onClick={() => navigateTo('profile_editor')}
                  className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-white/10 hover:bg-white/20 active:scale-95 transition-all border border-white/15"
                >
                  {t.editProfile}
                </button>

                {/* Settings Cog */}
                <button
                  onClick={() => navigateTo('settings')}
                  aria-label="Settings"
                  className="w-9 h-9 flex items-center justify-center rounded-full text-white bg-white/10 hover:bg-white/20 active:scale-95 transition-all"
                >
                  <Settings size={18} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                {/* 3-Dot Staff Administration Menu Trigger (Visible only to authorized staff) */}
                {userIsStaff && (
                  <button
                    onClick={() => openAdminProfileMenu(viewingUser)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#C5A46D]/20 text-[#DFCA98] hover:bg-[#C5A46D]/30 border border-[#C5A46D]/40 transition-all"
                    title="قائمة إجراءات المشرف"
                  >
                    <MoreVertical size={16} />
                  </button>
                )}

                {/* General Options (Share, Report, Block) */}
                <div className="relative">
                  <button
                    onClick={() => setShowMemberOptionsMenu(!showMemberOptionsMenu)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                  >
                    <MoreHorizontal size={18} />
                  </button>

                  {showMemberOptionsMenu && (
                    <div className="absolute top-10 ltr:right-0 rtl:left-0 z-30 w-44 rounded-2xl bg-[#191919] border border-white/10 shadow-2xl py-1 text-xs text-white">
                      <button
                        onClick={handleShareProfile}
                        className="w-full px-3 py-2 text-start flex items-center gap-2 text-white hover:bg-white/10"
                      >
                        <Share2 size={14} className="text-[#C5A46D]" />
                        <span>مشاركة الملف</span>
                      </button>

                      <button
                        onClick={() => {
                          openReportModal({
                            type: 'user',
                            id: viewingUser.id,
                            title: `@${viewingUser.username} (${viewingUser.displayName})`,
                            authorId: viewingUser.id,
                            authorName: viewingUser.displayName
                          });
                          setShowMemberOptionsMenu(false);
                        }}
                        className="w-full px-3 py-2 text-start flex items-center gap-2 text-amber-400 hover:bg-white/10 border-t border-white/10"
                      >
                        <Flag size={14} />
                        <span>{t.report}</span>
                      </button>

                      <button
                        onClick={() => {
                          toggleBlockUser(viewingUser.id);
                          setShowMemberOptionsMenu(false);
                        }}
                        className="w-full px-3 py-2 text-start flex items-center gap-2 text-red-400 hover:bg-white/10 border-t border-white/10"
                      >
                        <Ban size={14} />
                        <span>{isUserBlocked ? t.unblock : t.block}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        }
      />

      {/* 2. Cover Photo matching Screenshot 3 */}
      <div className="relative w-full h-44 bg-[#121212] overflow-hidden -mt-16">
        <img
          src={viewingUser.coverUrl}
          alt="Cover photo"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />
      </div>

      {/* 3. Avatar Overlapping & Identity Header matching Screenshot 3 */}
      <div className="relative px-5 pt-0 -mt-14">
        {/* Avatar with thick gold ring & action buttons */}
        <div className="flex items-end justify-between">
          <div className="relative">
            <div className="w-24 h-24 rounded-full p-[2.5px] bg-gradient-to-tr from-[#9C7E45] via-[#C5A46D] to-[#DFCA98] shadow-[0_0_24px_rgba(197,164,109,0.35)]">
              <div className="w-full h-full rounded-full overflow-hidden bg-black p-[2px]">
                <img
                  src={viewingUser.avatarUrl}
                  alt={viewingUser.displayName}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            {(() => {
              const isViewingUserOnline = Boolean(viewingUser.isOnline) && (
                !viewingUser.lastSeen || (Date.now() - new Date(viewingUser.lastSeen).getTime() < 3 * 60 * 1000)
              );
              return isViewingUserOnline ? (
                <span className="absolute bottom-1 end-1 w-4 h-4 rounded-full bg-[#10B981] ring-3 ring-black shadow-md animate-pulse" title="متصل الآن" />
              ) : null;
            })()}
          </div>

          {/* Action buttons (Follow & Message & Call) positioned next to avatar */}
          <div className="flex items-center gap-2 mb-2">
            {!isMe && (
              <>
                <button
                  onClick={() => startVoiceCall(viewingUser.id, viewingUser.displayName, viewingUser.avatarUrl)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-[#C5A46D]/15 text-[#C5A46D] border border-[#C5A46D]/30 hover:bg-[#C5A46D]/25 active:scale-95 transition-all"
                  title="مكالمة صوتية WebRTC"
                >
                  <Phone size={14} />
                </button>

                <button
                  onClick={() => startDirectMessageWith(viewingUser.id)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#181818] text-white border border-white/15 hover:bg-white/15 active:scale-95 transition-all"
                >
                  {t.message}
                </button>

                <button
                  onClick={() => toggleFollow(viewingUser.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                    following
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'bg-gradient-to-r from-[#DFCA98] to-[#C5A46D] text-black shadow-[0_0_12px_rgba(197,164,109,0.3)]'
                  }`}
                >
                  {following ? t.unfollow : t.follow}
                </button>
              </>
            )}

            {isMe && userIsStaff && (
              <button
                onClick={() => navigateTo('admin_dashboard')}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#C5A46D]/20 text-[#DFCA98] border border-[#C5A46D]/40 hover:bg-[#C5A46D]/30 transition-all flex items-center gap-1.5"
              >
                <Crown size={13} />
                <span>لوحة الإدارة</span>
              </button>
            )}
          </div>
        </div>

        {/* Display Name & Verification Badges */}
        <div className="mt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-white tracking-tight">{viewingUser.displayName}</h2>
            {viewingUser.isVerified && (
              <button
                onClick={() => setVerificationDetailUser(viewingUser)}
                className="focus:outline-none"
                title="اضغط لعرض تفاصيل التوثيق الرسمي"
              >
                <VerifiedBadge size={18} category={viewingUser.verificationCategory} />
              </button>
            )}
            {viewingUser.isOG && <OGBadge />}
          </div>

          <p className="text-xs text-[#8E8E93] force-ltr mt-0.5 font-medium">@{viewingUser.username}</p>
        </div>

        {/* Identity Badges / Titles Chips Row matching Screenshot 3: [ 👑 المؤسس ] [ 🔮 مميز ] [ 🛡️ Lv.24 ] */}
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          {viewingUser.titles
            .filter(t => t.isDisplayed)
            .map(title => (
              <TitleChip
                key={title.id}
                icon={title.icon}
                text={title.textAr}
                color={title.color as any}
                size="sm"
              />
            ))}

          {/* Level Badge with clickable details */}
          <div onClick={() => setLevelDetailUser(viewingUser)} className="cursor-pointer">
            <LevelBadge level={viewingUser.level} size="sm" />
          </div>
        </div>

        {/* Bio */}
        {viewingUser.bio && (
          <p className="mt-3 text-xs text-[#D8D8D8] leading-relaxed">
            {viewingUser.bio}
          </p>
        )}

        {/* Stats Row matching Screenshot 3: 18 متابعة | 4.2K متابع | 128 منشور */}
        <div className="grid grid-cols-3 gap-2 py-3.5 mt-3 border-y border-white/[0.08] text-center">
          <div>
            <span className="block text-base font-bold text-white force-ltr">
              {viewingUser.stats.postsCount}
            </span>
            <span className="text-[11px] text-[#8E8E93]">{t.posts}</span>
          </div>

          <div>
            <span className="block text-base font-bold text-white force-ltr">
              {viewingUser.stats.followersCount >= 1000 
                ? (viewingUser.stats.followersCount / 1000).toFixed(1) + 'K' 
                : viewingUser.stats.followersCount}
            </span>
            <span className="text-[11px] text-[#8E8E93]">{t.followers}</span>
          </div>

          <div>
            <span className="block text-base font-bold text-white force-ltr">
              {viewingUser.stats.followingCount}
            </span>
            <span className="text-[11px] text-[#8E8E93]">{t.following}</span>
          </div>
        </div>

        {/* 4. Achievements / Medals Row matching Screenshot 3 */}
        <div className="py-3 text-start">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#C5A46D]" />
              <span>{t.achievements}</span>
            </span>
            <button
              onClick={() => setSelectedBadge(viewingUser.badges[0])}
              className="text-[11px] text-[#C5A46D] hover:underline"
            >
              عرض الكل ←
            </button>
          </div>

          {/* Row of metallic medals */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
            {viewingUser.badges.map(badge => (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#191919] to-[#252525] border border-[#C5A46D]/40 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform shadow-[0_0_10px_rgba(197,164,109,0.2)] shrink-0"
                title={badge.nameAr}
              >
                <span className="text-xl">{badge.icon}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Sub-tabs matching Screenshot 3: المنشورات | الوسائط | حول */}
      <div className="sticky top-12 z-20 flex items-center justify-around border-y border-white/[0.08] bg-black/95 backdrop-blur-md px-4 mt-2">
        <button
          onClick={() => setActiveTab('posts')}
          className={`py-3 text-xs font-semibold relative transition-colors ${
            activeTab === 'posts' ? 'text-white' : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <span>{t.posts}</span>
          {activeTab === 'posts' && (
            <span className="absolute bottom-0 start-0 end-0 h-[2.5px] bg-[#C5A46D] rounded-t-full shadow-[0_0_8px_rgba(197,164,109,0.5)]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`py-3 text-xs font-semibold relative transition-colors ${
            activeTab === 'media' ? 'text-white' : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <span>{t.media}</span>
          {activeTab === 'media' && (
            <span className="absolute bottom-0 start-0 end-0 h-[2.5px] bg-[#C5A46D] rounded-t-full shadow-[0_0_8px_rgba(197,164,109,0.5)]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`py-3 text-xs font-semibold relative transition-colors ${
            activeTab === 'about' ? 'text-white' : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <span>{t.aboutTab}</span>
          {activeTab === 'about' && (
            <span className="absolute bottom-0 start-0 end-0 h-[2.5px] bg-[#C5A46D] rounded-t-full shadow-[0_0_8px_rgba(197,164,109,0.5)]" />
          )}
        </button>
      </div>

      {/* 6. Tab Content */}
      {activeTab === 'posts' && (
        <div className="divide-y divide-white/[0.08]">
          {userPosts.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#8E8E93]">
              لم يقم هذا العضو بنشر أي محتوى بعد.
            </div>
          ) : (
            userPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      )}

      {activeTab === 'media' && (
        <div className="p-3">
          {userMediaPosts.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#8E8E93]">
              لا توجد صور أو وسائط منشورة.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {userMediaPosts.flatMap((post, pIdx) =>
                (post.mediaUrls || []).map((imgUrl, mIdx) => (
                  <div
                    key={`${post.id}_${pIdx}_${mIdx}`}
                    className="aspect-square bg-[#121212] rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={imgUrl}
                      alt="Media thumbnail"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="p-4 space-y-3 text-xs animate-in fade-in">
          <div className="p-3.5 rounded-2xl bg-[#121212] border border-white/[0.08] space-y-2.5">
            <h4 className="font-bold text-white text-sm">معلومات الهوية والحساب</h4>

            <div className="space-y-2 text-[#A8A8A8]">
              <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                <span>تاريخ الانضمام:</span>
                <span className="text-white font-semibold">{viewingUser.joinDate}</span>
              </div>

              {viewingUser.location && (
                <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                  <span>الموقع:</span>
                  <span className="text-white font-semibold">{viewingUser.location}</span>
                </div>
              )}

              <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                <span>الرتبة في النظام:</span>
                <span className="text-[#C5A46D] font-bold uppercase">{viewingUser.role}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                <span>المستوى الحالي:</span>
                <span className="text-white font-semibold">المستوى {viewingUser.level} ({viewingUser.xp} XP)</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                <span>حالة الحساب:</span>
                <span className={`font-semibold ${viewingUser.status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {viewingUser.status}
                </span>
              </div>
            </div>
          </div>

          {/* If current user is staff, show private admin notes section */}
          {userIsStaff && (
            <div className="p-3.5 rounded-2xl bg-[#1C160C]/60 border border-[#C5A46D]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#C5A46D] flex items-center gap-1.5">
                  <ShieldAlert size={14} />
                  <span>ملاحظات المشرفين السرية ({viewingUser.adminNotes?.length || 0})</span>
                </span>
                <button
                  onClick={() => openAdminProfileMenu(viewingUser)}
                  className="text-[10px] text-[#DFCA98] font-bold hover:underline"
                >
                  إضافة ملاحظة
                </button>
              </div>

              {(!viewingUser.adminNotes || viewingUser.adminNotes.length === 0) ? (
                <p className="text-[11px] text-[#8E8E93]">لا توجد ملاحظات إدارية مسجلة على هذا العضو.</p>
              ) : (
                <div className="space-y-1.5">
                  {viewingUser.adminNotes.map(n => (
                    <div key={n.id} className="p-2 rounded-xl bg-black/40 text-[11px] text-[#E5E5E5] space-y-0.5">
                      <div className="flex justify-between text-[9px] text-[#8E8E93]">
                        <span>{n.authorName} ({n.authorRole})</span>
                        <span>{n.date}</span>
                      </div>
                      <p>{n.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Badge detail popup if clicked */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xs rounded-3xl bg-[#191919] border border-[#C5A46D]/40 p-5 shadow-2xl text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#C5A46D]/20 border border-[#C5A46D] mx-auto flex items-center justify-center text-3xl shadow-[0_0_16px_rgba(197,164,109,0.3)]">
              {selectedBadge.icon}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{selectedBadge.nameAr}</h3>
              <span className="text-[10px] text-[#C5A46D] font-bold uppercase tracking-wider block mt-0.5">
                {selectedBadge.rarity}
              </span>
            </div>
            <p className="text-xs text-[#A8A8A8]">{selectedBadge.description}</p>
            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
