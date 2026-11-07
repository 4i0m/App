/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  UserProfile,
  Post,
  PostComment,
  Story,
  Conversation,
  Message,
  SocialEvent,
  AppNotification,
  ModerationReport,
  AuditLogEntry,
  StaffPermissions,
  PlatformAnnouncement,
  PlatformSettings,
  UserRole
} from '../types';

export const ART_ASSETS = {
  nightMountain: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
  gothicCastle: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
  concertStage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
  gamingCover: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
  techCover: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  artCover: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
  scienceCover: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80",
  alexanderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
};

export const createGradientAvatar = (text: string, bg1 = '#1F1B24', bg2 = '#000000', stroke = '#C5A46D') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}" />
        <stop offset="100%" stop-color="${bg2}" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#g)" stroke="${stroke}" stroke-width="2"/>
    <text x="50" y="58" font-family="sans-serif" font-weight="bold" font-size="28" fill="#EDEDED" text-anchor="middle">${text.slice(0, 2).toUpperCase()}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, StaffPermissions> = {
  owner: {
    canViewReports: true,
    canAssignReports: true,
    canReviewReports: true,
    canDeletePosts: true,
    canHidePosts: true,
    canPinPosts: true,
    canFeaturePosts: true,
    canIssueWarnings: true,
    canMuteMembers: true,
    canSuspendMembers: true,
    canBanMembers: true,
    canRestoreAccounts: true,
    canAssignTitles: true,
    canRemoveTitles: true,
    canAssignBadges: true,
    canVerifyAccounts: true,
    canRemoveVerification: true,
    canManageEvents: true,
    canManageAnnouncements: true,
    canManageStaff: true,
    canManagePermissions: true
  },
  super_admin: {
    canViewReports: true,
    canAssignReports: true,
    canReviewReports: true,
    canDeletePosts: true,
    canHidePosts: true,
    canPinPosts: true,
    canFeaturePosts: true,
    canIssueWarnings: true,
    canMuteMembers: true,
    canSuspendMembers: true,
    canBanMembers: true,
    canRestoreAccounts: true,
    canAssignTitles: true,
    canRemoveTitles: true,
    canAssignBadges: true,
    canVerifyAccounts: true,
    canRemoveVerification: true,
    canManageEvents: true,
    canManageAnnouncements: true,
    canManageStaff: false,
    canManagePermissions: false
  },
  admin: {
    canViewReports: true,
    canAssignReports: true,
    canReviewReports: true,
    canDeletePosts: true,
    canHidePosts: true,
    canPinPosts: true,
    canFeaturePosts: true,
    canIssueWarnings: true,
    canMuteMembers: true,
    canSuspendMembers: true,
    canBanMembers: false,
    canRestoreAccounts: true,
    canAssignTitles: true,
    canRemoveTitles: false,
    canAssignBadges: true,
    canVerifyAccounts: true,
    canRemoveVerification: false,
    canManageEvents: true,
    canManageAnnouncements: true,
    canManageStaff: false,
    canManagePermissions: false
  },
  senior_moderator: {
    canViewReports: true,
    canAssignReports: true,
    canReviewReports: true,
    canDeletePosts: true,
    canHidePosts: true,
    canPinPosts: false,
    canFeaturePosts: false,
    canIssueWarnings: true,
    canMuteMembers: true,
    canSuspendMembers: false,
    canBanMembers: false,
    canRestoreAccounts: false,
    canAssignTitles: false,
    canRemoveTitles: false,
    canAssignBadges: false,
    canVerifyAccounts: false,
    canRemoveVerification: false,
    canManageEvents: true,
    canManageAnnouncements: false,
    canManageStaff: false,
    canManagePermissions: false
  },
  moderator: {
    canViewReports: true,
    canAssignReports: false,
    canReviewReports: true,
    canDeletePosts: false,
    canHidePosts: true,
    canPinPosts: false,
    canFeaturePosts: false,
    canIssueWarnings: true,
    canMuteMembers: true,
    canSuspendMembers: false,
    canBanMembers: false,
    canRestoreAccounts: false,
    canAssignTitles: false,
    canRemoveTitles: false,
    canAssignBadges: false,
    canVerifyAccounts: false,
    canRemoveVerification: false,
    canManageEvents: false,
    canManageAnnouncements: false,
    canManageStaff: false,
    canManagePermissions: false
  },
  assistant: {
    canViewReports: true,
    canAssignReports: false,
    canReviewReports: true,
    canDeletePosts: false,
    canHidePosts: true,
    canPinPosts: false,
    canFeaturePosts: false,
    canIssueWarnings: true,
    canMuteMembers: false,
    canSuspendMembers: false,
    canBanMembers: false,
    canRestoreAccounts: false,
    canAssignTitles: false,
    canRemoveTitles: false,
    canAssignBadges: false,
    canVerifyAccounts: false,
    canRemoveVerification: false,
    canManageEvents: false,
    canManageAnnouncements: false,
    canManageStaff: false,
    canManagePermissions: false
  },
  user: {
    canViewReports: false,
    canAssignReports: false,
    canReviewReports: false,
    canDeletePosts: false,
    canHidePosts: false,
    canPinPosts: false,
    canFeaturePosts: false,
    canIssueWarnings: false,
    canMuteMembers: false,
    canSuspendMembers: false,
    canBanMembers: false,
    canRestoreAccounts: false,
    canAssignTitles: false,
    canRemoveTitles: false,
    canAssignBadges: false,
    canVerifyAccounts: false,
    canRemoveVerification: false,
    canManageEvents: false,
    canManageAnnouncements: false,
    canManageStaff: false,
    canManagePermissions: false
  }
};

// 100% Real Production Data — Zero Mock, Zero Fake Users, Zero Seed Posts
export const INITIAL_USERS: Record<string, UserProfile> = {};
export const INITIAL_POSTS: Post[] = [];
export const INITIAL_COMMENTS: Record<string, PostComment[]> = {};
export const INITIAL_STORIES: Story[] = [];
export const INITIAL_CONVERSATIONS: Conversation[] = [];
export const INITIAL_MESSAGES: Record<string, Message[]> = {};
export const INITIAL_EVENTS: SocialEvent[] = [];
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
export const INITIAL_REPORTS: ModerationReport[] = [];
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];
export const INITIAL_ANNOUNCEMENTS: PlatformAnnouncement[] = [];

export const INITIAL_PLATFORM_SETTINGS: PlatformSettings = {
  appName: 'Q Social Network',
  allowNewRegistrations: true,
  maintenanceMode: false,
  xpPerPost: 25,
  xpPerComment: 5,
  xpPerEventWin: 500,
  requireEmailVerification: true,
  maxPinnedPostsPerProfile: 3,
  defaultLanguage: 'ar',
  welcomeBanner: {
    enabled: true,
    title: 'مرحباً بك في Q',
    message: 'مرحباً بك في Q، مجتمعك الجديد. شارك اهتماماتك وتواصل مع العالم.',
    targetAudience: 'all'
  }
};
