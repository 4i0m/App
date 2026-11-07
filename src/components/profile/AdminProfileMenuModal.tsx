/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  X,
  Award,
  Crown,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  UserX,
  Pin,
  Lock,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VerificationCategory, AccountStatus, UserRole } from '../../types';

export const AdminProfileMenuModal: React.FC = () => {
  const {
    adminTargetUser,
    closeAdminProfileMenu,
    currentUser,
    hasPermission,
    isOwner,
    addAdminNote,
    assignTitleToUser,
    removeTitleFromUser,
    assignBadgeToUser,
    removeBadgeFromUser,
    setMemberVerification,
    restrictMemberAccount,
    restoreMemberAccount,
    changeMemberRole,
    isRTL,
    t
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'titles' | 'verification' | 'restrictions' | 'notes' | 'role'>('overview');
  const [noteText, setNoteText] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [selectedVerificationCategory, setSelectedVerificationCategory] = useState<VerificationCategory>('creator_professional');
  const [newTitleText, setNewTitleText] = useState('');
  const [newTitleIcon, setNewTitleIcon] = useState('👑');
  const [newTitleColor, setNewTitleColor] = useState('gold');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!adminTargetUser) return null;

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addAdminNote(adminTargetUser.id, noteText);
    setNoteText('');
    showFeedback('تم حفظ الملاحظة الإدارية بنجاح.');
  };

  const handleAssignTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleText.trim()) return;
    assignTitleToUser(adminTargetUser.id, {
      textAr: newTitleText,
      textEn: newTitleText,
      icon: newTitleIcon,
      color: newTitleColor,
      isAdministrative: true
    });
    setNewTitleText('');
    showFeedback(`تم منح اللقب "${newTitleText}" للعضو.`);
  };

  const handleSetVerification = (verify: boolean) => {
    setMemberVerification(adminTargetUser.id, verify, selectedVerificationCategory, actionReason);
    showFeedback(verify ? 'تم توثيق الحساب بنجاح.' : 'تم سحب شارة التوثيق.');
  };

  const handleRestrict = (status: AccountStatus) => {
    if (!actionReason.trim()) {
      showFeedback('يرجى كتابة سبب الإجراء الإداري أولاً للتوثيق في سجل الرقابة.');
      return;
    }
    restrictMemberAccount(adminTargetUser.id, status, actionReason);
    showFeedback(`تم تطبيق الإجراء [${status}] على الحساب.`);
    setActionReason('');
  };

  const handleRestore = () => {
    restoreMemberAccount(adminTargetUser.id);
    showFeedback('تم رفع جميع القيود واستعادة الحساب.');
  };

  const handleChangeRole = (role: UserRole) => {
    changeMemberRole(adminTargetUser.id, role);
    showFeedback(`تم تحديث الرتبة الإدارية إلى ${role}.`);
  };

  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-3xl bg-[#121212] border border-[#C5A46D]/30 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#161616]">
          <div className="flex items-center gap-2 text-[#C5A46D]">
            <ShieldAlert size={20} />
            <div>
              <h3 className="font-bold text-white text-sm">
                {t.adminProfileMenuTitle}
              </h3>
              <span className="text-[11px] text-[#A8A8A8] block">
                @{adminTargetUser.username} · {adminTargetUser.displayName}
              </span>
            </div>
          </div>
          <button
            onClick={closeAdminProfileMenu}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {feedbackMsg && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar border-b border-white/[0.06] bg-[#141414]">
          {[
            { id: 'overview', label: 'الحساب' },
            { id: 'titles', label: 'الألقاب والأوسمة' },
            { id: 'verification', label: 'التوثيق' },
            { id: 'restrictions', label: 'العقوبات والقيود' },
            { id: 'notes', label: 'الملاحظات' },
            { id: 'role', label: 'الرتبة الإدارية' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#C5A46D] text-black shadow'
                  : 'bg-white/5 text-[#A8A8A8] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* TAB 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[#161616] border border-white/[0.06] space-y-1.5">
                <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">معلومات الحساب والسجل</span>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-[#A8A8A8]">تاريخ الانضمام:</span>
                  <span className="font-semibold text-white">{adminTargetUser.joinDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-[#A8A8A8]">حالة الحساب:</span>
                  <span className={`font-bold uppercase ${adminTargetUser.status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {adminTargetUser.status}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-[#A8A8A8]">الرتبة الحالية:</span>
                  <span className="font-semibold text-[#C5A46D]">{adminTargetUser.role}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#A8A8A8]">المستوى و XP:</span>
                  <span className="font-semibold text-white">Lv.{adminTargetUser.level} ({adminTargetUser.xp} XP)</span>
                </div>
              </div>

              {adminTargetUser.restrictionDetails && (
                <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 space-y-1">
                  <span className="font-bold block flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    <span>قيود مفروضة حالياً:</span>
                  </span>
                  <p>{adminTargetUser.restrictionDetails.reason}</p>
                  <span className="text-[10px] text-red-400/80 block">
                    بواسطة: {adminTargetUser.restrictionDetails.issuedBy} · {adminTargetUser.restrictionDetails.issuedAt}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Titles & Badges */}
          {activeTab === 'titles' && (
            <div className="space-y-4">
              {/* Existing Titles list */}
              <div>
                <span className="text-[#8E8E93] block font-bold mb-2">الألقاب الحالية للعضو ({adminTargetUser.titles.length}):</span>
                {adminTargetUser.titles.length === 0 ? (
                  <p className="text-[#A8A8A8]">لا توجد ألقاب مخصصة لهذا العضو.</p>
                ) : (
                  <div className="space-y-1.5">
                    {adminTargetUser.titles.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-2 rounded-xl bg-[#161616] border border-white/10">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <span>{t.icon}</span>
                          <span>{t.textAr}</span>
                        </span>
                        {hasPermission('canRemoveTitles') && (
                          <button
                            onClick={() => removeTitleFromUser(adminTargetUser.id, t.id)}
                            className="px-2 py-1 rounded bg-red-500/20 text-red-300 text-[10px] hover:bg-red-500/30"
                          >
                            سحب اللقب
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Title Form */}
              {hasPermission('canAssignTitles') && (
                <form onSubmit={handleAssignTitle} className="p-3 rounded-2xl bg-[#161616] border border-white/10 space-y-2">
                  <span className="font-bold text-white block">منح لقب رسمي جديد:</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTitleText}
                      onChange={e => setNewTitleText(e.target.value)}
                      placeholder="اسم اللقب (مثال: سفير النخبة)"
                      className="flex-1 bg-[#121212] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                      required
                    />
                    <select
                      value={newTitleIcon}
                      onChange={e => setNewTitleIcon(e.target.value)}
                      className="bg-[#121212] border border-white/10 rounded-xl px-2 text-xs text-white"
                    >
                      <option value="👑">👑</option>
                      <option value="🛡️">🛡️</option>
                      <option value="🔮">🔮</option>
                      <option value="⭐">⭐</option>
                      <option value="⚡">⚡</option>
                      <option value="🎨">🎨</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-[#C5A46D] text-black font-bold text-xs"
                  >
                    منح اللقب رسمياً
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: Verification */}
          {activeTab === 'verification' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-[#161616] border border-white/10 space-y-2">
                <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">حالة التوثيق الحالية:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm">
                    {adminTargetUser.isVerified ? 'الحساب موثق رسمياً ✅' : 'الحساب غير موثق ❌'}
                  </span>
                  {adminTargetUser.verificationCategory && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5A46D]/20 text-[#C5A46D] border border-[#C5A46D]/30">
                      {adminTargetUser.verificationCategory}
                    </span>
                  )}
                </div>
              </div>

              {hasPermission('canVerifyAccounts') && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[#A8A8A8] mb-1 font-semibold">فئة التوثيق المعتمدة:</label>
                    <select
                      value={selectedVerificationCategory}
                      onChange={e => setSelectedVerificationCategory(e.target.value as VerificationCategory)}
                      className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A46D]"
                    >
                      <option value="official_platform">حساب رسمي للمنصة (ذهب 👑)</option>
                      <option value="notable_figure">شخصية عامة بارزة (أزرق ⭐)</option>
                      <option value="creator_professional">مبدع أو مطور محتوى معتمد (أزرق ✨)</option>
                      <option value="organization_brand">استوديو أو منظمة معتمدة (درع ذهبي 🛡️)</option>
                      <option value="special_official">شريك شرفي خاص (بلاتينيوم 💎)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#A8A8A8] mb-1 font-semibold">سبب / مذكرة التوثيق:</label>
                    <input
                      type="text"
                      value={actionReason}
                      onChange={e => setActionReason(e.target.value)}
                      placeholder="مثال: اجتياز متطلبات الهوية الرسمية"
                      className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSetVerification(true)}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#DFCA98] to-[#C5A46D] text-black font-bold text-xs"
                    >
                      منح التوثيق
                    </button>

                    {adminTargetUser.isVerified && (
                      <button
                        onClick={() => handleSetVerification(false)}
                        className="py-2.5 px-4 rounded-xl bg-red-500/20 text-red-300 font-semibold text-xs hover:bg-red-500/30"
                      >
                        سحب التوثيق
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Restrictions & Moderation */}
          {activeTab === 'restrictions' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[#A8A8A8] mb-1 font-semibold">سبب العقوبة أو التقييد (إلزامي):</label>
                <input
                  type="text"
                  value={actionReason}
                  onChange={e => setActionReason(e.target.value)}
                  placeholder="سجل المخالفة وتفاصيلها..."
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleRestrict('warned')}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center justify-between"
                >
                  <span>{t.warnMember}</span>
                  <AlertTriangle size={15} />
                </button>

                <button
                  onClick={() => handleRestrict('muted')}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold flex items-center justify-between"
                >
                  <span>{t.muteMember}</span>
                  <Clock size={15} />
                </button>

                <button
                  onClick={() => handleRestrict('suspended')}
                  className="w-full py-2.5 px-3 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-500/30 font-bold flex items-center justify-between"
                >
                  <span>{t.suspendMember}</span>
                  <Lock size={15} />
                </button>

                {hasPermission('canBanMembers') && (
                  <button
                    onClick={() => handleRestrict('banned')}
                    className="w-full py-2.5 px-3 rounded-xl bg-red-600/30 text-red-300 border border-red-500/40 font-bold flex items-center justify-between"
                  >
                    <span>{t.banMember}</span>
                    <UserX size={15} />
                  </button>
                )}

                {adminTargetUser.status !== 'active' && (
                  <button
                    onClick={handleRestore}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center justify-between mt-2"
                  >
                    <span>{t.restoreMember}</span>
                    <CheckCircle2 size={15} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Internal Admin Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-3">
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="أضف ملاحظة سرية مرئية فقط للمشرفين والإدارة..."
                  rows={2}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-white/30 resize-none focus:outline-none focus:border-[#C5A46D]"
                />
                <button
                  type="submit"
                  disabled={!noteText.trim()}
                  className="w-full py-2 rounded-xl bg-[#C5A46D] text-black font-bold text-xs disabled:opacity-40"
                >
                  حفظ الملاحظة الإدارية
                </button>
              </form>

              <div className="space-y-2 pt-2">
                <span className="text-[#8E8E93] text-[10px] uppercase font-bold block">
                  سجل الملاحظات ({adminTargetUser.adminNotes?.length || 0}):
                </span>
                {(!adminTargetUser.adminNotes || adminTargetUser.adminNotes.length === 0) ? (
                  <p className="text-[#A8A8A8]">لا توجد ملاحظات داخلية سابقة.</p>
                ) : (
                  adminTargetUser.adminNotes.map(n => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-[#161616] border border-white/[0.06] space-y-1">
                      <div className="flex justify-between text-[10px] text-[#C5A46D]">
                        <span className="font-bold">{n.authorName} ({n.authorRole})</span>
                        <span className="text-[#8E8E93]">{n.date}</span>
                      </div>
                      <p className="text-white text-xs leading-relaxed">{n.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: Role Management (Owner Exclusive) */}
          {activeTab === 'role' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[#161616] border border-white/10 space-y-1.5">
                <span className="font-bold text-[#C5A46D]">إدارة الرتبة الإدارية:</span>
                <p className="text-[#A8A8A8] text-[11px]">
                  وفق ميثاق منصة Q، وحده المالك (The Owner) يملك صلاحية تعيين وترقية أو عزل المشرفين.
                </p>
              </div>

              {isOwner() ? (
                <div className="space-y-2">
                  {[
                    { id: 'super_admin', label: 'مشرف عام (Super Admin)' },
                    { id: 'admin', label: 'مدير نظام (Admin)' },
                    { id: 'senior_moderator', label: 'مشرف أول (Senior Moderator)' },
                    { id: 'moderator', label: 'مشرف (Moderator)' },
                    { id: 'assistant', label: 'مساعد معتمد (Assistant)' },
                    { id: 'user', label: 'عضو عادي (Member)' }
                  ].map(r => (
                    <button
                      key={r.id}
                      onClick={() => handleChangeRole(r.id as UserRole)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors ${
                        adminTargetUser.role === r.id
                          ? 'border-[#C5A46D] bg-[#C5A46D]/15 text-[#C5A46D]'
                          : 'border-white/10 bg-[#161616] text-[#EDEDED] hover:bg-white/5'
                      }`}
                    >
                      <span>{r.label}</span>
                      {adminTargetUser.role === r.id && <CheckCircle2 size={15} />}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                  أنت لا تملك صلاحية المالك (The Owner) لتعديل رتب الإدارة.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
