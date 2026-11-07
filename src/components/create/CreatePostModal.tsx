/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { X, Image, BarChart2, Hash, Globe, Trash2, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';

export const CreatePostModal: React.FC = () => {
  const {
    isCreatePostOpen,
    setIsCreatePostOpen,
    currentUser,
    addPost,
    uploadFile,
    t
  } = useApp();

  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [category, setCategory] = useState('عام');
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isCreatePostOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadFile(file, 'posts');
        setMediaUrls(prev => [...prev, url]);
      }
    } catch (err) {
      console.warn("Upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions(prev => [...prev, '']);
    }
  };

  const handleRemovePollOption = (idx: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaUrls.length === 0) return;

    // Extract hashtags from content
    const tags = (content.match(/#[\w\u0621-\u064A]+/g) || []).map(t => t.replace('#', ''));

    let pollData = undefined;
    if (showPollCreator && pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2) {
      pollData = {
        question: pollQuestion,
        options: pollOptions.filter(o => o.trim()).map((text, idx) => ({
          id: `opt_${Date.now()}_${idx}`,
          text,
          votes: 0,
          votedUserIds: []
        })),
        totalVotes: 0,
        hasVoted: false
      };
    }

    addPost(content, mediaUrls, pollData, category, tags);
    setIsCreatePostOpen(false);
    setContent('');
    setMediaUrls([]);
    setShowPollCreator(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#121212] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08]">
          <button
            onClick={() => setIsCreatePostOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10"
          >
            <X size={18} />
          </button>
          <h3 className="font-bold text-white text-base">إنشاء منشور جديد</h3>
          <button
            onClick={handlePublish}
            disabled={!content.trim() && mediaUrls.length === 0}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#DFCA98] to-[#C5A46D] text-black font-bold text-xs hover:brightness-105 active:scale-95 disabled:opacity-40 transition-all shadow-[0_0_12px_rgba(197,164,109,0.3)]"
          >
            {t.publish}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Author line */}
          <div className="flex items-center gap-3">
            <UserAvatar
              userId={currentUser.id}
              avatarUrl={currentUser.avatarUrl}
              name={currentUser.displayName}
              size="md"
              clickable={false}
              borderStyle="gold"
            />
            <div>
              <span className="font-bold text-white text-sm block">{currentUser.displayName}</span>
              <div className="flex items-center gap-1.5 text-xs text-[#8E8E93] mt-0.5">
                <Globe size={12} />
                <span>الظهور: للجميع على الشبكة</span>
              </div>
            </div>
          </div>

          {/* Text Area */}
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={t.whatOnYourMind}
            rows={4}
            maxLength={600}
            className="w-full bg-transparent text-white text-base placeholder-white/30 focus:outline-none resize-none leading-relaxed"
          />

          {/* Media Previews */}
          {mediaUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {mediaUrls.map((url, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden border border-white/10 group aspect-video bg-black">
                  <img src={url} alt="Upload preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setMediaUrls(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-2 end-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Interactive Poll Creator */}
          {showPollCreator && (
            <div className="p-3.5 rounded-2xl bg-[#191919] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#C5A46D] flex items-center gap-1.5">
                  <BarChart2 size={14} />
                  <span>إعداد استطلاع رأي</span>
                </span>
                <button
                  onClick={() => setShowPollCreator(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <input
                type="text"
                value={pollQuestion}
                onChange={e => setPollQuestion(e.target.value)}
                placeholder="سؤال الاستطلاع..."
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A46D]"
              />

              <div className="space-y-1.5">
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={e => {
                        const val = e.target.value;
                        setPollOptions(prev => prev.map((o, i) => i === idx ? val : o));
                      }}
                      placeholder={`خيار ${idx + 1}`}
                      className="flex-1 bg-[#121212] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        onClick={() => handleRemovePollOption(idx)}
                        className="text-white/40 hover:text-red-400 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {pollOptions.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddPollOption}
                  className="text-xs text-[#C5A46D] hover:underline flex items-center gap-1 pt-1"
                >
                  <Plus size={13} />
                  <span>إضافة خيار إضافي</span>
                </button>
              )}
            </div>
          )}

          {/* Category Chips */}
          <div className="pt-2">
            <span className="text-[11px] text-[#8E8E93] block mb-2">تصنيف المحتوى:</span>
            <div className="flex gap-2 flex-wrap">
              {['عام', 'التقنية', 'الألعاب', 'الفن', 'فلسفة', 'إعلانات'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    category === cat
                      ? 'bg-[#C5A46D] text-black font-semibold'
                      : 'bg-white/[0.04] text-[#A8A8A8] border border-white/[0.06] hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Toolbar */}
        <div className="p-3 bg-black border-t border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Hidden file input for real photo upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#C5A46D] hover:bg-[#C5A46D]/10 active:scale-95 transition-transform"
              title="إرفاق صور من الجهاز"
            >
              <Image size={19} />
            </button>

            <button
              type="button"
              onClick={() => setShowPollCreator(!showPollCreator)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#A78BFA] hover:bg-[#8B5CF6]/10 active:scale-95 transition-transform"
              title="إنشاء استطلاع"
            >
              <BarChart2 size={19} />
            </button>

            <button
              type="button"
              onClick={() => setContent(prev => prev + ' #')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#60A5FA] hover:bg-[#3B82F6]/10 active:scale-95 transition-transform"
              title="إضافة وسم"
            >
              <Hash size={19} />
            </button>
          </div>

          <span className="text-[11px] text-[#8E8E93] force-ltr">{content.length}/600</span>
        </div>
      </div>
    </div>
  );
};
