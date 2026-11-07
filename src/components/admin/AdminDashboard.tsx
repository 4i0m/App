/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Key,
  ShieldCheck,
  UserCheck,
  Ban,
  Clock,
  ArrowRight,
  Search,
  Filter,
  Sparkles,
  Award,
  Crown,
  Pin,
  Calendar,
  Bell,
  Settings,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  UserX,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  RefreshCw,
  Sliders,
  Check,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AndroidTopBar } from '../common/AndroidTopBar';
import { UserAvatar } from '../common/UserAvatar';
import { VerifiedBadge, TitleChip, LevelBadge } from '../common/BadgePill';
import {
  AdminDashboardSection,
  UserRole,
  VerificationCategory,
  AccountStatus,
  ReportStatus,
  ReportCategory,
  StaffPermissions
} from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    allUsers,
    reports,
    updateReportStatus,
    auditLogs,
    posts,
    events,
    announcements,
    addAnnouncement,
    toggleAnnouncement,
    deleteAnnouncement,
    platformSettings,
    updatePlatformSettings,
    updateWelcomeBanner,
    togglePinPost,
    toggleFeaturePost,
    toggleHidePost,
    deletePost,
    setMemberVerification,
    restrictMemberAccount,
    restoreMemberAccount,
    changeMemberRole,
    assignTitleToUser,
    assignBadgeToUser,
    openAdminProfileMenu,
    openUserProfile,
    hasPermission,
    isOwner,
    goBack,
    t
  } = useApp();

  const [activeSection, setActiveSection] = useState<AdminDashboardSection>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [moderatorNote, setModeratorNote] = useState('');
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // New admin appointment modal state
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [selectedCandidateUserId, setSelectedCandidateUserId] = useState('');
  const [selectedNewRole, setSelectedNewRole] = useState<UserRole>('moderator');

  // Announcement & In-app Ad state
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState(false);
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
  const [newAnnouncementImageUrl, setNewAnnouncementImageUrl] = useState('');
  const [newAnnouncementActionText, setNewAnnouncementActionText] = useState('');
  const [newAnnouncementActionUrl, setNewAnnouncementActionUrl] = useState('');
  const [newAnnouncementType, setNewAnnouncementType] = useState<'banner' | 'modal' | 'feed'>('banner');

  // Welcome banner state
  const [welcomeTitle, setWelcomeTitle] = useState(platformSettings?.welcomeBanner?.title || 'مرحباً بك في Q');
  const [welcomeMessage, setWelcomeMessage] = useState(platformSettings?.welcomeBanner?.message || 'مجتمعك الجديد للتواصل الراقي والمشاركة الحقيقية.');
  const [welcomeEnabled, setWelcomeEnabled] = useState(platformSettings?.welcomeBanner?.enabled ?? true);
  const [welcomeImageUrl, setWelcomeImageUrl] = useState(platformSettings?.welcomeBanner?.imageUrl || '');

  // Filter states
  const [reportsFilter, setReportsFilter] = useState<'all' | 'pending' | 'resolved'>('pending');
  const [memberRoleFilter, setMemberRoleFilter] = useState<string>('all');
  const [bannedFilter, setBannedFilter] = useState<string>('all');
  const [selectedTitleUserId, setSelectedTitleUserId] = useState<string>('');

  const showToast = (msg: string) => {
    setFeedbackBanner(msg);
    setTimeout(() => setFeedbackBanner(null), 3000);
  };

  // Section list items
  const sections: { id: AdminDashboardSection; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: t.adminOverview, icon: <TrendingUp size={16} /> },
    { id: 'members', label: t.membersManagement, icon: <Users size={16} /> },
    { id: 'staff', label: t.staffManagement, icon: <Crown size={16} /> },
    { id: 'roles', label: t.rolesAndPermissions, icon: <Key size={16} /> },
    {
      id: 'reports',
      label: t.reportsManagement,
      icon: <AlertTriangle size={16} />,
      badge: reports.filter(r => r.status === 'pending' || r.status === 'under_review').length
    },
    { id: 'verification', label: t.verificationManagement, icon: <ShieldCheck size={16} /> },
    { id: 'titles_badges', label: t.titlesAndBadges, icon: <Award size={16} /> },
    { id: 'xp_levels', label: t.xpAndLevelsConfig, icon: <Sparkles size={16} /> },
    { id: 'content', label: t.contentManagement, icon: <FileText size={16} /> },
    { id: 'featured', label: t.pinnedAndFeatured, icon: <Pin size={16} /> },
    { id: 'events', label: t.eventsManagement, icon: <Calendar size={16} /> },
    { id: 'announcements', label: t.announcementsManagement, icon: <Bell size={16} /> },
    {
      id: 'banned',
      label: t.bannedAndRestricted,
      icon: <Ban size={16} />,
      badge: Object.values(allUsers).filter(u => u.status !== 'active').length
    },
    { id: 'audit', label: t.auditLogs, icon: <Clock size={16} /> },
    { id: 'settings', label: t.platformSettings, icon: <Settings size={16} /> }
  ];

  const pendingReports = useMemo(
    () => reports.filter(r => r.status === 'pending' || r.status === 'under_review'),
    [reports]
  );
  const resolvedReports = useMemo(
    () => reports.filter(r => r.status === 'resolved' || r.status === 'rejected'),
    [reports]
  );
  const suspendedUsers = useMemo(
    () => Object.values(allUsers).filter(u => u.status !== 'active'),
    [allUsers]
  );
  const verifiedUsers = useMemo(
    () => Object.values(allUsers).filter(u => u.isVerified),
    [allUsers]
  );
  const staffUsers = useMemo(
    () => Object.values(allUsers).filter(u => u.role !== 'user'),
    [allUsers]
  );

  const selectedReport = reports.find(r => r.id === selectedReportId);

  const handleReportAction = (status: ReportStatus, actionName: string) => {
    if (!selectedReportId) return;
    updateReportStatus(selectedReportId, status, moderatorNote, actionName);
    setSelectedReportId(null);
    setModeratorNote('');
    showToast(`تم تحديث البلاغ بنجاح: ${actionName}`);
  };

  const handleAddAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidateUserId) return;
    changeMemberRole(selectedCandidateUserId, selectedNewRole);
    setShowAddAdminModal(false);
    setSelectedCandidateUserId('');
    showToast('تم تعيين المشرف الجديد بنجاح في المنظومة الأمنية');
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementTitle.trim() || !newAnnouncementContent.trim()) return;
    addAnnouncement({
      title: newAnnouncementTitle,
      content: newAnnouncementContent,
      type: newAnnouncementType,
      imageUrl: newAnnouncementImageUrl.trim() || undefined,
      actionText: newAnnouncementActionText.trim() || undefined,
      actionUrl: newAnnouncementActionUrl.trim() || undefined,
      targetRole: 'all',
      isActive: true
    });
    setNewAnnouncementTitle('');
    setNewAnnouncementContent('');
    setNewAnnouncementImageUrl('');
    setNewAnnouncementActionText('');
    setNewAnnouncementActionUrl('');
    setShowAddAnnouncementModal(false);
    showToast('تم نشر الإعلان الترويجي / الرسمي بنجاح');
  };

  const handleSaveWelcomeBanner = (e: React.FormEvent) => {
    e.preventDefault();
    updateWelcomeBanner({
      enabled: welcomeEnabled,
      title: welcomeTitle,
      message: welcomeMessage,
      imageUrl: welcomeImageUrl.trim() || undefined,
      targetAudience: 'all'
    });
    showToast('تم تحديث بنر الترحيب الرئيسي ونشره فوراً');
  };

  return (
    <div className="pb-28 max-w-md mx-auto w-full min-h-screen bg-black text-white select-none">
      {/* Top Bar */}
      <AndroidTopBar
        title={t.adminDashboard}
        showBack={true}
        onBack={goBack}
        rightAction={
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#C5A46D]/15 border border-[#C5A46D]/30 text-[10px] text-[#C5A46D] font-bold">
            <Crown size={12} />
            <span>{currentUser.role === 'owner' ? 'المالك الأعلى' : 'طاقم الإدارة'}</span>
          </div>
        }
      />

      {/* Floating feedback toast */}
      {feedbackBanner && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-[#191919] border border-[#C5A46D] text-xs font-semibold text-[#DFCA98] shadow-2xl animate-in fade-in flex items-center gap-2">
          <CheckCircle2 size={15} className="text-[#C5A46D]" />
          <span>{feedbackBanner}</span>
        </div>
      )}

      {/* Section Selector Horizontal Carousel */}
      <div className="sticky top-12 z-20 bg-black/95 backdrop-blur-md border-b border-white/[0.08] px-3 py-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {sections.map(s => {
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#DFCA98] to-[#C5A46D] text-black font-bold shadow-[0_0_12px_rgba(197,164,109,0.35)]'
                    : 'bg-[#141414] text-[#A8A8A8] hover:text-white hover:bg-white/10 border border-white/[0.06]'
                }`}
              >
                {s.icon}
                <span>{s.label}</span>
                {typeof s.badge === 'number' && s.badge > 0 && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-black text-[#C5A46D]' : 'bg-red-500/80 text-white'
                    }`}
                  >
                    {s.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Section Content */}
      <div className="p-4 space-y-4">
        {/* ========================================================= */}
        {/* SECTION 1: OVERVIEW */}
        {/* ========================================================= */}
        {activeSection === 'overview' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-[#121212] border border-white/[0.08]">
                <div className="flex items-center justify-between text-[#8E8E93] text-[11px] mb-1">
                  <span>إجمالي الأعضاء</span>
                  <Users size={14} className="text-[#C5A46D]" />
                </div>
                <span className="text-2xl font-bold text-white force-ltr block">
                  {Object.keys(allUsers).length}
                </span>
                <span className="text-[10px] text-emerald-400">● 100% نشط محلياً</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#121212] border border-white/[0.08]">
                <div className="flex items-center justify-between text-[#8E8E93] text-[11px] mb-1">
                  <span>البلاغات المعلقة</span>
                  <AlertTriangle size={14} className="text-amber-400" />
                </div>
                <span className="text-2xl font-bold text-amber-400 force-ltr block">
                  {pendingReports.length}
                </span>
                <span className="text-[10px] text-[#8E8E93]">تحتاج مراجعة فورية</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#121212] border border-white/[0.08]">
                <div className="flex items-center justify-between text-[#8E8E93] text-[11px] mb-1">
                  <span>الحسابات الموثقة</span>
                  <ShieldCheck size={14} className="text-blue-400" />
                </div>
                <span className="text-2xl font-bold text-blue-400 force-ltr block">
                  {verifiedUsers.length}
                </span>
                <span className="text-[10px] text-[#8E8E93]">هويات رسمية وصناع</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#121212] border border-white/[0.08]">
                <div className="flex items-center justify-between text-[#8E8E93] text-[11px] mb-1">
                  <span>طاقم الإدارة</span>
                  <Crown size={14} className="text-purple-400" />
                </div>
                <span className="text-2xl font-bold text-[#A78BFA] force-ltr block">
                  {staffUsers.length}
                </span>
                <span className="text-[10px] text-[#8E8E93]">بقيادة المالك</span>
              </div>
            </div>

            {/* Quick Action Bar */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#18150F] to-[#121212] border border-[#C5A46D]/30 space-y-2">
              <span className="text-xs font-bold text-[#C5A46D] flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>إجراءات إدارية سريعة</span>
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setActiveSection('reports')}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/[0.08] text-start transition-all"
                >
                  <span className="font-bold text-amber-300 block">فحص البلاغات ({pendingReports.length})</span>
                  <span className="text-[10px] text-[#8E8E93]">متابعة المحتوى المخالف</span>
                </button>
                <button
                  onClick={() => setActiveSection('staff')}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/[0.08] text-start transition-all"
                >
                  <span className="font-bold text-white block">إدارة الطاقم</span>
                  <span className="text-[10px] text-[#8E8E93]">ترقية وتعديل الصلاحيات</span>
                </button>
                <button
                  onClick={() => setActiveSection('announcements')}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/[0.08] text-start transition-all"
                >
                  <span className="font-bold text-blue-300 block">إعلان رسمي</span>
                  <span className="text-[10px] text-[#8E8E93]">بث تنبيه لكل الشبكة</span>
                </button>
                <button
                  onClick={() => setActiveSection('audit')}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/[0.08] text-start transition-all"
                >
                  <span className="font-bold text-[#DFCA98] block">سجل التدقيق</span>
                  <span className="text-[10px] text-[#8E8E93]">مراقبة أفعال المشرفين</span>
                </button>
              </div>
            </div>

            {/* Recent Audit Feed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-white">{t.recentAdminActions}</span>
                <button
                  onClick={() => setActiveSection('audit')}
                  className="text-[#C5A46D] text-[11px] hover:underline"
                >
                  {t.viewAll} ←
                </button>
              </div>
              <div className="space-y-2">
                {auditLogs.slice(0, 4).map(log => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-[#121212] border border-white/[0.06] text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-white block">{log.action}</span>
                      <span className="text-[10px] text-[#8E8E93]">
                        بواسطة: {log.actorName} · الهدف: {log.target}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8E8E93] force-ltr">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 2: MEMBERS MANAGEMENT */}
        {/* ========================================================= */}
        {activeSection === 'members' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* Search and Role Filter */}
            <div className="space-y-2">
              <div className="relative flex items-center">
                <Search size={15} className="absolute start-3 text-[#8E8E93]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم أو المعرف @..."
                  className="w-full bg-[#141414] border border-white/10 rounded-xl ps-9 pe-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A46D]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {['all', 'user', 'moderator', 'senior_moderator', 'admin', 'super_admin', 'owner'].map(role => (
                  <button
                    key={role}
                    onClick={() => setMemberRoleFilter(role)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      memberRoleFilter === role
                        ? 'bg-[#C5A46D] text-black font-bold'
                        : 'bg-[#141414] text-[#8E8E93] hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    {role === 'all' ? 'الكل' : role}
                  </button>
                ))}
              </div>
            </div>

            {/* Members List */}
            <div className="space-y-2">
              {Object.values(allUsers)
                .filter(u => {
                  const matchQuery =
                    !searchQuery ||
                    u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    u.username.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchRole = memberRoleFilter === 'all' || u.role === memberRoleFilter;
                  return matchQuery && matchRole;
                })
                .map(member => (
                  <div
                    key={member.id}
                    className="p-3 rounded-2xl bg-[#121212] border border-white/[0.08] flex items-center justify-between"
                  >
                    <div
                      className="flex items-center gap-2.5 cursor-pointer min-w-0"
                      onClick={() => openUserProfile(member.id)}
                    >
                      <UserAvatar
                        userId={member.id}
                        avatarUrl={member.avatarUrl}
                        name={member.displayName}
                        size="sm"
                        clickable={false}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs truncate">
                            {member.displayName}
                          </span>
                          {member.isVerified && (
                            <VerifiedBadge size={13} category={member.verificationCategory} />
                          )}
                        </div>
                        <span className="text-[10px] text-[#8E8E93] force-ltr block">
                          @{member.username} · Lv.{member.level}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          member.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {member.status}
                      </span>

                      {/* Staff Actions Drawer trigger */}
                      <button
                        onClick={() => openAdminProfileMenu(member)}
                        className="px-2.5 py-1 rounded-xl bg-[#C5A46D]/15 hover:bg-[#C5A46D]/25 border border-[#C5A46D]/30 text-xs font-semibold text-[#DFCA98] transition-all"
                        title="إجراءات المشرف على هذا العضو"
                      >
                        إدارة
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 3: ADMINISTRATORS & STAFF */}
        {/* ========================================================= */}
        {activeSection === 'staff' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header info card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1C160C] to-[#121212] border border-[#C5A46D]/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C5A46D] flex items-center gap-1.5">
                  <Crown size={15} />
                  <span>طاقم إدارة Q الأعلى</span>
                </span>
                {isOwner() && (
                  <button
                    onClick={() => setShowAddAdminModal(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#C5A46D] text-black font-bold text-[11px] hover:brightness-105 active:scale-95 transition-all shadow-sm"
                  >
                    <Plus size={13} />
                    <span>تعيين مشرف</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#A8A8A8] leading-relaxed">
                يملك المالك (Alexander) السلطة المطلقة لتعيين وعزل المشرفين. لا يمكن لأي مشرف ترقية نفسه أو تجاوز الصلاحيات الممنوحة له.
              </p>
            </div>

            {/* Staff Hierarchy list */}
            <div className="space-y-2.5">
              {staffUsers.map(staff => (
                <div
                  key={staff.id}
                  className="p-3.5 rounded-2xl bg-[#121212] border border-white/[0.08] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-2.5 cursor-pointer"
                      onClick={() => openUserProfile(staff.id)}
                    >
                      <UserAvatar
                        userId={staff.id}
                        avatarUrl={staff.avatarUrl}
                        name={staff.displayName}
                        size="md"
                        clickable={false}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs">{staff.displayName}</span>
                          <VerifiedBadge size={14} category={staff.verificationCategory} />
                        </div>
                        <span className="text-[10px] text-[#8E8E93] force-ltr block">
                          @{staff.username}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                        staff.role === 'owner'
                          ? 'bg-[#C5A46D] text-black'
                          : staff.role === 'super_admin'
                          ? 'bg-[#C5A46D]/20 text-[#DFCA98] border border-[#C5A46D]/40'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {staff.role}
                    </span>
                  </div>

                  {/* Staff capabilities & action buttons for Owner */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-xs">
                    <span className="text-[10px] text-[#8E8E93]">
                      الصلاحيات: {staff.role === 'owner' ? 'مطلقة (Super Root)' : 'مفوضة'}
                    </span>

                    {isOwner() && staff.role !== 'owner' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            changeMemberRole(staff.id, 'user');
                            showToast(`تم إنهاء مهام المشرف @${staff.username}`);
                          }}
                          className="px-2 py-0.8 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 text-[10px] font-semibold transition-all"
                        >
                          تجريد من الرتبة
                        </button>
                        <button
                          onClick={() => openAdminProfileMenu(staff)}
                          className="px-2 py-0.8 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[10px] font-semibold transition-all"
                        >
                          تعديل الصلاحيات
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal for Appointing New Admin */}
            {showAddAdminModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
                <form
                  onSubmit={handleAddAdminSubmit}
                  className="w-full max-w-sm rounded-3xl bg-[#191919] border border-white/10 p-5 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Crown size={16} className="text-[#C5A46D]" />
                      <span>تعيين مشرف جديد</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddAdminModal(false)}
                      className="text-white/60 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[#8E8E93] text-[11px] mb-1">
                        اختر عضواً مسجلاً:
                      </label>
                      <select
                        value={selectedCandidateUserId}
                        onChange={e => setSelectedCandidateUserId(e.target.value)}
                        required
                        className="w-full bg-[#121212] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#C5A46D]"
                      >
                        <option value="">-- اضغط لاختيار العضو --</option>
                        {Object.values(allUsers)
                          .filter(u => u.role === 'user')
                          .map(u => (
                            <option key={u.id} value={u.id}>
                              {u.displayName} (@{u.username})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#8E8E93] text-[11px] mb-1">
                        الرتبة الإدارية المقترحة:
                      </label>
                      <select
                        value={selectedNewRole}
                        onChange={e => setSelectedNewRole(e.target.value as UserRole)}
                        className="w-full bg-[#121212] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#C5A46D]"
                      >
                        <option value="assistant">مساعد (Assistant)</option>
                        <option value="moderator">مشرف (Moderator)</option>
                        <option value="senior_moderator">مشرف أول (Senior Moderator)</option>
                        <option value="admin">إداري (Administrator)</option>
                        <option value="super_admin">مشرف عام (Super Administrator)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#DFCA98] to-[#C5A46D] text-black font-bold text-xs hover:brightness-105 active:scale-95 transition-all shadow-md"
                  >
                    تأكيد التعيين الإداري
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 4: ROLES & PERMISSIONS MATRIX */}
        {/* ========================================================= */}
        {activeSection === 'roles' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-2xl bg-[#121212] border border-white/[0.08] text-xs text-[#A8A8A8] space-y-1">
              <span className="font-bold text-white block">مصفوفة الصلاحيات والحوكمة الأمنية</span>
              <p className="text-[11px]">
                توزيع صلاحيات المنصة الحصري على الرتب السبع وفق معيار الحماية الصارم:
              </p>
            </div>

            <div className="space-y-2">
              {[
                {
                  role: 'owner',
                  label: 'المالك (Owner)',
                  color: 'text-[#C5A46D]',
                  desc: 'كامل الصلاحيات دون استثناء. حق تعيين وعزل الطاقم وحذف المحتوى وتعديل الإعدادات الجذرية.'
                },
                {
                  role: 'super_admin',
                  label: 'مشرف عام (Super Admin)',
                  color: 'text-[#DFCA98]',
                  desc: 'إدارة البلاغات، حظر الحسابات، توثيق الأعضاء، منح الألقاب، تثبيت المنشورات، ومراقبة الطاقم.'
                },
                {
                  role: 'senior_moderator',
                  label: 'مشرف أول (Senior Mod)',
                  color: 'text-purple-400',
                  desc: 'مراجعة البلاغات المعقدة، كتم وحظر مؤقت للمخالفين، حذف المنشورات المسيئة، وإدارة الفعاليات.'
                },
                {
                  role: 'moderator',
                  label: 'مشرف (Moderator)',
                  color: 'text-blue-400',
                  desc: 'إخفاء المنشورات المخالفة، توجيه الإنذارات، مراجعة تقارير المستخدمين الأولية.'
                },
                {
                  role: 'assistant',
                  label: 'مساعد (Assistant)',
                  color: 'text-teal-400',
                  desc: 'فرز البلاغات وتصنيفها، إرسال التنبيهات الودية، مساعدة الأعضاء الجدد.'
                },
                {
                  role: 'user',
                  label: 'عضو مسجل (Member)',
                  color: 'text-[#8E8E93]',
                  desc: 'النشر، التعليق، التفاعل، المشاركة في الفعاليات ورفع البلاغات للإدارة.'
                }
              ].map(item => (
                <div
                  key={item.role}
                  className="p-3 rounded-2xl bg-[#121212] border border-white/[0.06] space-y-1 text-xs"
                >
                  <span className={`font-bold ${item.color} block`}>{item.label}</span>
                  <p className="text-[11px] text-[#A8A8A8] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 5: REPORTS & MODERATION */}
        {/* ========================================================= */}
        {activeSection === 'reports' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* Filter Chips */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReportsFilter('pending')}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                  reportsFilter === 'pending'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-[#141414] text-[#8E8E93] border border-white/[0.06]'
                }`}
              >
                المعلقة ({pendingReports.length})
              </button>
              <button
                onClick={() => setReportsFilter('resolved')}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                  reportsFilter === 'resolved'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-[#141414] text-[#8E8E93] border border-white/[0.06]'
                }`}
              >
                المعالجة ({resolvedReports.length})
              </button>
              <button
                onClick={() => setReportsFilter('all')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                  reportsFilter === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#141414] text-[#8E8E93] border border-white/[0.06]'
                }`}
              >
                الكل
              </button>
            </div>

            {/* Reports List */}
            <div className="space-y-2.5">
              {reports
                .filter(r => {
                  if (reportsFilter === 'pending')
                    return r.status === 'pending' || r.status === 'under_review';
                  if (reportsFilter === 'resolved')
                    return r.status === 'resolved' || r.status === 'rejected';
                  return true;
                })
                .map(report => (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReportId(report.id)}
                    className="p-3.5 rounded-2xl bg-[#121212] border border-white/[0.08] hover:border-[#C5A46D]/40 transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <AlertTriangle size={13} className="text-amber-400" />
                        <span>بلاغ عن {report.targetType}</span>
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          report.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300'
                            : report.status === 'resolved'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-white/10 text-white/70'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>

                    <p className="text-xs text-white font-medium truncate">
                      "{report.targetTitleOrSnippet}"
                    </p>

                    <p className="text-[11px] text-[#A8A8A8]">
                      السبب: <span className="text-amber-200">{report.category}</span> ·{' '}
                      {report.explanation}
                    </p>

                    <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.04] text-[10px] text-[#8E8E93]">
                      <span>المُبلِغ: {report.reporterName}</span>
                      <span className="force-ltr">{report.timestamp}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 6: VERIFICATION MANAGEMENT */}
        {/* ========================================================= */}
        {activeSection === 'verification' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-2xl bg-[#121212] border border-white/[0.08] text-xs text-[#A8A8A8] space-y-1">
              <span className="font-bold text-[#C5A46D] block">نظام التوثيق المتعدد للفئات (X-Style)</span>
              <p className="text-[11px]">
                توثيق الحسابات بالعلامات الذهبية، الزرقاء، ودرع المنظمات لمنح المصداقية وحماية الهوية:
              </p>
            </div>

            <div className="space-y-2">
              {Object.values(allUsers).map(user => (
                <div
                  key={user.id}
                  className="p-3 rounded-2xl bg-[#121212] border border-white/[0.06] flex items-center justify-between"
                >
                  <div
                    className="flex items-center gap-2.5 cursor-pointer"
                    onClick={() => openUserProfile(user.id)}
                  >
                    <UserAvatar
                      userId={user.id}
                      avatarUrl={user.avatarUrl}
                      name={user.displayName}
                      size="sm"
                      clickable={false}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">{user.displayName}</span>
                        {user.isVerified && (
                          <VerifiedBadge size={13} category={user.verificationCategory} />
                        )}
                      </div>
                      <span className="text-[10px] text-[#8E8E93] force-ltr block">
                        @{user.username}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {user.isVerified ? (
                      <button
                        onClick={() => {
                          setMemberVerification(user.id, false);
                          showToast(`تم سحب التوثيق من @${user.username}`);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 text-[11px] font-semibold"
                      >
                        سحب التوثيق
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setMemberVerification(
                            user.id,
                            true,
                            'creator_professional',
                            'معتمد من الإدارة'
                          );
                          showToast(`تم توثيق حساب @${user.username}`);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[11px] font-semibold"
                      >
                        توثيق الحساب
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 7: TITLES & BADGES */}
        {/* ========================================================= */}
        {activeSection === 'titles_badges' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-2xl bg-[#121212] border border-white/[0.08] text-xs space-y-1">
              <span className="font-bold text-[#C5A46D] block">الألقاب والشارات التكريمية (Amino Style)</span>
              <p className="text-[11px] text-[#A8A8A8]">
                الألقاب تُعرض مباشرة على واجهة الملف الشخصي للأعضاء وتمنح التقدير والتميز الاجتماعي.
              </p>
            </div>

            {/* Quick Title Grant */}
            <div className="p-3.5 rounded-2xl bg-[#141414] border border-[#C5A46D]/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white block">منح لقب سريع لعضو</span>
                <span className="text-[10px] text-[#A8A8A8]">اختر العضو المستهدف</span>
              </div>

              {/* Real User Selector */}
              <select
                value={selectedTitleUserId || Object.keys(allUsers)[0] || ''}
                onChange={e => setSelectedTitleUserId(e.target.value)}
                className="w-full bg-[#1F1F1F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A46D]"
              >
                {Object.values(allUsers).map(u => (
                  <option key={u.id} value={u.id}>
                    {u.displayName} (@{u.username})
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { text: '🔮 مميز', color: 'purple', icon: '🔮' },
                  { text: '👑 المؤسس', color: 'gold', icon: '👑' },
                  { text: '🌟 مبدع الأسبوع', color: 'gold', icon: '🌟' },
                  { text: '⚔️ مشرف رسمي', color: 'purple', icon: '⚔️' }
                ].map(item => {
                  const targetUser = allUsers[selectedTitleUserId] || Object.values(allUsers)[0];
                  return (
                    <button
                      key={item.text}
                      disabled={!targetUser}
                      onClick={() => {
                        if (!targetUser) return;
                        assignTitleToUser(targetUser.id, {
                          textAr: item.text,
                          textEn: item.text,
                          icon: item.icon,
                          color: item.color
                        });
                        showToast(`تم منح لقب [ ${item.text} ] للعضو ${targetUser.displayName}`);
                      }}
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-[#C5A46D]/15 border border-white/[0.06] text-start transition-all disabled:opacity-40"
                    >
                      <span className="font-bold text-white text-[11px] block">{item.text}</span>
                      <span className="text-[9px] text-[#8E8E93] truncate block">
                        منح إلى {targetUser?.displayName || 'عضو'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 8: LEVELS & XP CONFIGURATION */}
        {/* ========================================================= */}
        {activeSection === 'xp_levels' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-2xl bg-[#121212] border border-white/[0.08] text-xs space-y-2">
              <span className="font-bold text-[#C5A46D] block flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>إعدادات ميكانيكا الخبرة (XP) والمستويات</span>
              </span>
              <p className="text-[11px] text-[#A8A8A8]">
                تحديد معدل اكتساب نقاط الخبرة عند التفاعل مع المنصة:
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/[0.08] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">نقاط الخبرة لكل منشور</span>
                  <span className="text-[10px] text-[#8E8E93]">اكتساب تلقائي عند النشر</span>
                </div>
                <span className="text-base font-bold text-[#C5A46D] force-ltr">
                  +{platformSettings.xpPerPost} XP
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/[0.08] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">نقاط الخبرة لكل تعليق</span>
                  <span className="text-[10px] text-[#8E8E93]">تشجيع النقاش الاجتماعي البناء</span>
                </div>
                <span className="text-base font-bold text-blue-400 force-ltr">
                  +{platformSettings.xpPerComment} XP
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/[0.08] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">مكافأة الفوز بالفعاليات</span>
                  <span className="text-[10px] text-[#8E8E93]">تمنح للمراكز الأولى</span>
                </div>
                <span className="text-base font-bold text-amber-400 force-ltr">
                  +{platformSettings.xpPerEventWin} XP
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 9: CONTENT MANAGEMENT */}
        {/* ========================================================= */}
        {activeSection === 'content' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="p-3 rounded-2xl bg-[#121212] border border-white/[0.08] text-xs text-[#A8A8A8]">
              إدارة منشورات الشبكة، إخفاء المحتوى المخالف، أو حذفه بشكل دائم:
            </div>

            <div className="space-y-2.5">
              {posts.map(post => (
                <div
                  key={post.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    post.isHidden
                      ? 'bg-red-500/[0.06] border-red-500/30'
                      : 'bg-[#121212] border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-white">{post.authorName}</span>
                    <div className="flex items-center gap-1.5">
                      {post.isPinned && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#C5A46D]/20 text-[#DFCA98]">
                          مثبت
                        </span>
                      )}
                      {post.isFeatured && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                          مميز
                        </span>
                      )}
                      {post.isHidden && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300">
                          مخفي
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#E5E5E5] line-clamp-2 mb-2">{post.content}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-xs">
                    <span className="text-[10px] text-[#8E8E93] force-ltr">{post.timestamp}</span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          toggleHidePost(post.id);
                          showToast(post.isHidden ? 'تم إلغاء إخفاء المنشور' : 'تم إخفاء المنشور عن العامة');
                        }}
                        className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[11px] font-semibold flex items-center gap-1"
                      >
                        {post.isHidden ? <Eye size={12} /> : <EyeOff size={12} />}
                        <span>{post.isHidden ? 'إظهار' : 'إخفاء'}</span>
                      </button>

                      <button
                        onClick={() => {
                          deletePost(post.id);
                          showToast('تم حذف المنشور نهائياً');
                        }}
                        className="px-2.5 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 10: PINNED & FEATURED CONTENT */}
        {/* ========================================================= */}
        {activeSection === 'featured' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="p-3 rounded-2xl bg-[#121212] border border-white/[0.08] text-xs text-[#A8A8A8]">
              التحكم في المنشورات المثبتة على قمة المنصة وفي تبويب استكشف:
            </div>

            <div className="space-y-2.5">
              {posts.map(post => (
                <div
                  key={post.id}
                  className="p-3.5 rounded-2xl bg-[#121212] border border-white/[0.08] flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1 pe-3">
                    <span className="text-xs font-bold text-white block truncate">
                      {post.authorName}: {post.content}
                    </span>
                    <span className="text-[10px] text-[#8E8E93] force-ltr block">
                      {post.likesCount} إعجاب · {post.commentsCount} تعليق
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        togglePinPost(post.id);
                        showToast(post.isPinned ? 'تم إلغاء التثبيت' : 'تم تثبيت المنشور');
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 ${
                        post.isPinned
                          ? 'bg-[#C5A46D] text-black font-bold'
                          : 'bg-white/10 text-white hover:bg-white/15'
                      }`}
                    >
                      <Pin size={12} />
                      <span>{post.isPinned ? 'مثبت' : 'تثبيت'}</span>
                    </button>

                    <button
                      onClick={() => {
                        toggleFeaturePost(post.id);
                        showToast(post.isFeatured ? 'تم إلغاء التمييز' : 'تم تمييز المنشور عالمياً');
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 ${
                        post.isFeatured
                          ? 'bg-blue-500 text-white font-bold'
                          : 'bg-white/10 text-white hover:bg-white/15'
                      }`}
                    >
                      <Sparkles size={12} />
                      <span>{post.isFeatured ? 'مميز' : 'تمييز'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 11: EVENTS MANAGEMENT */}
        {/* ========================================================= */}
        {activeSection === 'events' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-2xl bg-[#121212] border border-white/[0.08] text-xs text-[#A8A8A8] space-y-1">
              <span className="font-bold text-[#C5A46D] block">إدارة فعاليات ومسابقات مجتمع Q</span>
              <p className="text-[11px]">
                متابعة الفعاليات العامة، مسابقات التصميم، وتحديات الألعاب وتحديث حالاتها:
              </p>
            </div>

            <div className="space-y-2.5">
              {events.map(ev => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-2xl bg-[#121212] border border-white/[0.08] space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{ev.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5A46D]/20 text-[#DFCA98] font-bold">
                      {ev.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8E8E93]">{ev.subtitle}</p>
                  <div className="flex items-center justify-between text-[10px] text-[#8E8E93] pt-1 border-t border-white/[0.04]">
                    <span>المشاركون: {ev.registeredCount} مسجل</span>
                    <span>{ev.dateStr}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 12: PLATFORM ANNOUNCEMENTS & IN-APP ADS */}
        {/* ========================================================= */}
        {activeSection === 'announcements' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">الإعلانات الرسمية والترويجية</span>
                <span className="text-[10px] text-[#8E8E93]">بث إعلانات تظهر لجميع المستخدمين في التغذية الرئيسية</span>
              </div>
              <button
                onClick={() => setShowAddAnnouncementModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#C5A46D] text-black font-bold text-xs hover:brightness-105 transition-all shadow-md shrink-0"
              >
                <Plus size={13} />
                <span>إعلان جديد</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {announcements.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8E8E93] rounded-2xl bg-[#121212] border border-white/[0.06]">
                  لا توجد إعلانات منشورة حالياً. يمكنك إنشاء إعلان ترويجي أو توجيه رسمي للأعضاء.
                </div>
              ) : (
                announcements.map(ann => (
                  <div
                    key={ann.id}
                    className="p-3.5 rounded-2xl bg-[#121212] border border-white/[0.08] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Bell size={13} className="text-[#C5A46D]" />
                        <span>{ann.title}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            toggleAnnouncement(ann.id);
                            showToast('تم تعديل حالة الإعلان');
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            ann.isActive
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-white/10 text-white/50'
                          }`}
                        >
                          {ann.isActive ? 'نشط' : 'معطل'}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) {
                              deleteAnnouncement(ann.id);
                              showToast('تم حذف الإعلان');
                            }
                          }}
                          className="text-white/40 hover:text-red-400 p-1 transition-colors"
                          title="حذف الإعلان"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-[#E5E5E5]">{ann.content}</p>

                    {ann.imageUrl && (
                      <div className="rounded-lg overflow-hidden border border-white/10 max-h-36">
                        <img src={ann.imageUrl} alt="Ad Preview" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {ann.actionUrl && (
                      <div className="text-[11px] text-[#C5A46D] flex items-center gap-1">
                        <span>زر التوجيه: {ann.actionText || 'زيارة'} ←</span>
                        <span className="text-[10px] text-white/40 truncate max-w-[180px] force-ltr">{ann.actionUrl}</span>
                      </div>
                    )}

                    <div className="text-[10px] text-[#8E8E93] pt-1 border-t border-white/[0.04]">
                      بواسطة: {ann.authorName} · {ann.timestamp}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal for Creating Announcement / In-App Ad */}
            {showAddAnnouncementModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
                <form
                  onSubmit={handleCreateAnnouncement}
                  className="w-full max-w-sm rounded-3xl bg-[#191919] border border-white/10 p-5 shadow-2xl space-y-3 my-auto"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                    <h3 className="font-bold text-white text-sm">إنشاء إعلان ترويجي أو رسمي</h3>
                    <button
                      type="button"
                      onClick={() => setShowAddAnnouncementModal(false)}
                      className="text-white/60 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#8E8E93] mb-1">عنوان الإعلان:</label>
                    <input
                      type="text"
                      value={newAnnouncementTitle}
                      onChange={e => setNewAnnouncementTitle(e.target.value)}
                      placeholder="مثال: ترقية حسابك إلى العضوية الذهبية..."
                      required
                      className="w-full bg-[#121212] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#C5A46D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#8E8E93] mb-1">نص ومحتوى الإعلان:</label>
                    <textarea
                      value={newAnnouncementContent}
                      onChange={e => setNewAnnouncementContent(e.target.value)}
                      placeholder="اكتب تفاصيل الإعلان أو الترويج..."
                      rows={3}
                      required
                      className="w-full bg-[#121212] border border-white/10 rounded-xl p-2.5 text-xs text-white resize-none focus:outline-none focus:border-[#C5A46D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#8E8E93] mb-1">رابط صورة البنر (اختياري):</label>
                    <input
                      type="url"
                      value={newAnnouncementImageUrl}
                      onChange={e => setNewAnnouncementImageUrl(e.target.value)}
                      placeholder="https://example.com/banner.jpg"
                      className="w-full bg-[#121212] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#C5A46D] force-ltr"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-[#8E8E93] mb-1">نص الزر (CTA):</label>
                      <input
                        type="text"
                        value={newAnnouncementActionText}
                        onChange={e => setNewAnnouncementActionText(e.target.value)}
                        placeholder="مثال: اشترك الآن"
                        className="w-full bg-[#121212] border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#C5A46D]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#8E8E93] mb-1">رابط الزر (URL):</label>
                      <input
                        type="url"
                        value={newAnnouncementActionUrl}
                        onChange={e => setNewAnnouncementActionUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-[#121212] border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#C5A46D] force-ltr"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#C5A46D] text-black font-bold text-xs hover:brightness-105 transition-all shadow-md mt-2"
                  >
                    بث الإعلان لجميع المستخدمين فوراً
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 13: BANNED & RESTRICTED USERS */}
        {/* ========================================================= */}
        {activeSection === 'banned' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-2xl bg-[#121212] border border-white/[0.08] text-xs text-[#A8A8A8] space-y-1">
              <span className="font-bold text-red-400 block">الحسابات المحظورة والمقيدة</span>
              <p className="text-[11px]">
                إدارة العقوبات، الإنذارات، الحظر المؤقت والدائم، وإمكانية رفع العقوبة:
              </p>
            </div>

            {suspendedUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8E8E93] rounded-2xl bg-[#121212] border border-white/[0.06]">
                لا توجد حسابات معلقة أو محظورة حالياً. الشبكة آمنة ونظيفة.
              </div>
            ) : (
              suspendedUsers.map(user => (
                <div
                  key={user.id}
                  className="p-3.5 rounded-2xl bg-[#121212] border border-red-500/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        userId={user.id}
                        avatarUrl={user.avatarUrl}
                        name={user.displayName}
                        size="sm"
                        clickable={false}
                      />
                      <div>
                        <span className="font-bold text-white text-xs">{user.displayName}</span>
                        <span className="text-[10px] text-[#8E8E93] force-ltr block">
                          @{user.username}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold uppercase">
                      {user.status}
                    </span>
                  </div>

                  {user.restrictionDetails && (
                    <p className="text-[11px] text-amber-200/90 bg-black/40 p-2 rounded-xl">
                      السبب: {user.restrictionDetails.reason} (بواسطة:{' '}
                      {user.restrictionDetails.issuedBy})
                    </p>
                  )}

                  <button
                    onClick={() => {
                      restoreMemberAccount(user.id);
                      showToast(`تم رفع العقوبة واستعادة حساب @${user.username}`);
                    }}
                    className="w-full py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs transition-all"
                  >
                    رفع العقوبة واستعادة الحساب فوراً
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 14: AUDIT LOGS */}
        {/* ========================================================= */}
        {activeSection === 'audit' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="p-3 rounded-2xl bg-[#121212] border border-white/[0.08] text-xs text-[#A8A8A8]">
              سجل التدقيق الإداري غير القابل للتعديل لتوثيق إجراءات الحوكمة الأمنية:
            </div>

            <div className="space-y-2">
              {auditLogs.map(log => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-[#121212] border border-white/[0.06] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#C5A46D]">{log.action}</span>
                    <span className="text-[10px] text-[#8E8E93] force-ltr">{log.timestamp}</span>
                  </div>
                  <p className="text-[#EDEDED]">
                    بواسطة:{' '}
                    <span className="text-white font-semibold">
                      {log.actorName} ({log.actorRole})
                    </span>
                  </p>
                  <p className="text-[11px] text-[#8E8E93]">الهدف: {log.target}</p>
                  {log.reason && <p className="text-[11px] text-amber-300/80">السبب: {log.reason}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 15: PLATFORM SETTINGS */}
        {/* ========================================================= */}
        {activeSection === 'settings' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-2xl bg-[#121212] border border-white/[0.08] text-xs space-y-1">
              <span className="font-bold text-[#C5A46D] block">إعدادات المنصة المركزية</span>
              <p className="text-[11px] text-[#A8A8A8]">
                التحكم في خيارات التسجيل، نمط الصيانة، والتخصيص العام:
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#121212] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">السماح بتسجيل أعضاء جدد</span>
                  <span className="text-[10px] text-[#8E8E93]">فتح باب الانضمام للشبكة</span>
                </div>
                <input
                  type="checkbox"
                  checked={platformSettings.allowNewRegistrations}
                  onChange={e => {
                    updatePlatformSettings({ allowNewRegistrations: e.target.checked });
                    showToast('تم تحديث إعدادات التسجيل');
                  }}
                  className="w-5 h-5 accent-[#C5A46D] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.04]">
                <div>
                  <span className="font-bold text-white block">وضع الصيانة العامة</span>
                  <span className="text-[10px] text-[#8E8E93]">قفل المنصة للأعضاء العاديين</span>
                </div>
                <input
                  type="checkbox"
                  checked={platformSettings.maintenanceMode}
                  onChange={e => {
                    updatePlatformSettings({ maintenanceMode: e.target.checked });
                    showToast('تم تحديث وضع الصيانة');
                  }}
                  className="w-5 h-5 accent-red-500 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Welcome Banner Live Customizer */}
            <form onSubmit={handleSaveWelcomeBanner} className="p-4 rounded-2xl bg-[#121212] border border-[#C5A46D]/25 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                <div>
                  <span className="font-bold text-white text-xs block flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#C5A46D]" />
                    <span>بنر الترحيب الرئيسي في الصفحة الأولى</span>
                  </span>
                  <span className="text-[10px] text-[#8E8E93]">تعديل الرسالة الترحيبية المعروضة لجميع الزوار والأعضاء</span>
                </div>
                <input
                  type="checkbox"
                  checked={welcomeEnabled}
                  onChange={e => setWelcomeEnabled(e.target.checked)}
                  className="w-5 h-5 accent-[#C5A46D] rounded cursor-pointer"
                  title="تفعيل أو إخفاء البنر"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8E8E93] mb-1">عنوان الترحيب:</label>
                <input
                  type="text"
                  value={welcomeTitle}
                  onChange={e => setWelcomeTitle(e.target.value)}
                  placeholder="مرحباً بك في Q"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#C5A46D]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8E8E93] mb-1">نص الترحيب والرسالة:</label>
                <textarea
                  value={welcomeMessage}
                  onChange={e => setWelcomeMessage(e.target.value)}
                  placeholder="مجتمعك الجديد للتواصل الراقي والمشاركة الحقيقية..."
                  rows={3}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-xs text-white resize-none focus:outline-none focus:border-[#C5A46D]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8E8E93] mb-1">رابط صورة البنر (اختياري):</label>
                <input
                  type="url"
                  value={welcomeImageUrl}
                  onChange={e => setWelcomeImageUrl(e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#C5A46D] force-ltr"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#9C7E45] via-[#C5A46D] to-[#DFCA98] text-black font-bold text-xs hover:brightness-105 transition-all shadow-md"
              >
                حفظ ونشر الترحيب فوراً في الواجهة
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Report Review & Action Drawer Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#191919] border border-white/10 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-bold text-white text-sm">مراجعة البلاغ {selectedReport.id}</h3>
              <button
                onClick={() => setSelectedReportId(null)}
                className="text-white/60 hover:text-white"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[#8E8E93] block text-[10px]">المحتوى المبلغ عنه:</span>
                <p className="font-semibold text-white">{selectedReport.targetTitleOrSnippet}</p>
              </div>

              <div>
                <span className="text-[#8E8E93] block text-[10px]">توضيح المُبلِغ:</span>
                <p className="text-[#E5E5E5]">{selectedReport.explanation}</p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#8E8E93] mb-1">
                  ملاحظات المشرف الداخلية:
                </label>
                <textarea
                  value={moderatorNote}
                  onChange={e => setModeratorNote(e.target.value)}
                  placeholder="سجل حيثيات القرار..."
                  rows={2}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-white/30 resize-none focus:outline-none focus:border-[#C5A46D]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-1.5 pt-2">
              <button
                onClick={() => handleReportAction('resolved', 'توجيه إنذار رسمي للمخالف')}
                className="w-full py-2 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold hover:bg-amber-500/30 flex items-center justify-center gap-1.5 transition-all"
              >
                <span>{t.warnUser}</span>
              </button>

              <button
                onClick={() => handleReportAction('resolved', 'حذف المحتوى المخالف فوراً')}
                className="w-full py-2 rounded-xl bg-red-500/20 text-red-300 text-xs font-bold hover:bg-red-500/30 flex items-center justify-center gap-1.5 transition-all"
              >
                <span>{t.removeContent}</span>
              </button>

              <button
                onClick={() => handleReportAction('rejected', 'رفض البلاغ لعدم وجود مخالفة')}
                className="w-full py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15 transition-all"
              >
                <span>رفض البلاغ (لا توجد مخالفة)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
