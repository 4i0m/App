/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Camera,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Save,
  Globe,
  Lock,
  Eye,
  Sliders,
  Palette
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AndroidTopBar } from '../common/AndroidTopBar';
import { TitleChip } from '../common/BadgePill';
import { ART_ASSETS } from '../../data/initialData';

export const ProfileEditorScreen: React.FC = () => {
  const { currentUser, updateProfile, uploadFile, allUsers, goBack, t } = useApp();

  // Basic info states
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [location, setLocation] = useState(currentUser.location || '');
  const [website, setWebsite] = useState(currentUser.website || '');
  const [statusText, setStatusText] = useState(currentUser.statusText || '');

  // Profile image states (supports real file uploads from device!)
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [coverUrl, setCoverUrl] = useState(currentUser.coverUrl);

  // Appearance preset
  const [appearancePreset, setAppearancePreset] = useState<'obsidian' | 'gilded' | 'concrete' | 'midnight'>(
    currentUser.appearancePreset || 'obsidian'
  );
  const [accentColor, setAccentColor] = useState(currentUser.accentColor || '#C5A46D');

  // Badges & Titles display selection
  const [selectedTitles, setSelectedTitles] = useState<string[]>(
    currentUser.titles.filter(t => t.isDisplayed).map(t => t.id)
  );
  const [selectedBadges, setSelectedBadges] = useState<string[]>(
    currentUser.badges.filter(b => b.isDisplayed).map(b => b.id)
  );

  // Privacy controls
  const [allowMessages, setAllowMessages] = useState(currentUser.privacy.allowMessagesFrom);
  const [showOnlineStatus, setShowOnlineStatus] = useState(currentUser.privacy.showOnlineStatus);
  const [isPrivateAccount, setIsPrivateAccount] = useState(currentUser.privacy.isPrivateAccount);

  // Validation & Feedback
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<'basic' | 'images' | 'appearance' | 'badges' | 'privacy'>('basic');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Real device photo pickers
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, 'avatars');
      setAvatarUrl(url);
    } catch (err) {
      console.warn("Avatar upload fallback:", err);
    }
  };

  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, 'covers');
      setCoverUrl(url);
    } catch (err) {
      console.warn("Cover upload fallback:", err);
    }
  };

  const validateUsername = (newUsername: string) => {
    const clean = newUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(clean);

    if (clean.length < 3) {
      setUsernameError('اسم المستخدم يجب أن يكون ٣ أحرف على الأقل.');
      return false;
    }

    // Check uniqueness across other users
    const isTaken = Object.values(allUsers).some(
      u => u.id !== currentUser.id && u.username.toLowerCase() === clean
    );

    if (isTaken) {
      setUsernameError('اسم المستخدم هذا محجوز مسبقاً، يرجى اختيار اسم آخر.');
      return false;
    }

    setUsernameError(null);
    return true;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUsername(username)) return;

    const updatedTitles = currentUser.titles.map(t => ({
      ...t,
      isDisplayed: selectedTitles.includes(t.id)
    }));

    const updatedBadges = currentUser.badges.map(b => ({
      ...b,
      isDisplayed: selectedBadges.includes(b.id)
    }));

    updateProfile({
      displayName,
      username,
      bio,
      location,
      website,
      statusText,
      avatarUrl,
      coverUrl,
      appearancePreset,
      accentColor,
      titles: updatedTitles,
      badges: updatedBadges,
      privacy: {
        ...currentUser.privacy,
        allowMessagesFrom: allowMessages,
        showOnlineStatus,
        isPrivateAccount
      }
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      goBack();
    }, 1200);
  };

  return (
    <div className="pb-24 max-w-md mx-auto w-full min-h-screen bg-black">
      {/* 1. Header with Back & Save Button */}
      <AndroidTopBar
        title={t.profileEditorTitle}
        showBack={true}
        onBack={goBack}
        rightAction={
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#DFCA98] to-[#C5A46D] text-black font-bold text-xs hover:brightness-105 active:scale-95 transition-all shadow-[0_0_12px_rgba(197,164,109,0.3)]"
          >
            <Save size={14} />
            <span>{t.saveChanges}</span>
          </button>
        }
      />

      {saveSuccess && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check size={16} />
          <span>{t.saveSuccess}</span>
        </div>
      )}

      {/* 2. Organized Section Selector Tabs */}
      <div className="flex items-center gap-1.5 p-3 overflow-x-auto no-scrollbar border-b border-white/[0.08] bg-[#0E0E0E]">
        <button
          onClick={() => setActiveSection('basic')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
            activeSection === 'basic' ? 'bg-[#C5A46D] text-black font-bold' : 'bg-white/5 text-[#A8A8A8] hover:text-white'
          }`}
        >
          {t.basicInfo}
        </button>

        <button
          onClick={() => setActiveSection('images')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
            activeSection === 'images' ? 'bg-[#C5A46D] text-black font-bold' : 'bg-white/5 text-[#A8A8A8] hover:text-white'
          }`}
        >
          {t.profileImages}
        </button>

        <button
          onClick={() => setActiveSection('appearance')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
            activeSection === 'appearance' ? 'bg-[#C5A46D] text-black font-bold' : 'bg-white/5 text-[#A8A8A8] hover:text-white'
          }`}
        >
          {t.appearancePreset}
        </button>

        <button
          onClick={() => setActiveSection('badges')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
            activeSection === 'badges' ? 'bg-[#C5A46D] text-black font-bold' : 'bg-white/5 text-[#A8A8A8] hover:text-white'
          }`}
        >
          {t.badgesAndTitles}
        </button>

        <button
          onClick={() => setActiveSection('privacy')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
            activeSection === 'privacy' ? 'bg-[#C5A46D] text-black font-bold' : 'bg-white/5 text-[#A8A8A8] hover:text-white'
          }`}
        >
          {t.privacySection}
        </button>
      </div>

      {/* 3. Section Content Form */}
      <form onSubmit={handleSave} className="p-4 space-y-5">
        {/* SECTION A: Basic Information */}
        {activeSection === 'basic' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#A8A8A8] mb-1.5">{t.displayName}</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                maxLength={40}
                required
                className="w-full rounded-xl bg-[#141414] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A46D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A8A8A8] mb-1.5">{t.username}</label>
              <div className="relative">
                <span className="absolute start-3 top-2.5 text-xs text-[#8E8E93]">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => validateUsername(e.target.value)}
                  maxLength={25}
                  required
                  className="w-full rounded-xl bg-[#141414] border border-white/10 ps-7 pe-3 py-2.5 text-xs text-white force-ltr focus:outline-none focus:border-[#C5A46D]"
                />
              </div>
              {usernameError && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>{usernameError}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A8A8A8] mb-1.5">{t.statusText}</label>
              <input
                type="text"
                value={statusText}
                onChange={e => setStatusText(e.target.value)}
                placeholder="حالة مختصرة تظهر في المحادثات..."
                maxLength={80}
                className="w-full rounded-xl bg-[#141414] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A46D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A8A8A8] mb-1.5">{t.bio}</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                maxLength={200}
                className="w-full rounded-xl bg-[#141414] border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-[#C5A46D] resize-none leading-relaxed"
              />
              <span className="text-[10px] text-[#8E8E93] force-ltr block text-end mt-1">{bio.length}/200</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#A8A8A8] mb-1.5">{t.location}</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="المدينة / الدولة"
                  className="w-full rounded-xl bg-[#141414] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A46D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A8A8A8] mb-1.5">{t.website}</label>
                <input
                  type="url"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl bg-[#141414] border border-white/10 px-3 py-2 text-xs text-white force-ltr focus:outline-none focus:border-[#C5A46D]"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION B: Profile Images */}
        {activeSection === 'images' && (
          <div className="space-y-5">
            {/* Hidden file inputs for real device photo selection */}
            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverFile}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarFile}
              accept="image/*"
              className="hidden"
            />

            {/* Live Visual Card Preview */}
            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#121212]">
              {/* Cover with change button */}
              <div className="relative h-36 bg-black">
                <img src={coverUrl} alt="Cover preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute bottom-3 end-3 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5 border border-white/20 hover:bg-black/90 active:scale-95"
                >
                  <Camera size={13} />
                  <span>{t.changeCover}</span>
                </button>
              </div>

              {/* Overlapping Avatar */}
              <div className="relative px-4 pb-4 -mt-10 flex items-end justify-between">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full p-1 bg-[#121212] border-2 border-[#C5A46D] overflow-hidden shadow-xl">
                    <img src={avatarUrl} alt="Avatar preview" className="w-full h-full object-cover rounded-full" />
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-0 end-0 w-7 h-7 rounded-full bg-[#C5A46D] text-black flex items-center justify-center shadow-lg active:scale-95"
                    title={t.changeAvatar}
                  >
                    <Camera size={14} />
                  </button>
                </div>

                <span className="text-[11px] text-[#A8A8A8]">معاينة حية للهوية البصرية</span>
              </div>
            </div>

            {/* Preset Avatars & Covers Gallery */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#A8A8A8] block">أو اختر من أعمال ومظاهر أثير الجاهزة:</span>
              <div className="grid grid-cols-4 gap-2">
                {[ART_ASSETS.gothicCastle, ART_ASSETS.nightMountain, ART_ASSETS.techCover, ART_ASSETS.concertStage].map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCoverUrl(img)}
                    className="aspect-video rounded-xl overflow-hidden border border-white/10 hover:border-[#C5A46D] transition-colors"
                  >
                    <img src={img} alt="Preset cover" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION C: Appearance Presets */}
        {activeSection === 'appearance' && (
          <div className="space-y-4">
            <span className="text-xs text-[#A8A8A8] block">
              اختر سمة الهوية البصرية لملفك الشخصي (تنسيق الألوان والبطاقات والأوسمة):
            </span>

            <div className="space-y-2.5">
              {[
                { id: 'obsidian', name: t.obsidianNoir, color: '#C5A46D', bg: 'bg-[#000000]', border: 'border-[#C5A46D]' },
                { id: 'gilded', name: t.gildedBronze, color: '#DFCA98', bg: 'bg-[#0A0704]', border: 'border-[#DFCA98]' },
                { id: 'concrete', name: t.castConcrete, color: '#9CA3AF', bg: 'bg-[#101010]', border: 'border-slate-500' },
                { id: 'midnight', name: t.deepMidnight, color: '#A78BFA', bg: 'bg-[#0B061A]', border: 'border-purple-500' }
              ].map(theme => (
                <div
                  key={theme.id}
                  onClick={() => {
                    setAppearancePreset(theme.id as any);
                    setAccentColor(theme.color);
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    appearancePreset === theme.id
                      ? `${theme.border} bg-white/[0.04] shadow-md`
                      : 'border-white/[0.08] bg-[#121212] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border border-white/20`}
                      style={{ backgroundColor: theme.color }}
                    />
                    <span className="text-xs font-semibold text-white">{theme.name}</span>
                  </div>

                  {appearancePreset === theme.id && (
                    <span className="w-5 h-5 rounded-full bg-[#C5A46D] text-black flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION D: Titles & Badges */}
        {activeSection === 'badges' && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-white block mb-1">الألقاب المفعلة على الملف</span>
              <p className="text-[11px] text-[#8E8E93] mb-3">
                حدد الألقاب المكتسبة التي ترغب بعرضها أعلى ملفك الشخصي:
              </p>

              <div className="space-y-2">
                {currentUser.titles.map(title => {
                  const isChecked = selectedTitles.includes(title.id);
                  return (
                    <label
                      key={title.id}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                        isChecked ? 'border-[#C5A46D] bg-[#C5A46D]/10' : 'border-white/10 bg-[#141414]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <TitleChip icon={title.icon} text={title.textAr} color={title.color as any} size="sm" />
                        {title.isAdministrative && (
                          <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">إداري</span>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedTitles(prev =>
                            prev.includes(title.id) ? prev.filter(id => id !== title.id) : [...prev, title.id]
                          );
                        }}
                        className="accent-[#C5A46D] w-4 h-4"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08]">
              <span className="text-xs font-bold text-white block mb-1">الشارات المعروضة في شريط الإنجازات</span>
              <p className="text-[11px] text-[#8E8E93] mb-3">
                فقط الأوسمة التي كسبتها بالفعل يمكنك عرضها أو إخفاؤها:
              </p>

              <div className="grid grid-cols-2 gap-2">
                {currentUser.badges.map(b => {
                  const isChecked = selectedBadges.includes(b.id);
                  return (
                    <div
                      key={b.id}
                      onClick={() => {
                        setSelectedBadges(prev =>
                          prev.includes(b.id) ? prev.filter(id => id !== b.id) : [...prev, b.id]
                        );
                      }}
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs ${
                        isChecked ? 'border-[#C5A46D] bg-[#C5A46D]/10 text-white' : 'border-white/10 bg-[#141414] text-[#A8A8A8]'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span>{b.icon}</span>
                        <span className="truncate">{b.nameAr}</span>
                      </span>
                      {isChecked && <Check size={12} className="text-[#C5A46D] shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SECTION E: Privacy */}
        {activeSection === 'privacy' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#A8A8A8] mb-1.5">
                من يمكنه إرسال رسائل خاصة إليك؟
              </label>
              <select
                value={allowMessages}
                onChange={e => setAllowMessages(e.target.value as any)}
                className="w-full rounded-xl bg-[#141414] border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A46D]"
              >
                <option value="everyone">الجميع على المنصة</option>
                <option value="following">فقط الأشخاص الذين أتابعهم</option>
                <option value="nobody">لا أحد (إيقاف الرسائل المباشرة)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#141414] border border-white/10">
              <div>
                <span className="text-xs font-semibold text-white block">إظهار حالة الاتصال بالإنترنت</span>
                <span className="text-[11px] text-[#8E8E93]">عرض النقطة الخضراء عند تواجدك في التطبيق</span>
              </div>
              <input
                type="checkbox"
                checked={showOnlineStatus}
                onChange={e => setShowOnlineStatus(e.target.checked)}
                className="accent-[#C5A46D] w-5 h-5"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#141414] border border-white/10">
              <div>
                <span className="text-xs font-semibold text-white block">حساب خاص (Private Account)</span>
                <span className="text-[11px] text-[#8E8E93]">المحتوى مرئي فقط لمن توافق على متابعتهم</span>
              </div>
              <input
                type="checkbox"
                checked={isPrivateAccount}
                onChange={e => setIsPrivateAccount(e.target.checked)}
                className="accent-[#C5A46D] w-5 h-5"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
