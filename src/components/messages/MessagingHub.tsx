/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Edit,
  ArrowRight,
  Send,
  Image as ImageIcon,
  Smile,
  Phone,
  Video,
  MoreVertical,
  X,
  CheckCheck,
  Mic,
  Square,
  Trash2,
  Loader2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AndroidTopBar } from '../common/AndroidTopBar';
import { UserAvatar } from '../common/UserAvatar';
import { VerifiedBadge } from '../common/BadgePill';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';
import { Message, Conversation } from '../../types';

export const MessagingHub: React.FC = () => {
  const {
    conversations,
    messages,
    activeConversationId,
    openConversation,
    sendMessage,
    sendVoiceMessage,
    deleteMessage,
    addReaction,
    allUsers,
    currentUserId,
    openUserProfile,
    startDirectMessageWith,
    startVoiceCall,
    isRTL,
    t
  } = useApp();

  const [activeTab, setActiveTab] = useState<'direct' | 'groups'>('direct');
  const [chatSearch, setChatSearch] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Scroll to bottom of chat on new messages
  useEffect(() => {
    if (activeConversationId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConversationId]);

  // Clean up recording on unmount or conv change
  useEffect(() => {
    return () => {
      cancelVoiceRecording();
    };
  }, [activeConversationId]);

  const activeConv = conversations.find(c => c.id === activeConversationId);
  const convMessages = activeConversationId ? (messages[activeConversationId] || []) : [];

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    if (activeTab === 'groups' && !c.isGroup) return false;
    if (activeTab === 'direct' && c.isGroup) return false;
    if (chatSearch) {
      const name = c.isGroup ? c.name : c.participants[0]?.displayName;
      return name?.toLowerCase().includes(chatSearch.toLowerCase());
    }
    return true;
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversationId || !messageText.trim()) return;
    sendMessage(activeConversationId, messageText);
    setMessageText('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversationId) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        sendMessage(activeConversationId, '', event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Voice note recording logic
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      showToast("تعذر الوصول إلى الميكروفون. يرجى منح إذن الميكروفون.");
    }
  };

  const cancelVoiceRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (_) {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const finishVoiceRecording = async () => {
    if (!mediaRecorderRef.current || !activeConversationId) return;

    const duration = recordingSeconds;
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    setIsUploadingVoice(true);

    const recorder = mediaRecorderRef.current;
    recorder.onstop = async () => {
      try {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }

        if (audioBlob.size > 0 && duration >= 1) {
          await sendVoiceMessage(activeConversationId, audioBlob, duration);
        }
      } catch (err) {
        console.error("Error sending voice note:", err);
      } finally {
        setIsUploadingVoice(false);
        setIsRecording(false);
        setRecordingSeconds(0);
        audioChunksRef.current = [];
      }
    };

    if (recorder.state !== 'inactive') {
      recorder.stop();
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // If a conversation is open, render the active chat view
  if (activeConversationId && activeConv) {
    const otherParticipant = activeConv.participants.find(p => p.id !== currentUserId) || activeConv.participants[0];

    const handleCallClick = () => {
      if (otherParticipant?.id) {
        startVoiceCall(
          otherParticipant.id,
          activeConv.name || otherParticipant.displayName,
          activeConv.avatarUrl || otherParticipant.avatarUrl
        );
      }
    };

    return (
      <div className="pb-16 max-w-md mx-auto w-full h-screen flex flex-col bg-black relative">
        {toastMessage && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-[#C5A46D] text-black font-bold text-xs shadow-xl pointer-events-none animate-in fade-in">
            {toastMessage}
          </div>
        )}
        {/* Chat Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-3 py-2 bg-[#121212]/95 backdrop-blur-md border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => openConversation('')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10"
            >
              <ArrowRight size={20} className={isRTL ? '' : 'rotate-180'} />
            </button>

            {/* Clickable Participant Avatar & Name */}
            <div
              onClick={() => {
                if (otherParticipant?.id) openUserProfile(otherParticipant.id);
              }}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <UserAvatar
                userId={otherParticipant?.id}
                avatarUrl={activeConv.avatarUrl || otherParticipant?.avatarUrl}
                name={activeConv.name || otherParticipant?.displayName}
                size="sm"
                clickable={false}
                showOnline={true}
              />

              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-white text-xs group-hover:underline truncate max-w-[140px]">
                    {activeConv.name || otherParticipant?.displayName}
                  </span>
                  {otherParticipant?.isVerified && <VerifiedBadge size={12} />}
                </div>
                <span className="text-[10px] text-[#10B981]">متصل الآن</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[#8E8E93]">
            {/* Real WebRTC Voice Call */}
            <button
              onClick={handleCallClick}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#C5A46D] hover:bg-white/10 active:scale-95 transition-all"
              title="اتصال صوتي فوري WebRTC"
            >
              <Phone size={18} />
            </button>
            <button
              onClick={() => showToast("ميزة مكالمات الفيديو ستتوفر في التحديث القادم.")}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10"
              title="مكالمة فيديو"
            >
              <Video size={18} />
            </button>
            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10">
              <MoreVertical size={18} />
            </button>
          </div>
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {convMessages.length === 0 ? (
            <div className="py-24 text-center text-xs text-[#8E8E93]">
              لا توجد رسائل سابقة. ابدأ المحادثة الآن!
            </div>
          ) : (
            convMessages.map(msg => {
              const isMe = msg.senderId === currentUserId;
              const isVoice = msg.mediaType === 'voice';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
                >
                  <div
                    className={`relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs text-white shadow-md leading-relaxed ${
                      isMe
                        ? 'bg-[#1C2C4A] text-white rounded-ee-sm border border-blue-500/20'
                        : 'bg-[#191919] text-[#EDEDED] rounded-es-sm border border-white/[0.08]'
                    }`}
                  >
                    {/* Voice Message Bubble */}
                    {isVoice ? (
                      <VoiceMessagePlayer
                        audioUrl={msg.mediaUrl || ''}
                        duration={msg.audioDuration}
                        isMyMessage={isMe}
                        onDelete={() => deleteMessage(activeConv.id, msg.id)}
                      />
                    ) : (
                      <>
                        {msg.mediaUrl && (
                          <div className="rounded-xl overflow-hidden mb-2 max-h-56">
                            <img src={msg.mediaUrl} alt="Attachment" className="w-full h-full object-cover" />
                          </div>
                        )}
                        {msg.text && <p className="break-words">{msg.text}</p>}
                      </>
                    )}

                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-white/50 force-ltr">
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck size={11} className="text-[#60A5FA]" />}
                    </div>

                    {/* Reactions Pill */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="absolute -bottom-2.5 start-2 bg-[#121212] border border-white/10 rounded-full px-1.5 py-0.5 text-[11px] shadow flex items-center gap-1">
                        {msg.reactions.map((r, i) => (
                          <span key={i}>{r.emoji}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Reaction Toolbar on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 text-[13px] bg-black/60 rounded-full px-2 py-0.5">
                    {['❤️', '🔥', '👍', '👏'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => addReaction(activeConv.id, msg.id, emoji)}
                        className="hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Bar / Voice Recorder Bar */}
        {isRecording ? (
          <div className="p-3 bg-[#161616] border-t border-[#C5A46D]/30 flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <div className="flex flex-col">
                <span className="text-white text-xs font-bold font-mono">
                  {formatTimer(recordingSeconds)}
                </span>
                <span className="text-[10px] text-[#A8A8A8]">جاري تسجيل رسالة صوتية...</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelVoiceRecording}
                className="w-9 h-9 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center hover:bg-red-500/30 active:scale-95 transition-transform"
                title="إلغاء التسجيل"
              >
                <Trash2 size={16} />
              </button>

              <button
                type="button"
                onClick={finishVoiceRecording}
                disabled={isUploadingVoice}
                className="px-4 py-2 rounded-full bg-[#C5A46D] text-black font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-transform"
                title="إرسال التسجيل الصوتي"
              >
                {isUploadingVoice ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    <span>إرسال الصوت</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-3 bg-[#121212] border-t border-white/[0.08] flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#C5A46D] hover:bg-white/10 active:scale-95"
              title="إرفاق صورة"
            >
              <ImageIcon size={19} />
            </button>

            {/* Mic Record Button */}
            <button
              type="button"
              onClick={startVoiceRecording}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#C5A46D] hover:bg-[#C5A46D]/15 active:scale-95 transition-all"
              title="تسجيل رسالة صوتية"
            >
              <Mic size={19} />
            </button>

            <input
              type="text"
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              placeholder={t.typeMessage}
              className="flex-1 bg-black border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A46D]"
            />

            <button
              type="submit"
              disabled={!messageText.trim()}
              className="w-9 h-9 rounded-full bg-[#C5A46D] text-black flex items-center justify-center disabled:opacity-40 hover:brightness-110 active:scale-95 transition-transform"
            >
              <Send size={15} />
            </button>
          </form>
        )}
      </div>
    );
  }

  // Otherwise, render Unified Messaging Hub List matching Screenshot 3
  return (
    <div className="pb-24 max-w-md mx-auto w-full min-h-screen bg-black">
      {/* 1. Header matching Screenshot 3 */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-black/95 backdrop-blur-md border-b border-white/[0.08]">
        <div className="w-9 h-9 flex items-center justify-center text-white/80">
          <Edit size={19} className="opacity-0 pointer-events-none" />
        </div>

        <h1 className="text-base font-bold text-white tracking-wide">
          {t.messagesTitle}
        </h1>

        <button
          onClick={() => setShowNewChatModal(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-transform"
          title="محادثة جديدة"
        >
          <Edit size={19} />
        </button>
      </header>

      {/* 2. Search in Chats */}
      <div className="p-4 pb-2">
        <div className="relative flex items-center">
          <Search size={16} className="absolute start-3.5 text-[#8E8E93] pointer-events-none" />
          <input
            type="text"
            value={chatSearch}
            onChange={e => setChatSearch(e.target.value)}
            placeholder={t.searchChats}
            className="w-full bg-[#161616] border border-white/10 rounded-2xl ps-10 pe-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A46D]"
          />
        </div>
      </div>

      {/* 3. Segmented Tabs: المحادثات الخاصة / المجموعات */}
      <div className="flex items-center justify-around border-b border-white/[0.08] px-4">
        <button
          onClick={() => setActiveTab('direct')}
          className={`py-2.5 text-xs font-semibold relative transition-colors ${
            activeTab === 'direct' ? 'text-white' : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <span>{t.directMessages}</span>
          {activeTab === 'direct' && (
            <span className="absolute bottom-0 start-0 end-0 h-[2px] bg-[#C5A46D] rounded-t-full shadow-[0_0_8px_rgba(197,164,109,0.5)]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`py-2.5 text-xs font-semibold relative transition-colors ${
            activeTab === 'groups' ? 'text-white' : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <span>{t.groups}</span>
          {activeTab === 'groups' && (
            <span className="absolute bottom-0 start-0 end-0 h-[2px] bg-[#C5A46D] rounded-t-full shadow-[0_0_8px_rgba(197,164,109,0.5)]" />
          )}
        </button>
      </div>

      {/* 4. Active Now Row matching Screenshot 3 */}
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {/* Online count pill */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-12 h-12 rounded-full bg-[#191919] border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow">
              +40
            </div>
            <span className="text-[10px] text-[#10B981] font-medium mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>145 {t.connectedNow}</span>
            </span>
          </div>

          {/* Online user avatars */}
          {Object.values(allUsers)
            .filter(u => u.id !== currentUserId && u.isOnline)
            .map(user => (
              <div
                key={user.id}
                onClick={() => startDirectMessageWith(user.id)}
                className="flex flex-col items-center shrink-0 cursor-pointer group"
              >
                <UserAvatar
                  userId={user.id}
                  avatarUrl={user.avatarUrl}
                  name={user.displayName}
                  size="md"
                  clickable={false}
                  showOnline={true}
                />
                <span className="text-[10px] text-[#A8A8A8] group-hover:text-white truncate max-w-[50px] mt-1">
                  {user.displayName}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* 5. Chat List matching Screenshot 3 */}
      <div className="divide-y divide-white/[0.06]">
        {filteredConversations.length === 0 ? (
          <div className="py-20 text-center text-xs text-[#8E8E93]">
            لا توجد محادثات تطابق بحثك.
          </div>
        ) : (
          filteredConversations.map(conv => {
            const other = conv.participants.find(p => p.id !== currentUserId) || conv.participants[0];
            const title = conv.isGroup ? conv.name : other?.displayName;
            const isVerified = other?.isVerified;

            return (
              <div
                key={conv.id}
                onClick={() => openConversation(conv.id)}
                className="flex items-center justify-between p-3.5 hover:bg-white/[0.02] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar
                    userId={other?.id}
                    avatarUrl={conv.avatarUrl || other?.avatarUrl}
                    name={title}
                    size="md"
                    clickable={false}
                    showOnline={other?.isOnline}
                  />

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs truncate">{title}</span>
                      {isVerified && <VerifiedBadge size={13} />}
                    </div>

                    <p className="text-xs text-[#8E8E93] truncate max-w-[200px] mt-0.5">
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0 ps-2">
                  <span className="text-[10px] text-[#8E8E93] force-ltr">{conv.lastMessageTimestamp}</span>
                  {conv.unreadCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#1D9BF0] text-white text-[10px] font-bold flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Chat Picker Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#191919] border border-white/10 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-bold text-white text-sm">بدء محادثة خاصة جديدة</h3>
              <button onClick={() => setShowNewChatModal(false)} className="text-white/60 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.values(allUsers)
                .filter(u => u.id !== currentUserId)
                .map(u => (
                  <div
                    key={u.id}
                    onClick={() => {
                      setShowNewChatModal(false);
                      startDirectMessageWith(u.id);
                    }}
                    className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 cursor-pointer"
                  >
                    <UserAvatar userId={u.id} avatarUrl={u.avatarUrl} name={u.displayName} size="sm" clickable={false} />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-white text-xs block truncate">{u.displayName}</span>
                      <span className="text-[10px] text-[#8E8E93] force-ltr">@{u.username}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
