/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'ar' | 'en' | 'tr';

export type UserRole = 
  | 'owner'
  | 'super_admin'
  | 'admin'
  | 'senior_moderator'
  | 'moderator'
  | 'assistant'
  | 'user';

export type VerificationCategory =
  | 'official_platform'       // Gold badge - Official Platform Identity / Founder
  | 'notable_figure'         // Blue badge - Public Figures, VIPs
  | 'creator_professional'   // Blue badge - Content Creators, Artists, Devs
  | 'organization_brand'     // Gold Shield - Verified Organizations & Studios
  | 'special_official';      // Platinum badge - Special Partners

export type AccountStatus = 'active' | 'warned' | 'muted' | 'restricted' | 'suspended' | 'banned';

export interface StaffPermissions {
  canViewReports: boolean;
  canAssignReports: boolean;
  canReviewReports: boolean;
  canDeletePosts: boolean;
  canHidePosts: boolean;
  canPinPosts: boolean;
  canFeaturePosts: boolean;
  canIssueWarnings: boolean;
  canMuteMembers: boolean;
  canSuspendMembers: boolean;
  canBanMembers: boolean;
  canRestoreAccounts: boolean;
  canAssignTitles: boolean;
  canRemoveTitles: boolean;
  canAssignBadges: boolean;
  canVerifyAccounts: boolean;
  canRemoveVerification: boolean;
  canManageEvents: boolean;
  canManageAnnouncements: boolean;
  canManageStaff: boolean;
  canManagePermissions: boolean;
}

export interface AdminNote {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  text: string;
  date: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  coverUrl: string;
  bio: string;
  location?: string;
  website?: string;
  statusText?: string;
  joinDate: string;
  isVerified: boolean;
  verificationCategory?: VerificationCategory;
  verificationDetails?: {
    category: VerificationCategory;
    verifiedBy: string;
    verifiedAt: string;
    reason?: string;
  };
  isOG: boolean;
  role: UserRole;
  customPermissions?: Partial<StaffPermissions>;
  status: AccountStatus;
  restrictionDetails?: {
    reason: string;
    issuedBy: string;
    issuedAt: string;
    expiresAt?: string;
    restrictedFeatures: ('posting' | 'messaging' | 'commenting')[];
  };
  adminNotes?: AdminNote[];
  level: number;
  xp: number;
  nextLevelXp: number;
  stats: {
    postsCount: number;
    followersCount: number;
    followingCount: number;
    badgesCount: number;
  };
  titles: {
    id: string;
    textAr: string;
    textEn: string;
    textTr: string;
    icon: string;
    color: string; // 'gold' | 'purple' | 'blue' | 'silver'
    isDisplayed: boolean;
    isAdministrative?: boolean;
    assignedBy?: string;
    assignedDate?: string;
  }[];
  badges: {
    id: string;
    nameAr: string;
    nameEn: string;
    icon: string;
    description: string;
    rarity: 'founder' | 'legendary' | 'epic' | 'rare' | 'common';
    earnedDate: string;
    isDisplayed: boolean;
    assignedBy?: string;
  }[];
  appearancePreset: 'obsidian' | 'gilded' | 'concrete' | 'midnight';
  accentColor: string;
  privacy: {
    allowMessagesFrom: 'everyone' | 'following' | 'nobody';
    showOnlineStatus: boolean;
    showLocation: boolean;
    isPrivateAccount: boolean;
  };
  sectionVisibility: {
    posts: boolean;
    media: boolean;
    wall: boolean;
    achievements: boolean;
  };
  isOnline?: boolean;
  lastActive?: string;
  isPinnedByStaff?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  votedUserIds: string[];
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorVerified?: boolean;
  authorVerificationCategory?: VerificationCategory;
  authorRole?: UserRole;
  text: string;
  timestamp: string;
  likesCount: number;
  likedByCurrentUser?: boolean;
  replyToCommentId?: string;
  replyToUsername?: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorVerified: boolean;
  authorVerificationCategory?: VerificationCategory;
  authorIsOG?: boolean;
  authorRole?: UserRole;
  authorTitle?: string;
  authorLevel: number;
  timestamp: string;
  content: string;
  mediaUrls?: string[];
  poll?: {
    question: string;
    options: PollOption[];
    totalVotes: number;
    hasVoted?: boolean;
    selectedOptionId?: string;
  };
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isReposted: boolean;
  isBookmarked: boolean;
  tags?: string[];
  category?: string;
  isPinned?: boolean; // Pinned on author's profile
  isFeatured?: boolean; // Featured globally by administrators
  isHidden?: boolean; // Hidden by moderation
  isCommentsLocked?: boolean;
}

export interface Story {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  isLive?: boolean;
  type: 'image' | 'text';
  imageUrl?: string;
  textContent?: string;
  timestamp: string;
  hasUnseenStory: boolean;
  viewCount: number;
  categoryLabel?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'voice' | 'file';
  audioDuration?: number;
  timestamp: string;
  isRead: boolean;
  reactions: {
    emoji: string;
    userId: string;
  }[];
  replyToMessage?: {
    id: string;
    senderName: string;
    text: string;
  };
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  name?: string;
  avatarUrl?: string;
  participantIds: string[];
  participants: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string;
    isVerified?: boolean;
    verificationCategory?: VerificationCategory;
    isOnline?: boolean;
  }[];
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount: number;
  isMuted?: boolean;
}

export interface SocialEvent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  coverUrl: string;
  dateStr: string;
  timeStr: string;
  locationType: 'in_app' | 'virtual' | 'physical';
  locationLabel: string;
  organizer: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
    isVerified: boolean;
  };
  registeredCount: number;
  maxParticipants?: number;
  isOfficial: boolean;
  isRegistered: boolean;
  category: string;
  participantUserIds: string[];
  prizes?: {
    rank: string;
    title: string;
    reward: string;
  }[];
  rules?: string[];
  status?: 'active' | 'completed' | 'cancelled';
}

export type NotificationType = 
  | 'follow'
  | 'like'
  | 'comment'
  | 'mention'
  | 'repost'
  | 'message'
  | 'event'
  | 'achievement'
  | 'admin';

export interface AppNotification {
  id: string;
  type: NotificationType;
  actorId: string;
  actorName: string;
  actorUsername: string;
  actorAvatar: string;
  actorVerified?: boolean;
  content: string;
  targetId?: string;
  targetPreview?: string;
  timestamp: string;
  isRead: boolean;
}

export type ReportCategory = 
  | 'harassment'
  | 'bullying'
  | 'hate_speech'
  | 'spam'
  | 'impersonation'
  | 'fraud_scam'
  | 'inappropriate_content'
  | 'threats'
  | 'copyright'
  | 'other';

export type ReportStatus = 'pending' | 'under_review' | 'escalated' | 'resolved' | 'rejected';

export interface ModerationReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'user' | 'post' | 'comment' | 'story' | 'message' | 'event';
  targetId: string;
  targetTitleOrSnippet: string;
  targetAuthorId?: string;
  targetAuthorName?: string;
  category: ReportCategory;
  explanation: string;
  timestamp: string;
  status: ReportStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  moderatorNotes?: string;
  resolutionAction?: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  target: string;
  timestamp: string;
  reason?: string;
  details?: string;
}

export interface PlatformAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'banner' | 'modal' | 'feed';
  imageUrl?: string;
  actionText?: string;
  actionUrl?: string;
  targetRole?: UserRole | 'all';
  authorName: string;
  timestamp: string;
  isActive: boolean;
  createdAt?: string;
}

export interface WelcomeBannerSettings {
  enabled: boolean;
  title: string;
  message: string;
  imageUrl?: string;
  targetAudience: 'all' | 'new_users';
}

export interface PlatformSettings {
  appName: string;
  allowNewRegistrations: boolean;
  maintenanceMode: boolean;
  xpPerPost: number;
  xpPerComment: number;
  xpPerEventWin: number;
  requireEmailVerification: boolean;
  maxPinnedPostsPerProfile: number;
  defaultLanguage: Language;
  welcomeBanner?: WelcomeBannerSettings;
}

export type CallStatus = 'calling' | 'ringing' | 'connected' | 'ended' | 'rejected' | 'busy';

export interface VoiceCall {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  status: CallStatus;
  offer?: any;
  answer?: any;
  callerCandidates?: any[];
  receiverCandidates?: any[];
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  createdAt: string;
}

export type AdminDashboardSection =
  | 'overview'
  | 'members'
  | 'staff'
  | 'roles'
  | 'reports'
  | 'verification'
  | 'titles_badges'
  | 'xp_levels'
  | 'content'
  | 'featured'
  | 'events'
  | 'announcements'
  | 'banned'
  | 'audit'
  | 'settings';

export type NavigationDestination = 
  | 'home'
  | 'discover'
  | 'inbox'
  | 'profile'
  | 'notifications'
  | 'events'
  | 'settings'
  | 'profile_editor'
  | 'admin_dashboard';
