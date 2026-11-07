/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  User,
  Lock,
  Bell,
  Palette,
  Globe,
  Shield,
  HelpCircle,
  Info,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Check,
  Code
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AndroidTopBar } from '../common/AndroidTopBar';
import { UserAvatar } from '../common/UserAvatar';
import { VerifiedBadge } from '../common/BadgePill';
import { Language } from '../../types';

export const SettingsScreen: React.FC = () => {
  const {
    language,
    setLanguage,
    currentUser,
    logout,
    navigateTo,
    setShowAndroidCodeExport,
    goBack,
    isRTL,
    t
  } = useApp();

  const [activeSubView, setActiveSubView] = useState<
    'main' | 'account' | 'privacy' | 'notifications' | 'appearance' | 'language' | 'security' | 'help' | 'about'
  >('main');

  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="pb-28 max-w-md mx-auto w-full min-h-screen bg-black text-white select-none">
      {/* Top Bar */}
      <AndroidTopBar
        title={t.settings}
        showBack={true}
        onBack={() => {
          if (activeSubView !== 'main') {
            setActiveSubView('main');
          } else {
            goBack();
          }
        }}
      />

      {/* Main View matching Screenshot 8 */}
      {activeSubView === 'main' && (
        <div className="p-4 space-y-4">
          {/* Top User Card matching Screenshot 8 */}
          <div className="p-4 rounded-3xl bg-[#141414] border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar
                userId={currentUser.id}
                avatarUrl={currentUser.avatarUrl}
                name={currentUser.displayName}
                size="md"
                clickable={false}
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-sm">{currentUser.displayName}</span>
                  {currentUser.isVerified && (
                    <VerifiedBadge size={14} category={currentUser.verificationCategory} />
                  )}
                </div>
                <span className="text-xs text-[#8E8E93] force-ltr block">@{currentUser.username}</span>
              </div>
            </div>

            <button
              onClick={() => navigateTo('profile_editor')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-white/10 hover:bg-white/15 active:scale-95 transition-all border border-white/10"
            >
              {t.editProfile}
            </button>
          </div>

          {/* Settings Menu List matching Screenshot 8 (8 items) */}
          <div className="rounded-3xl bg-[#121212] border border-white/[0.08] divide-y divide-white/[0.06] overflow-hidden">
            {/* 1. الحساب (Account) */}
            <button
              onClick={() => setActiveSubView('account')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.03] text-xs transition-colors"
            >
              <div className="flex items-center gap-3 text-[#E5E5E5]">
                <User size={18} className="text-[#A8A8A8]" />
                <span className="font-medium">{t.accountSettings}</span>
              </div>
              <Chevron size={16} className="text-[#8E8E93]" />
            </button>

            {/* 2. الخصوصية (Privacy) */}
            <button
              onClick={() => setActiveSubView('privacy')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.03] text-xs transition-colors"
            >
              <div className="flex items-center gap-3 text-[#E5E5E5]">
                <Lock size={18} className="text-[#A8A8A8]" />
                <span className="font-medium">{t.privacySettings}</span>
              </div>
              <Chevron size={16} className="text-[#8E8E93]" />
            </button>

            {/* 3. الإشعارات (Notifications) */}
            <button
              onClick={() => setActiveSubView('notifications')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.03] text-xs transition-colors"
            >
              <div className="flex items-center gap-3 text-[#E5E5E5]">
                <Bell size={18} className="text-[#A8A8A8]" />
                <span className="font-medium">{t.notificationsSettings}</span>
              </div>
              <Chevron size={16} className="text-[#8E8E93]" />
            </button>

            {/* 4. المظهر (Appearance) */}
            <button
              onClick={() => setActiveSubView('appearance')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.03] text-xs transition-colors"
            >
              <div className="flex items-center gap-3 text-[#E5E5E5]">
                <Palette size={18} className="text-[#A8A8A8]" />
                <span className="font-medium">{t.appearanceSettings}</span>
              </div>
              <Chevron size={16} className="text-[#8E8E93]" />
            </button>

            {/* 5. اللغة (Language) -> shows العربية on the right */}
            <button
              onClick={() => setActiveSubView('language')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.03] text-xs transition-colors"
            >
              <div className="flex items-center gap-3 text-[#E5E5E5]">
                <Globe size={18} className="text-[#A8A8A8]" />
                <span className="font-medium">{t.languageSetting}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#8E8E93]">
                <span>{language === 'ar' ? 'العربية' : language === 'tr' ? 'Türkçe' : 'English'}</span>
                <Chevron size={16} />
              </div>
            </button>

            {/* 6. الأمان (Security) */}
            <button
              onClick={() => setActiveSubView('security')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.03] text-xs transition-colors"
            >
              <div className="flex items-center gap-3 text-[#E5E5E5]">
                <Shield size={18} className="text-[#A8A8A8]" />
                <span className="font-medium">{t.securitySettings}</span>
              </div>
              <Chevron size={16} className="text-[#8E8E93]" />
            </button>

            {/* 7. المساعدة والدعم (Help & Support) */}
            <button
              onClick={() => setActiveSubView('help')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.03] text-xs transition-colors"
            >
              <div className="flex items-center gap-3 text-[#E5E5E5]">
                <HelpCircle size={18} className="text-[#A8A8A8]" />
                <span className="font-medium">{t.helpAndSupport}</span>
              </div>
              <Chevron size={16} className="text-[#8E8E93]" />
            </button>

            {/* 8. حول التطبيق (About App) */}
            <button
              onClick={() => setActiveSubView('about')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.03] text-xs transition-colors"
            >
              <div className="flex items-center gap-3 text-[#E5E5E5]">
                <Info size={18} className="text-[#A8A8A8]" />
                <span className="font-medium">{t.aboutApp}</span>
              </div>
              <Chevron size={16} className="text-[#8E8E93]" />
            </button>
          </div>

          {/* Android Code Architecture Export Button */}
          <button
            onClick={() => setShowAndroidCodeExport(true)}
            className="w-full p-3 rounded-2xl bg-[#141414] border border-[#C5A46D]/20 hover:border-[#C5A46D]/40 text-xs text-[#DFCA98] flex items-center justify-center gap-2 font-semibold transition-all"
          >
            <Code size={15} />
            <span>عرض كود أندرويد (Jetpack Compose & Kotlin)</span>
          </button>

          {/* Logout Button in Red matching Screenshot 8 */}
          <div className="pt-2 text-center">
            <button
              onClick={logout}
              className="w-full py-3 text-xs font-bold text-red-500 hover:text-red-400 active:scale-98 transition-all"
            >
              {t.logout}
            </button>
          </div>
        </div>
      )}

      {/* SUBVIEW: Language Selector */}
      {activeSubView === 'language' && (
        <div className="p-4 space-y-3">
          <span className="text-xs text-[#8E8E93] block mb-2">
            اختر لغة واجهة التطبيق المفضلة لديك:
          </span>

          {[
            { id: 'ar', label: 'العربية (RTL)', dir: 'rtl' },
            { id: 'en', label: 'English (LTR)', dir: 'ltr' },
            { id: 'tr', label: 'Türkçe (LTR)', dir: 'ltr' }
          ].map(lang => (
            <div
              key={lang.id}
              onClick={() => {
                setLanguage(lang.id as Language);
                setActiveSubView('main');
              }}
              className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-colors ${
                language === lang.id
                  ? 'border-[#C5A46D] bg-[#C5A46D]/10 text-white font-bold'
                  : 'border-white/10 bg-[#121212] text-[#A8A8A8] hover:border-white/20'
              }`}
            >
              <span className="text-xs">{lang.label}</span>
              {language === lang.id && <Check size={16} className="text-[#C5A46D]" />}
            </div>
          ))}
        </div>
      )}

      {/* SUBVIEW: Account */}
      {activeSubView === 'account' && (
        <div className="p-4 space-y-3 text-xs">
          <div className="p-4 rounded-3xl bg-[#121212] border border-white/10 space-y-2.5">
            <h4 className="font-bold text-white text-sm">بيانات الحساب الأساسية</h4>
            <div className="flex justify-between py-1 border-b border-white/[0.04]">
              <span className="text-[#8E8E93]">اسم المستخدم:</span>
              <span className="text-white font-medium force-ltr">@{currentUser.username}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.04]">
              <span className="text-[#8E8E93]">البريد الإلكتروني:</span>
              <span className="text-white font-medium force-ltr">alexander@q.social</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.04]">
              <span className="text-[#8E8E93]">رقم المعرف الموحد:</span>
              <span className="text-white font-medium force-ltr">{currentUser.id}</span>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW: Privacy */}
      {activeSubView === 'privacy' && (
        <div className="p-4 space-y-3 text-xs">
          <div className="p-4 rounded-3xl bg-[#121212] border border-white/10 space-y-2.5">
            <h4 className="font-bold text-white text-sm">إعدادات الخصوصية</h4>
            <p className="text-[#8E8E93] leading-relaxed">
              تتيح لك منصة Q التحكم الكامل في ظهور منشوراتك ومراسلاتك المباشرة وقائمة إنجازاتك.
            </p>
          </div>
        </div>
      )}

      {/* SUBVIEW: Security */}
      {activeSubView === 'security' && (
        <div className="p-4 space-y-3 text-xs">
          <div className="p-4 rounded-3xl bg-[#121212] border border-white/10 space-y-2.5">
            <h4 className="font-bold text-white text-sm">الأمان والتوثيق</h4>
            <p className="text-[#8E8E93] leading-relaxed">
              الحساب محمي بنظام التحقق المشفر وبنية الصلاحيات متعددة المستويات (RBAC).
            </p>
          </div>
        </div>
      )}

      {/* SUBVIEW: About App */}
      {activeSubView === 'about' && (
        <div className="p-4 space-y-3 text-xs">
          <div className="p-4 rounded-3xl bg-[#121212] border border-white/10 space-y-2.5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#C5A46D]/20 border border-[#C5A46D] mx-auto flex items-center justify-center font-bold text-xl text-[#DFCA98]">
              Q
            </div>
            <h4 className="font-bold text-white text-base">منصة Q الاجتماعية</h4>
            <p className="text-[#8E8E93]">
              الإصدار 3.0.0 (Native Android Experience)
            </p>
            <p className="text-[#DFCA98] font-medium text-[11px]">
              مجتمع واحد .. عالم بلا حدود.
            </p>
          </div>
        </div>
      )}

      {/* SUBVIEW: Help */}
      {activeSubView === 'help' && (
        <div className="p-4 space-y-3 text-xs">
          <div className="p-4 rounded-3xl bg-[#121212] border border-white/10 space-y-2.5">
            <h4 className="font-bold text-white text-sm">المساعدة والدعم الفني</h4>
            <p className="text-[#8E8E93]">
              فريق الإشراف متاح على مدار الساعة عبر البلاغات والرسائل المباشرة لمساعدتك.
            </p>
          </div>
        </div>
      )}

      {/* SUBVIEW: Notifications */}
      {activeSubView === 'notifications' && (
        <div className="p-4 space-y-3 text-xs">
          <div className="p-4 rounded-3xl bg-[#121212] border border-white/10 space-y-2.5">
            <h4 className="font-bold text-white text-sm">إشعارات النظام والمنصة</h4>
            <p className="text-[#8E8E93]">
              تصلك إشعارات فورية عند ورود تفاعلات، تعليقات، طلبات توثيق، وفعاليات جديدة.
            </p>
          </div>
        </div>
      )}

      {/* SUBVIEW: Appearance */}
      {activeSubView === 'appearance' && (
        <div className="p-4 space-y-3 text-xs">
          <div className="p-4 rounded-3xl bg-[#121212] border border-white/10 space-y-2.5">
            <h4 className="font-bold text-white text-sm">سمة التصميم المعتمدة</h4>
            <p className="text-[#8E8E93]">
              النمط الليلي الفاخر (Obsidian & Metallic Gold) هو الهوية الرسمية لمنصة Q.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
