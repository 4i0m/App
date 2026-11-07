/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Send, Heart, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from './UserAvatar';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

export const StoryViewerModal: React.FC = () => {
  const { 
    activeStory, 
    setActiveStory, 
    stories, 
    openUserProfile, 
    markStoryViewed, 
    currentUser, 
    currentUserId,
    startDirectMessageWith,
    sendMessage,
    conversations,
    language
  } = useApp();
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Mark story as viewed as soon as it's active
  useEffect(() => {
    if (activeStory && currentUserId) {
      markStoryViewed(activeStory.id);
      setIsLiked(false);
      setFeedbackMsg(null);
      setReplyText('');
    }
  }, [activeStory?.id, currentUserId, markStoryViewed]);

  useEffect(() => {
    if (!activeStory || isTyping) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Advance to next story or close
          const currentIndex = stories.findIndex(s => s.id === activeStory.id);
          if (currentIndex < stories.length - 1) {
            setActiveStory(stories[currentIndex + 1]);
            return 0;
          } else {
            setActiveStory(null);
            return 0;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStory, stories, setActiveStory, isTyping]);

  if (!activeStory) return null;

  const handleSendReply = () => {
    if (!replyText.trim() || !currentUserId || activeStory.authorId === currentUserId) return;

    // Send direct message
    const formattedReply = language === 'ar'
      ? `رد على القصة: ${replyText.trim()}`
      : `Replied to story: ${replyText.trim()}`;

    // Find or create conversation
    const existing = conversations.find(c => 
      !c.isGroup && c.participantIds.includes(currentUserId) && c.participantIds.includes(activeStory.authorId)
    );

    if (existing) {
      sendMessage(existing.id, formattedReply);
    } else {
      startDirectMessageWith(activeStory.authorId);
      // Give time for conversation setup
      setTimeout(() => {
        const found = conversations.find(c => 
          !c.isGroup && c.participantIds.includes(currentUserId) && c.participantIds.includes(activeStory.authorId)
        );
        if (found) {
          sendMessage(found.id, formattedReply);
        }
      }, 300);
    }

    setReplyText('');
    setIsTyping(false);
    setFeedbackMsg(language === 'ar' ? 'تم إرسال الرد بنجاح' : 'Reply sent successfully');
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleLikeStory = () => {
    if (isLiked || !currentUserId || activeStory.authorId === currentUserId) return;
    setIsLiked(true);

    // Create real notification for story author
    const notifId = `notif_story_like_${Date.now()}`;
    const newNotif = {
      id: notifId,
      type: 'like',
      actorId: currentUserId,
      actorName: currentUser.displayName,
      actorUsername: currentUser.username,
      actorAvatar: currentUser.avatarUrl,
      actorVerified: currentUser.isVerified,
      content: language === 'ar' ? 'أعجب بقصتك' : 'liked your story',
      targetId: activeStory.id,
      timestamp: language === 'ar' ? 'الآن' : 'just now',
      isRead: false,
      recipientId: activeStory.authorId,
      createdAt: new Date().toISOString()
    };

    setDoc(doc(db, 'notifications', notifId), newNotif).catch(() => {});
    setFeedbackMsg(language === 'ar' ? 'أعجبت بالقصة' : 'Liked story');
    setTimeout(() => setFeedbackMsg(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm h-full max-h-[820px] rounded-3xl overflow-hidden bg-black flex flex-col justify-between p-4 shadow-2xl border border-white/10">
        {/* Story Background / Image */}
        {activeStory.imageUrl ? (
          <img
            src={activeStory.imageUrl}
            alt="Story content"
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C160C] via-[#0E0E0E] to-black flex items-center justify-center p-6 text-center text-lg font-bold text-white">
            {activeStory.textContent || activeStory.authorName}
          </div>
        )}

        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 pointer-events-none" />

        {/* Top: Progress Bars & Author Row */}
        <div className="relative z-10 space-y-3">
          {/* Progress Bar */}
          <div className="flex gap-1 h-1 w-full bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#DFCA98] to-[#C5A46D] transition-all duration-100 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div
              onClick={() => {
                setActiveStory(null);
                openUserProfile(activeStory.authorId);
              }}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <UserAvatar
                userId={activeStory.authorId}
                avatarUrl={activeStory.authorAvatar}
                name={activeStory.authorName}
                size="sm"
                clickable={false}
              />
              <div>
                <span className="font-bold text-white text-xs group-hover:underline flex items-center gap-1">
                  {activeStory.authorName}
                  {activeStory.viewCount !== undefined && activeStory.viewCount > 0 && (
                    <span className="text-[10px] text-white/50 font-normal">
                      • {activeStory.viewCount} {language === 'ar' ? 'مشاهدة' : 'views'}
                    </span>
                  )}
                </span>
                <span className="block text-[10px] text-white/70">{activeStory.timestamp}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveStory(null)}
              className="w-8 h-8 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              title={language === 'ar' ? 'إغلاق' : 'Close'}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Feedback Banner if reply sent or liked */}
        {feedbackMsg && (
          <div className="relative z-20 self-center bg-black/80 border border-[#C5A46D]/50 text-[#DFCA98] px-4 py-1.5 rounded-full text-xs flex items-center gap-2 backdrop-blur-md animate-in fade-in zoom-in-95">
            <CheckCircle2 size={14} className="text-[#C5A46D]" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Bottom Reply Bar */}
        {currentUserId && activeStory.authorId !== currentUserId ? (
          <div className="relative z-10 flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onFocus={() => setIsTyping(true)}
              onBlur={() => !replyText && setIsTyping(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
              placeholder={language === 'ar' ? 'الرد على القصة...' : 'Reply to story...'}
              className="flex-1 bg-black/70 border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/50 backdrop-blur-md focus:outline-none focus:border-[#C5A46D]"
            />
            <button 
              onClick={handleLikeStory}
              className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center ${
                isLiked 
                  ? 'bg-rose-500/20 border-rose-500 text-rose-500' 
                  : 'bg-black/60 text-white/80 border-white/20 hover:text-rose-400'
              }`}
              title={language === 'ar' ? 'إعجاب' : 'Like'}
            >
              <Heart size={18} className={isLiked ? 'fill-rose-500' : ''} />
            </button>
            <button 
              onClick={handleSendReply}
              disabled={!replyText.trim()}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[#DFCA98] to-[#C5A46D] text-black font-semibold flex items-center justify-center hover:brightness-110 disabled:opacity-40 transition-all cursor-pointer"
              title={language === 'ar' ? 'إرسال' : 'Send'}
            >
              <Send size={16} />
            </button>
          </div>
        ) : (
          <div className="relative z-10 text-center py-2 text-[11px] text-white/50 bg-black/40 rounded-full">
            {language === 'ar' ? 'قصتك الشخصية' : 'Your story'}
          </div>
        )}
      </div>
    </div>
  );
};

