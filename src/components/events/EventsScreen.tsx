/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Users,
  CheckCircle2,
  Plus,
  X,
  Sparkles,
  Search,
  ArrowRight,
  Gamepad2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AndroidTopBar } from '../common/AndroidTopBar';
import { UserAvatar } from '../common/UserAvatar';
import { SocialEvent } from '../../types';

export const EventsScreen: React.FC = () => {
  const {
    events,
    selectedEventId,
    setSelectedEventId,
    registerForEvent,
    cancelEventRegistration,
    addEvent,
    allUsers,
    openUserProfile,
    goBack,
    t
  } = useApp();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'الكل' | 'مسابقات' | 'تحديات' | 'فعاليات عامة'>('الكل');
  const [showEventDetailModal, setShowEventDetailModal] = useState<SocialEvent | null>(null);

  const categories: ('الكل' | 'مسابقات' | 'تحديات' | 'فعاليات عامة')[] = [
    'الكل',
    'مسابقات',
    'تحديات',
    'فعاليات عامة'
  ];

  const filteredEvents = events.filter(e => {
    if (activeCategoryFilter === 'الكل') return true;
    if (activeCategoryFilter === 'مسابقات') return e.category.includes('مسابقة') || e.title.includes('تصميم');
    if (activeCategoryFilter === 'تحديات') return e.category.includes('تحدي') || e.title.includes('ألعاب');
    return true;
  });

  return (
    <div className="pb-28 max-w-md mx-auto w-full min-h-screen bg-black text-white select-none">
      {/* 1. Top Bar matching Screenshot 6 */}
      <AndroidTopBar
        title={t.events}
        showSearch={true}
        onSearchClick={() => {}}
        rightAction={
          <button className="w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
            <Calendar size={18} />
          </button>
        }
      />

      {/* 2. Category Filter Pills matching Screenshot 6 */}
      <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategoryFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              activeCategoryFilter === cat
                ? 'bg-[#C5A46D] text-black font-bold shadow-[0_0_12px_rgba(197,164,109,0.35)]'
                : 'bg-[#141414] text-[#A8A8A8] border border-white/[0.08] hover:text-white hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. Event Cards Stream matching Screenshot 6 */}
      <div className="p-4 space-y-4">
        {filteredEvents.map(event => {
          const isRegistered = event.isRegistered;
          return (
            <div
              key={event.id}
              className="rounded-3xl overflow-hidden border border-white/[0.08] bg-[#121212] shadow-2xl relative group"
            >
              {/* Event Cover Banner */}
              <div className="relative h-44 bg-black overflow-hidden">
                <img
                  src={event.coverUrl}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-black/40 to-transparent" />

                {/* Badge Tag matching Screenshot 6: فعالية رسمية / تحدي */}
                <span className="absolute top-3 start-3 px-3 py-1 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md text-[#DFCA98] border border-[#C5A46D]/40">
                  {event.isOfficial ? 'فعالية رسمية' : 'تحدي'}
                </span>
              </div>

              {/* Event Body matching Screenshot 6 */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{event.title}</span>
                    {event.category.includes('مسابقة') && <span className="text-lg">🏆</span>}
                  </h3>
                  {event.subtitle && (
                    <p className="text-xs text-[#A8A8A8] mt-1">{event.subtitle}</p>
                  )}
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-2 text-xs text-[#8E8E93]">
                  <Calendar size={14} className="text-[#C5A46D]" />
                  <span>{event.dateStr} · {event.timeStr}</span>
                </div>

                {/* Attendees counter with avatars matching Screenshot 6 */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2 rtl:space-x-reverse overflow-hidden">
                      {(event.participantUserIds && event.participantUserIds.length > 0 ? event.participantUserIds.slice(0, 4) : Object.keys(allUsers).slice(0, 4)).map(uid => (
                        <div key={uid} className="inline-block h-6 w-6 rounded-full ring-2 ring-black overflow-hidden bg-[#222]">
                          <img
                            src={allUsers[uid]?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt=""
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-[#DFCA98] font-bold force-ltr">
                      {event.registeredCount > 1000 ? `${(event.registeredCount / 1000).toFixed(1)}K` : event.registeredCount}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowEventDetailModal(event)}
                    className="text-xs text-[#DFCA98] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>تفاصيل الفعالية</span>
                    <ArrowRight size={13} className="rtl:rotate-180" />
                  </button>
                </div>

                {/* Main Registration Button */}
                <button
                  onClick={() => {
                    if (isRegistered) {
                      cancelEventRegistration(event.id);
                    } else {
                      registerForEvent(event.id);
                    }
                  }}
                  className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-98 shadow-md ${
                    isRegistered
                      ? 'bg-white/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-gradient-to-r from-[#DFCA98] to-[#C5A46D] text-black shadow-[0_0_16px_rgba(197,164,109,0.3)]'
                  }`}
                >
                  {isRegistered ? 'أنت مسجل في هذه الفعالية ✓' : 'التسجيل الآن'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Details Modal */}
      {showEventDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#141414] border border-[#C5A46D]/40 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-bold text-white text-sm">{showEventDetailModal.title}</h3>
              <button
                onClick={() => setShowEventDetailModal(null)}
                className="text-white/60 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#D8D8D8] leading-relaxed">
              {showEventDetailModal.description}
            </p>

            {showEventDetailModal.prizes && (
              <div className="p-3 rounded-2xl bg-black/40 border border-[#C5A46D]/20 space-y-1.5 text-xs">
                <span className="font-bold text-[#C5A46D] block">الجوائز والمكافآت:</span>
                {showEventDetailModal.prizes.map((p, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] text-[#A8A8A8]">
                    <span>{p.rank}: {p.title}</span>
                    <span className="text-white font-semibold">{p.reward}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowEventDetailModal(null)}
              className="w-full py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/15"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
