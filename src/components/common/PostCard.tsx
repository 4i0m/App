/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share2,
  Bookmark,
  MoreHorizontal,
  Trash2,
  Flag,
  Pin,
  Sparkles,
  EyeOff,
  ShieldAlert
} from 'lucide-react';
import { Post } from '../../types';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from './UserAvatar';
import { VerifiedBadge, OGBadge, PinnedBadge, LevelBadge } from './BadgePill';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const {
    currentUserId,
    allUsers,
    isStaff,
    hasPermission,
    isOwner,
    toggleLikePost,
    toggleBookmarkPost,
    toggleRepost,
    togglePinPost,
    toggleFeaturePost,
    toggleHidePost,
    votePoll,
    deletePost,
    openUserProfile,
    openReportModal,
    openAdminProfileMenu,
    setVerificationDetailUser,
    setLevelDetailUser,
    setSelectedPostForComments,
    setLightboxImage
  } = useApp();

  const [showMenu, setShowMenu] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const author = allUsers[post.authorId];
  const isPostOwner = post.authorId === currentUserId;
  const canModerate = isStaff() || isOwner();

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  };

  const formatCount = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // If hidden by moderation and user is not staff, do not render
  if (post.isHidden && !canModerate) {
    return null;
  }

  return (
    <article className={`border-b border-white/[0.08] px-4 py-3.5 transition-colors ${
      post.isHidden ? 'bg-red-950/20 opacity-70' : 'bg-black hover:bg-white/[0.01]'
    }`}>
      {/* Moderation Alert Banner if Hidden */}
      {post.isHidden && (
        <div className="mb-2 px-3 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-[11px] font-semibold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <EyeOff size={13} />
            <span>هذا المنشور محجوب عن الجمهور بواسطة الإدارة</span>
          </span>
          <button
            onClick={() => toggleHidePost(post.id)}
            className="hover:underline text-white"
          >
            استعادة
          </button>
        </div>
      )}

      {/* Pinned or Featured Indicators matching screenshot */}
      <div className="flex items-center gap-2 mb-2">
        {post.isPinned && <PinnedBadge />}
        {post.isFeatured && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-[#A78BFA] bg-purple-950/40 border border-purple-500/30">
            <Sparkles size={10} />
            <span>مميز من الإدارة</span>
          </span>
        )}
      </div>

      {/* Post Header */}
      <div className="flex items-start justify-between gap-3">
        {/* Author Avatar -> CLICKABLE */}
        <div className="flex items-center gap-3">
          <UserAvatar
            userId={post.authorId}
            avatarUrl={post.authorAvatar}
            name={post.authorName}
            size="md"
            borderStyle={post.authorIsOG ? 'gold' : 'subtle'}
          />

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Author display name -> CLICKABLE */}
              <button
                onClick={() => openUserProfile(post.authorId)}
                className="font-bold text-white text-sm hover:underline tracking-tight flex items-center gap-1 text-start"
              >
                {post.authorName}
              </button>

              {/* Verified badge with category support & click details */}
              {post.authorVerified && (
                <VerifiedBadge
                  size={14}
                  category={post.authorVerificationCategory || author?.verificationCategory}
                  onClick={() => author && setVerificationDetailUser(author)}
                />
              )}

              {post.authorIsOG && <OGBadge />}

              {/* Level Badge matching screenshot Lv.24 */}
              {post.authorLevel && (
                <LevelBadge
                  level={post.authorLevel}
                  size="sm"
                  onClick={() => author && setLevelDetailUser(author)}
                />
              )}
            </div>

            {/* Sub-header: timestamp and username */}
            <div className="flex items-center gap-1.5 text-xs text-[#A8A8A8] mt-0.5">
              <span>{post.timestamp}</span>
              <span>·</span>
              <button
                onClick={() => openUserProfile(post.authorId)}
                className="hover:underline text-start force-ltr text-[#8E8E93]"
              >
                @{post.authorUsername}
              </button>
            </div>
          </div>
        </div>

        {/* Options Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            aria-label="More options"
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#A8A8A8] hover:text-white hover:bg-white/10 active:scale-95 transition-colors"
          >
            <MoreHorizontal size={18} />
          </button>

          {showMenu && (
            <div className="absolute top-8 ltr:right-0 rtl:left-0 z-30 w-52 rounded-2xl bg-[#191919] border border-white/10 shadow-2xl py-1 text-xs text-white backdrop-blur-md">
              {/* Administrative Menu Option for Staff */}
              {canModerate && author && !isPostOwner && (
                <button
                  onClick={() => {
                    openAdminProfileMenu(author);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-start flex items-center gap-2 text-[#C5A46D] hover:bg-[#C5A46D]/10 font-bold border-b border-white/10"
                >
                  <ShieldAlert size={15} />
                  <span>إدارة العضو (قائمة المشرفين)</span>
                </button>
              )}

              {/* Pin on profile (Author or Staff) */}
              {(isPostOwner || canModerate) && (
                <button
                  onClick={() => {
                    togglePinPost(post.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-start flex items-center gap-2 hover:bg-white/10"
                >
                  <Pin size={14} />
                  <span>{post.isPinned ? 'إلغاء التثبيت' : 'تثبيت في الملف الشخصي'}</span>
                </button>
              )}

              {/* Feature globally (Staff only) */}
              {hasPermission('canFeaturePosts') && (
                <button
                  onClick={() => {
                    toggleFeaturePost(post.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-start flex items-center gap-2 text-purple-400 hover:bg-white/10"
                >
                  <Sparkles size={14} />
                  <span>{post.isFeatured ? 'إلغاء التمييز العام' : 'تمييز في الصفحة الرئيسية'}</span>
                </button>
              )}

              {/* Hide post (Staff only) */}
              {hasPermission('canHidePosts') && (
                <button
                  onClick={() => {
                    toggleHidePost(post.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-start flex items-center gap-2 text-amber-400 hover:bg-white/10"
                >
                  <EyeOff size={14} />
                  <span>{post.isHidden ? 'استعادة المنشور' : 'حجب المنشور عن العامة'}</span>
                </button>
              )}

              {/* Bookmark */}
              <button
                onClick={() => {
                  toggleBookmarkPost(post.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-start flex items-center gap-2 hover:bg-white/10"
              >
                <Bookmark size={14} />
                <span>{post.isBookmarked ? 'إزالة من المحفوظات' : 'حفظ المنشور'}</span>
              </button>

              {/* Report */}
              <button
                onClick={() => {
                  openReportModal({
                    type: 'post',
                    id: post.id,
                    title: post.content.slice(0, 40) + '...',
                    authorId: post.authorId,
                    authorName: post.authorName
                  });
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-start flex items-center gap-2 text-amber-400 hover:bg-white/10"
              >
                <Flag size={14} />
                <span>إبلاغ عن المنشور</span>
              </button>

              {/* Delete */}
              {(isPostOwner || hasPermission('canDeletePosts')) && (
                <button
                  onClick={() => {
                    deletePost(post.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-start flex items-center gap-2 text-red-400 hover:bg-white/10 border-t border-white/10 mt-1"
                >
                  <Trash2 size={14} />
                  <span>حذف المنشور</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Text Content */}
      <div className="mt-2.5 text-[15px] leading-relaxed text-[#EDEDED] whitespace-pre-wrap">
        {post.content}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="text-xs text-[#C5A46D] hover:underline cursor-pointer">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Post Media (Images) */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121212]">
          {post.mediaUrls.map((url, idx) => (
            <div
              key={idx}
              onClick={() => setLightboxImage(url)}
              className="relative cursor-pointer overflow-hidden group max-h-[360px]"
            >
              <img
                src={url}
                alt="Post attachment"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {/* Interactive Poll */}
      {post.poll && (
        <div className="mt-3 p-3.5 rounded-2xl bg-[#121212] border border-white/[0.08]">
          <p className="text-sm font-semibold text-white mb-2.5">{post.poll.question}</p>
          <div className="space-y-2">
            {post.poll.options.map(option => {
              const total = post.poll?.totalVotes || 1;
              const percent = Math.round((option.votes / (total === 0 ? 1 : total)) * 100);
              const isSelected = post.poll?.selectedOptionId === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => votePoll(post.id, option.id)}
                  disabled={post.poll?.hasVoted}
                  className={`relative w-full overflow-hidden text-start rounded-xl px-3.5 py-2.5 text-xs font-medium border transition-all ${
                    isSelected
                      ? 'border-[#C5A46D] text-white'
                      : 'border-white/10 hover:border-white/25 text-[#D1D5DB]'
                  } ${post.poll?.hasVoted ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'}`}
                >
                  {post.poll?.hasVoted && (
                    <div
                      className={`absolute top-0 bottom-0 start-0 transition-all duration-500 ${
                        isSelected ? 'bg-[#C5A46D]/20' : 'bg-white/[0.06]'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  )}

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="truncate pr-2">{option.text}</span>
                    {post.poll?.hasVoted && (
                      <span className="font-bold text-[#C5A46D] force-ltr">{percent}%</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#8E8E93] mt-2.5 pt-2 border-t border-white/[0.06]">
            <span>{post.poll.totalVotes} صوت</span>
            {post.poll.hasVoted && <span className="text-[#C5A46D]">تم تسجيل صوتك</span>}
          </div>
        </div>
      )}

      {/* Action Counters Row */}
      <div className="flex items-center justify-between mt-3.5 pt-2 text-[#8E8E93] border-t border-white/[0.04]">
        {/* Like */}
        <button
          onClick={() => toggleLikePost(post.id)}
          className={`flex items-center gap-1.5 text-xs transition-colors hover:text-[#FF3040] ${
            post.isLiked ? 'text-[#FF3040] font-semibold' : ''
          }`}
          aria-label="Like post"
        >
          <Heart size={18} fill={post.isLiked ? '#FF3040' : 'none'} strokeWidth={post.isLiked ? 2.4 : 1.8} />
          <span className="force-ltr">{formatCount(post.likesCount)}</span>
        </button>

        {/* Comment */}
        <button
          onClick={() => setSelectedPostForComments(post)}
          className="flex items-center gap-1.5 text-xs transition-colors hover:text-[#1D9BF0]"
          aria-label="Comment on post"
        >
          <MessageCircle size={18} strokeWidth={1.8} />
          <span className="force-ltr">{formatCount(post.commentsCount)}</span>
        </button>

        {/* Repost */}
        <button
          onClick={() => toggleRepost(post.id)}
          className={`flex items-center gap-1.5 text-xs transition-colors hover:text-[#00BA7C] ${
            post.isReposted ? 'text-[#00BA7C] font-semibold' : ''
          }`}
          aria-label="Repost"
        >
          <Repeat2 size={18} strokeWidth={post.isReposted ? 2.4 : 1.8} />
          <span className="force-ltr">{formatCount(post.repostsCount)}</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="relative flex items-center gap-1.5 text-xs transition-colors hover:text-white"
          aria-label="Share post"
        >
          <Share2 size={17} strokeWidth={1.8} />
          {shareToast && (
            <span className="absolute -top-7 start-1/2 -translate-x-1/2 bg-[#C5A46D] text-black text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
              تم النسخ!
            </span>
          )}
        </button>

        {/* Bookmark */}
        <button
          onClick={() => toggleBookmarkPost(post.id)}
          className={`text-xs transition-colors hover:text-[#C5A46D] ${
            post.isBookmarked ? 'text-[#C5A46D]' : ''
          }`}
          aria-label="Bookmark post"
        >
          <Bookmark size={17} fill={post.isBookmarked ? '#C5A46D' : 'none'} strokeWidth={1.8} />
        </button>
      </div>
    </article>
  );
};
