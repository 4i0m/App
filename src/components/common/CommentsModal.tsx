/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Heart, Send, CornerDownLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from './UserAvatar';
import { VerifiedBadge } from './BadgePill';

export const CommentsModal: React.FC = () => {
  const {
    selectedPostForComments,
    setSelectedPostForComments,
    postComments,
    addComment,
    likeComment,
    openUserProfile,
    currentUser,
    t
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);

  if (!selectedPostForComments) return null;

  const comments = postComments[selectedPostForComments.id] || [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addComment(selectedPostForComments.id, commentText, replyingTo?.id);
    setCommentText('');
    setReplyingTo(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-[80vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-[#121212] border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08]">
          <h3 className="font-bold text-white text-base">التعليقات ({comments.length})</h3>
          <button
            onClick={() => setSelectedPostForComments(null)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="py-16 text-center text-[#8E8E93] text-xs">
              لا توجد تعليقات بعد. كن أول من يشارك برأيه!
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="flex items-start gap-3 text-xs">
                {/* Clickable Avatar */}
                <UserAvatar
                  userId={comment.authorId}
                  avatarUrl={comment.authorAvatar}
                  name={comment.authorName}
                  size="sm"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Clickable Username */}
                    <button
                      onClick={() => {
                        setSelectedPostForComments(null);
                        openUserProfile(comment.authorId);
                      }}
                      className="font-bold text-white hover:underline truncate"
                    >
                      {comment.authorName}
                    </button>
                    {comment.authorVerified && <VerifiedBadge size={12} />}
                    <span className="text-[#8E8E93] text-[10px]">{comment.timestamp}</span>
                  </div>

                  <p className="mt-1 text-[#E5E5E5] text-[13px] leading-relaxed break-words">
                    {comment.text}
                  </p>

                  <div className="flex items-center gap-4 mt-1.5 text-[11px] text-[#8E8E93]">
                    <button
                      onClick={() => setReplyingTo({ id: comment.id, username: comment.authorUsername })}
                      className="hover:text-white transition-colors flex items-center gap-1"
                    >
                      <CornerDownLeft size={12} />
                      <span>رد</span>
                    </button>
                  </div>
                </div>

                {/* Like comment button */}
                <button
                  onClick={() => likeComment(selectedPostForComments.id, comment.id)}
                  className={`flex flex-col items-center gap-0.5 text-[10px] p-1 ${
                    comment.likedByCurrentUser ? 'text-[#FF3040]' : 'text-[#8E8E93] hover:text-white'
                  }`}
                >
                  <Heart size={14} fill={comment.likedByCurrentUser ? '#FF3040' : 'none'} />
                  {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Reply To indicator */}
        {replyingTo && (
          <div className="flex items-center justify-between px-4 py-1.5 bg-[#191919] border-t border-white/[0.06] text-xs text-[#C5A46D]">
            <span>الرد على @{replyingTo.username}</span>
            <button onClick={() => setReplyingTo(null)} className="text-white/60 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-black border-t border-white/[0.08] flex items-center gap-2">
          <UserAvatar
            userId={currentUser.id}
            avatarUrl={currentUser.avatarUrl}
            name={currentUser.displayName}
            size="xs"
            clickable={false}
          />

          <input
            type="text"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder={t.whatOnYourMind}
            className="flex-1 bg-[#191919] border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A46D]"
          />

          <button
            type="submit"
            disabled={!commentText.trim()}
            className="w-8 h-8 rounded-full bg-[#C5A46D] text-black flex items-center justify-center disabled:opacity-40 hover:brightness-110 active:scale-95 transition-transform"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
