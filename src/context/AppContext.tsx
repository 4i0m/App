/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Language,
  UserProfile,
  UserRole,
  VerificationCategory,
  AccountStatus,
  StaffPermissions,
  Post,
  PostComment,
  Story,
  Conversation,
  Message,
  SocialEvent,
  AppNotification,
  ModerationReport,
  AuditLogEntry,
  PlatformAnnouncement,
  PlatformSettings,
  WelcomeBannerSettings,
  VoiceCall,
  CallStatus,
  NavigationDestination,
  ReportCategory,
  ReportStatus
} from '../types';
import {
  INITIAL_PLATFORM_SETTINGS,
  DEFAULT_ROLE_PERMISSIONS,
  createGradientAvatar
} from '../data/initialData';
import { TRANSLATIONS } from '../data/translations';
import { 
  auth, 
  db, 
  testConnection, 
  uploadMedia,
  handleFirestoreError,
  OperationType,
  googleProvider
} from '../services/firebase';
import { webrtcVoiceManager } from '../services/webrtc';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  deleteUser,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';

interface NavigationHistoryItem {
  destination: NavigationDestination;
  viewingUserId?: string;
  activeConversationId?: string;
  selectedEventId?: string;
}

interface AppContextType {
  language: Language;
  t: typeof TRANSLATIONS.ar;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;

  // Firebase Real Auth & Session
  firebaseUser: FirebaseUser | null;
  firebaseReady: boolean;
  isAuthenticated: boolean;
  authMode: 'splash' | 'login' | 'register' | 'authenticated';
  setAuthMode: (mode: 'splash' | 'login' | 'register' | 'authenticated') => void;
  login: (usernameOrId: string) => void;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (email: string, pass: string, username: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  resetPasswordEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccountPermanently: () => Promise<{ success: boolean; error?: string }>;
  uploadFile: (file: File, folder?: string) => Promise<string>;
  logout: () => void;
  switchUser: (userId: string) => void;

  // Permission Checks
  hasPermission: (perm: keyof StaffPermissions) => boolean;
  isStaff: () => boolean;
  isOwner: () => boolean;

  // Navigation
  activeTab: NavigationDestination;
  navigationHistory: NavigationHistoryItem[];
  navigateTo: (dest: NavigationDestination, opts?: { userId?: string; conversationId?: string; eventId?: string }) => void;
  goBack: () => boolean;

  // User & Profiles
  currentUserId: string;
  currentUser: UserProfile;
  viewingUserId: string;
  viewingUser: UserProfile;
  allUsers: Record<string, UserProfile>;
  openUserProfile: (userId: string) => void;
  toggleFollow: (userId: string) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  isFollowing: (userId: string) => boolean;

  // Administrative Operations on Members
  addAdminNote: (targetUserId: string, text: string) => void;
  assignTitleToUser: (targetUserId: string, titleData: { textAr: string; textEn: string; icon: string; color: string; isAdministrative?: boolean }) => void;
  removeTitleFromUser: (targetUserId: string, titleId: string) => void;
  assignBadgeToUser: (targetUserId: string, badgeData: { nameAr: string; nameEn: string; icon: string; description: string; rarity: any }) => void;
  removeBadgeFromUser: (targetUserId: string, badgeId: string) => void;
  setMemberVerification: (targetUserId: string, isVerified: boolean, category?: VerificationCategory, reason?: string) => void;
  restrictMemberAccount: (targetUserId: string, status: AccountStatus, reason: string, features?: ('posting' | 'messaging' | 'commenting')[]) => void;
  restoreMemberAccount: (targetUserId: string) => void;
  changeMemberRole: (targetUserId: string, newRole: UserRole) => void;
  updateMemberPermissions: (targetUserId: string, permissions: Partial<StaffPermissions>) => void;

  // Feeds & Posts
  posts: Post[];
  postComments: Record<string, PostComment[]>;
  toggleLikePost: (postId: string) => void;
  toggleBookmarkPost: (postId: string) => void;
  toggleRepost: (postId: string) => void;
  votePoll: (postId: string, optionId: string) => void;
  addPost: (content: string, mediaUrls?: string[], pollData?: any, category?: string, tags?: string[]) => void;
  deletePost: (postId: string) => void;
  togglePinPost: (postId: string) => void;
  toggleFeaturePost: (postId: string) => void;
  toggleHidePost: (postId: string) => void;
  addComment: (postId: string, text: string, replyToCommentId?: string) => void;
  likeComment: (postId: string, commentId: string) => void;

  // Stories
  stories: Story[];
  activeStory: Story | null;
  setActiveStory: (story: Story | null) => void;
  addStory: (type: 'image' | 'text', urlOrText: string) => void;
  markStoryViewed: (storyId: string) => void;
  myFollowedUserIds: string[];

  // Messaging & Voice Notes
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversationId: string | null;
  openConversation: (convId: string) => void;
  startDirectMessageWith: (userId: string) => void;
  sendMessage: (convId: string, text: string, mediaUrl?: string, replyTo?: any) => void;
  sendVoiceMessage: (convId: string, audioBlobOrUrl: Blob | string, durationSeconds: number) => Promise<void>;
  deleteMessage: (convId: string, messageId: string) => Promise<void>;
  addReaction: (convId: string, messageId: string, emoji: string) => void;
  unreadMessagesCount: number;

  // WebRTC Voice Calls
  currentCall: VoiceCall | null;
  isCallMuted: boolean;
  startVoiceCall: (receiverId: string, receiverName: string, receiverAvatar: string) => Promise<void>;
  acceptVoiceCall: () => Promise<void>;
  declineVoiceCall: () => Promise<void>;
  endVoiceCall: () => Promise<void>;
  toggleCallMute: () => void;

  // Events
  events: SocialEvent[];
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
  registerForEvent: (eventId: string) => void;
  cancelEventRegistration: (eventId: string) => void;
  addEvent: (eventData: Partial<SocialEvent>) => void;
  updateEventStatus: (eventId: string, status: 'active' | 'completed' | 'cancelled') => void;

  // Notifications
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Moderation & Reports
  reports: ModerationReport[];
  auditLogs: AuditLogEntry[];
  reportingTarget: {
    type: 'user' | 'post' | 'comment' | 'story' | 'message' | 'event';
    id: string;
    title: string;
    authorId?: string;
    authorName?: string;
  } | null;
  openReportModal: (target: {
    type: 'user' | 'post' | 'comment' | 'story' | 'message' | 'event';
    id: string;
    title: string;
    authorId?: string;
    authorName?: string;
  }) => void;
  closeReportModal: () => void;
  submitReport: (category: ReportCategory, explanation: string) => void;
  updateReportStatus: (reportId: string, status: ReportStatus, moderatorNotes?: string, action?: string) => void;

  // In-App Announcements & Welcome Banner
  announcements: PlatformAnnouncement[];
  addAnnouncement: (ann: Partial<PlatformAnnouncement>) => void;
  toggleAnnouncement: (id: string) => void;
  deleteAnnouncement: (id: string) => void;
  platformSettings: PlatformSettings;
  updatePlatformSettings: (settings: Partial<PlatformSettings>) => void;
  updateWelcomeBanner: (banner: WelcomeBannerSettings) => void;

  // Settings & Moderation Lists
  blockedUserIds: string[];
  toggleBlockUser: (userId: string) => void;
  mutedUserIds: string[];
  toggleMuteUser: (userId: string) => void;

  // Admin Profile Menu Modal
  adminTargetUser: UserProfile | null;
  openAdminProfileMenu: (targetUser: UserProfile) => void;
  closeAdminProfileMenu: () => void;

  // Detail Modals
  verificationDetailUser: UserProfile | null;
  setVerificationDetailUser: (user: UserProfile | null) => void;
  levelDetailUser: UserProfile | null;
  setLevelDetailUser: (user: UserProfile | null) => void;

  // UI Overlays & Viewport Controls
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  isCreatePostOpen: boolean;
  setIsCreatePostOpen: (open: boolean) => void;
  lightboxImage: string | null;
  setLightboxImage: (url: string | null) => void;
  selectedPostForComments: Post | null;
  setSelectedPostForComments: (post: Post | null) => void;
  deviceFrameMode: 'android_phone' | 'fluid';
  setDeviceFrameMode: (mode: 'android_phone' | 'fluid') => void;
  showAndroidCodeExport: boolean;
  setShowAndroidCodeExport: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Storage keys for real production state (v5 with zero fake data)
const STORAGE_KEYS = {
  USERS: 'q_users_real_v5',
  POSTS: 'q_posts_real_v5',
  COMMENTS: 'q_comments_real_v5',
  STORIES: 'q_stories_real_v5',
  CONVERSATIONS: 'q_conversations_real_v5',
  MESSAGES: 'q_messages_real_v5',
  EVENTS: 'q_events_real_v5',
  NOTIFICATIONS: 'q_notifications_real_v5',
  REPORTS: 'q_reports_real_v5',
  AUDIT_LOGS: 'q_audit_logs_real_v5',
  ANNOUNCEMENTS: 'q_announcements_real_v5',
  SETTINGS: 'q_settings_real_v5',
  BLOCKED: 'q_blocked_real_v5',
  MUTED: 'q_muted_real_v5',
  LANGUAGE: 'q_lang_real_v5',
  CURRENT_USER_ID: 'q_current_user_id_real_v5',
  AUTH_MODE: 'q_auth_mode_real_v5'
};

// Purge any legacy fake mock data keys from earlier sessions
if (typeof window !== 'undefined') {
  try {
    ['q_users_v3', 'q_posts_v3', 'q_comments_v3', 'q_stories_v3', 'q_conversations_v3', 'q_messages_v3', 'q_events_v3', 'q_notifications_v3', 'q_reports_v3', 'q_audit_logs_v3', 'q_announcements_v3', 'q_settings_v3'].forEach(k => {
      localStorage.removeItem(k);
    });
  } catch (_) {}
}

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {}
}

const GUEST_USER: UserProfile = {
  id: 'guest',
  username: 'guest',
  displayName: 'زائر',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
  coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
  bio: 'مرحباً بك في شبكة Q!',
  joinDate: '2026-11-07',
  isVerified: false,
  isOG: false,
  role: 'user',
  status: 'active',
  level: 1,
  xp: 0,
  nextLevelXp: 100,
  stats: {
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    badgesCount: 0
  },
  titles: [],
  badges: [],
  appearancePreset: 'obsidian',
  accentColor: '#C5A46D',
  privacy: {
    allowMessagesFrom: 'everyone',
    showOnlineStatus: true,
    showLocation: false,
    isPrivateAccount: false
  },
  sectionVisibility: {
    posts: true,
    media: true,
    wall: true,
    achievements: true
  },
  isOnline: true
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => 
    loadStorage<Language>(STORAGE_KEYS.LANGUAGE, 'ar')
  );
  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveStorage(STORAGE_KEYS.LANGUAGE, lang);
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.ar;

  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [firebaseReady, setFirebaseReady] = useState(false);

  // Auth Mode: 'authenticated' if there is an active session, otherwise 'splash'
  const [authMode, setAuthModeState] = useState<'splash' | 'login' | 'register' | 'authenticated'>(() =>
    loadStorage(STORAGE_KEYS.AUTH_MODE, 'splash')
  );

  const setAuthMode = (mode: 'splash' | 'login' | 'register' | 'authenticated') => {
    setAuthModeState(mode);
    saveStorage(STORAGE_KEYS.AUTH_MODE, mode);
  };

  const isAuthenticated = authMode === 'authenticated';

  // Active user ID (defaults to empty string or current signed-in user)
  const [currentUserId, setCurrentUserId] = useState<string>(() =>
    loadStorage(STORAGE_KEYS.CURRENT_USER_ID, '')
  );

  const [allUsers, setAllUsers] = useState<Record<string, UserProfile>>({});
  const currentUser = allUsers[currentUserId] || GUEST_USER;

  // Posts & Feeds (100% Real from Firestore)
  const [posts, setPosts] = useState<Post[]>([]);
  const [postComments, setPostComments] = useState<Record<string, PostComment[]>>({});

  // Stories
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [myFollowedUserIds, setMyFollowedUserIds] = useState<string[]>([]);

  // Conversations & Messages
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // WebRTC Voice Calls
  const [currentCall, setCurrentCall] = useState<VoiceCall | null>(null);
  const [isCallMuted, setIsCallMuted] = useState(false);

  // Events
  const [events, setEvents] = useState<SocialEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Moderation & Reports
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Announcements & Platform Settings
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(INITIAL_PLATFORM_SETTINGS);

  const [reportingTarget, setReportingTarget] = useState<{
    type: 'user' | 'post' | 'comment' | 'story' | 'message' | 'event';
    id: string;
    title: string;
    authorId?: string;
    authorName?: string;
  } | null>(null);

  // Admin Target User on Member Profile
  const [adminTargetUser, setAdminTargetUser] = useState<UserProfile | null>(null);
  const [verificationDetailUser, setVerificationDetailUser] = useState<UserProfile | null>(null);
  const [levelDetailUser, setLevelDetailUser] = useState<UserProfile | null>(null);

  // Blocked / Muted
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [mutedUserIds, setMutedUserIds] = useState<string[]>([]);

  // Navigation
  const [activeTab, setActiveTab] = useState<NavigationDestination>('home');
  const [viewingUserId, setViewingUserId] = useState<string>('');
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistoryItem[]>([
    { destination: 'home' }
  ]);

  const viewingUser = allUsers[viewingUserId] || currentUser;

  // UI state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);
  const [deviceFrameMode, setDeviceFrameMode] = useState<'android_phone' | 'fluid'>('fluid');
  const [showAndroidCodeExport, setShowAndroidCodeExport] = useState(false);

  // Initial connection test on boot
  useEffect(() => {
    testConnection().then(ok => setFirebaseReady(ok));
  }, []);

  // Firebase Auth Lifecycle & Auto-Sync
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userRef);
          
          const isBootstrappedOwner = user.email?.toLowerCase() === 'sabosenpai33@gmail.com' || user.email?.toLowerCase() === 'athar1style@gmail.com';

          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            if (isBootstrappedOwner && data.role !== 'owner') {
              data.role = 'owner';
              data.isVerified = true;
              data.verificationCategory = 'official_platform';
              await updateDoc(userRef, { role: 'owner', isVerified: true, verificationCategory: 'official_platform' });
            }
            setAllUsers(prev => ({ ...prev, [user.uid]: data }));
            setCurrentUserId(user.uid);
            saveStorage(STORAGE_KEYS.CURRENT_USER_ID, user.uid);
            setAuthMode('authenticated');
          } else {
            // Clean initial user record
            const baseUsername = (user.email?.split('@')[0] || 'member').toLowerCase().replace(/[^a-z0-9_]/g, '') + '_' + user.uid.substring(0, 4);
            const initialProfile: UserProfile = {
              id: user.uid,
              username: baseUsername,
              displayName: user.displayName || user.email?.split('@')[0] || 'Q Member',
              avatarUrl: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
              coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
              bio: isBootstrappedOwner ? 'Founder & Platform Owner of Q Network.' : 'مرحباً بي في شبكة Q العالمية!',
              joinDate: new Date().toISOString().slice(0, 10),
              isVerified: isBootstrappedOwner,
              verificationCategory: isBootstrappedOwner ? 'official_platform' : undefined,
              isOG: isBootstrappedOwner,
              role: isBootstrappedOwner ? 'owner' : 'user',
              status: 'active',
              level: isBootstrappedOwner ? 50 : 1,
              xp: isBootstrappedOwner ? 50000 : 0,
              nextLevelXp: isBootstrappedOwner ? 100000 : 100,
              stats: {
                postsCount: 0,
                followersCount: isBootstrappedOwner ? 1 : 0,
                followingCount: 0,
                badgesCount: isBootstrappedOwner ? 1 : 0
              },
              titles: isBootstrappedOwner ? [
                {
                  id: 't_founder',
                  textAr: 'المالك والمؤسس',
                  textEn: 'Founder & Owner',
                  textTr: 'Kurucu',
                  icon: '👑',
                  color: 'gold',
                  isDisplayed: true,
                  isAdministrative: true
                }
              ] : [],
              badges: isBootstrappedOwner ? [
                {
                  id: 'b_genesis',
                  nameAr: 'شعار التأسيس الأول',
                  nameEn: 'Genesis Founder',
                  icon: '✨',
                  description: 'حساب مؤسس شبكة Q',
                  rarity: 'founder',
                  earnedDate: '2026-11-07',
                  isDisplayed: true
                }
              ] : [],
              appearancePreset: 'obsidian',
              accentColor: '#C5A46D',
              privacy: {
                allowMessagesFrom: 'everyone',
                showOnlineStatus: true,
                showLocation: false,
                isPrivateAccount: false
              },
              sectionVisibility: {
                posts: true,
                media: true,
                wall: true,
                achievements: true
              },
              isOnline: true
            };

            await setDoc(userRef, initialProfile);
            await setDoc(doc(db, 'usernames', baseUsername.toLowerCase()), {
              username: baseUsername.toLowerCase(),
              userId: user.uid,
              createdAt: new Date().toISOString()
            });

            setAllUsers(prev => ({ ...prev, [user.uid]: initialProfile }));
            setCurrentUserId(user.uid);
            saveStorage(STORAGE_KEYS.CURRENT_USER_ID, user.uid);
            setAuthMode('authenticated');
          }
        } catch (err) {
          console.warn("User auth bootstrap notice:", err);
        }
      } else {
        setCurrentUserId('');
        setAuthMode('splash');
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time Firestore synchronizer for Public and Private collections
  useEffect(() => {
    let unsubPosts: (() => void) | undefined;
    let unsubUsers: (() => void) | undefined;
    let unsubComments: (() => void) | undefined;
    let unsubStories: (() => void) | undefined;
    let unsubConversations: (() => void) | undefined;
    let unsubNotifications: (() => void) | undefined;
    let unsubFollows: (() => void) | undefined;
    let unsubEvents: (() => void) | undefined;
    let unsubReports: (() => void) | undefined;
    let unsubAnnouncements: (() => void) | undefined;
    let unsubSettings: (() => void) | undefined;
    let unsubCalls: (() => void) | undefined;

    try {
      // 1. Posts (Public real-time feed from Firestore)
      const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
      unsubPosts = onSnapshot(postsQuery, (snapshot) => {
        const livePosts: Post[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data() as any;
          const likedByMe = (data.likedUserIds && firebaseUser)
            ? data.likedUserIds.includes(firebaseUser.uid)
            : Boolean(data.isLiked);
          return {
            id: docSnap.id,
            ...data,
            isLiked: likedByMe
          };
        });
        setPosts(livePosts);
      }, (e) => console.warn("Posts sync notice:", e));

      // Stories (Public real-time stories from Firestore)
      const storiesQuery = query(collection(db, 'stories'), limit(40));
      unsubStories = onSnapshot(storiesQuery, (snapshot) => {
        const liveStories: Story[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data() as any;
          const seenByMe = (data.viewers && firebaseUser)
            ? data.viewers.includes(firebaseUser.uid)
            : false;
          return {
            id: docSnap.id,
            ...data,
            hasUnseenStory: !seenByMe
          };
        });
        setStories(liveStories);
      }, (e) => console.warn("Stories sync notice:", e));

      // 2. Users (Public user profiles)
      unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        const usersMap: Record<string, UserProfile> = {};
        snapshot.docs.forEach(docSnap => {
          usersMap[docSnap.id] = { id: docSnap.id, ...(docSnap.data() as any) };
        });
        setAllUsers(usersMap);
      }, (e) => console.warn("Users sync notice:", e));

      // 3. Comments
      unsubComments = onSnapshot(collection(db, 'comments'), (snapshot) => {
        const commentsGrouped: Record<string, PostComment[]> = {};
        snapshot.docs.forEach(docSnap => {
          const comment = { id: docSnap.id, ...(docSnap.data() as any) } as PostComment;
          if (comment.postId) {
            if (!commentsGrouped[comment.postId]) commentsGrouped[comment.postId] = [];
            commentsGrouped[comment.postId].push(comment);
          }
        });
        setPostComments(commentsGrouped);
      }, (e) => console.warn("Comments sync notice:", e));

      // 4. Events
      unsubEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
        const evList = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...(docSnap.data() as any)
        })) as SocialEvent[];
        setEvents(evList);
      }, (e) => console.warn("Events sync notice:", e));

      // 5. Announcements (In-app promotional ads & notices)
      unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snapshot) => {
        const annList = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...(docSnap.data() as any)
        })) as PlatformAnnouncement[];
        setAnnouncements(annList);
      }, (e) => console.warn("Announcements sync notice:", e));

      // 6. Platform Settings & Welcome Banner
      unsubSettings = onSnapshot(doc(db, 'platform_settings', 'global'), (snap) => {
        if (snap.exists()) {
          setPlatformSettings(snap.data() as PlatformSettings);
        }
      }, (e) => console.warn("Settings sync notice:", e));

      // 7. Private Authenticated Listeners
      if (firebaseUser) {
        // Conversations where current user is a participant
        const convQuery = query(
          collection(db, 'conversations'),
          where('participantIds', 'array-contains', firebaseUser.uid)
        );
        unsubConversations = onSnapshot(convQuery, (snapshot) => {
          const convList = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...(docSnap.data() as any)
          })) as Conversation[];
          setConversations(convList);
        }, (e) => console.warn("Conversations sync notice:", e));

        // Notifications for current user
        const notifQuery = query(
          collection(db, 'notifications'),
          where('recipientId', '==', firebaseUser.uid),
          limit(40)
        );
        unsubNotifications = onSnapshot(notifQuery, (snapshot) => {
          const notifList = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...(docSnap.data() as any)
          })) as AppNotification[];
          setNotifications(notifList);
        }, (e) => console.warn("Notifications sync notice:", e));

        // WebRTC Voice Calls: listen for incoming ringing/calling calls
        const callsQuery = query(
          collection(db, 'voice_calls'),
          where('receiverId', '==', firebaseUser.uid),
          where('status', 'in', ['calling', 'ringing'])
        );
        unsubCalls = onSnapshot(callsQuery, (snapshot) => {
          if (!snapshot.empty) {
            const activeDoc = snapshot.docs[0];
            setCurrentCall({ id: activeDoc.id, ...(activeDoc.data() as any) });
          } else if (currentCall && currentCall.receiverId === firebaseUser.uid && currentCall.status !== 'connected') {
            setCurrentCall(null);
          }
        }, (e) => console.warn("Calls listener notice:", e));

        // Follows for current user
        const followsQuery = query(
          collection(db, 'follows'),
          where('followerId', '==', firebaseUser.uid)
        );
        unsubFollows = onSnapshot(followsQuery, (snapshot) => {
          const followedList = snapshot.docs.map(d => d.data().followingId).filter(Boolean);
          setMyFollowedUserIds(followedList);
        }, (e) => console.warn("Follows sync notice:", e));

        // Reports (if staff)
        if (['owner', 'super_admin', 'admin', 'senior_moderator', 'moderator'].includes(currentUser.role)) {
          unsubReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
            const repList = snapshot.docs.map(docSnap => ({
              id: docSnap.id,
              ...(docSnap.data() as any)
            })) as ModerationReport[];
            setReports(repList);
          }, () => {});
        }
      }
    } catch (e) {
      console.warn("Firestore listeners error:", e);
    }

    return () => {
      unsubPosts?.();
      unsubStories?.();
      unsubUsers?.();
      unsubComments?.();
      unsubConversations?.();
      unsubNotifications?.();
      unsubFollows?.();
      unsubEvents?.();
      unsubReports?.();
      unsubAnnouncements?.();
      unsubSettings?.();
      unsubCalls?.();
    };
  }, [firebaseUser, currentUser.role]);

  // Real-time messages listener for currently opened conversation
  useEffect(() => {
    if (!activeConversationId || !firebaseUser) return;
    const msgQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', activeConversationId),
      orderBy('timestamp', 'asc'),
      limit(100)
    );
    const unsubMessages = onSnapshot(msgQuery, (snapshot) => {
      const liveMsgs = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as any)
      })) as Message[];
      setMessages(prev => ({
        ...prev,
        [activeConversationId]: liveMsgs
      }));
    }, (err) => console.warn("Live messages sync notice:", err));

    return () => unsubMessages();
  }, [activeConversationId, firebaseUser]);

  // Real Authentication Methods
  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      setFirebaseUser(cred.user);
      setCurrentUserId(cred.user.uid);
      setAuthMode('authenticated');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'فشل تسجيل الدخول. يرجى مراجعة البريد وكلمة المرور.' };
    }
  };

  const registerWithEmail = async (
    email: string, 
    pass: string, 
    username: string, 
    displayName: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      const usernameDoc = await getDoc(doc(db, 'usernames', cleanUsername));
      if (usernameDoc.exists()) {
        return { success: false, error: 'اسم المستخدم محجوز مسبقاً، يرجى اختيار اسم آخر.' };
      }

      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const isOwnerAccount = ['sabosenpai33@gmail.com', 'athar1style@gmail.com'].includes(email.trim().toLowerCase());

      const newProfile: UserProfile = {
        id: cred.user.uid,
        username: cleanUsername,
        displayName: displayName.trim() || cleanUsername,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
        coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
        bio: isOwnerAccount ? 'Founder & Platform Owner of Q Network.' : 'مرحباً بي في شبكة Q العالمية!',
        joinDate: new Date().toISOString().slice(0, 10),
        isVerified: isOwnerAccount,
        verificationCategory: isOwnerAccount ? 'official_platform' : undefined,
        isOG: isOwnerAccount,
        role: isOwnerAccount ? 'owner' : 'user',
        status: 'active',
        level: isOwnerAccount ? 50 : 1,
        xp: isOwnerAccount ? 50000 : 0,
        nextLevelXp: isOwnerAccount ? 100000 : 100,
        stats: {
          postsCount: 0,
          followersCount: isOwnerAccount ? 1 : 0,
          followingCount: 0,
          badgesCount: isOwnerAccount ? 1 : 0
        },
        titles: isOwnerAccount ? [
          {
            id: 't_founder',
            textAr: 'المالك والمؤسس',
            textEn: 'Founder & Owner',
            textTr: 'Kurucu',
            icon: '👑',
            color: 'gold',
            isDisplayed: true,
            isAdministrative: true
          }
        ] : [],
        badges: isOwnerAccount ? [
          {
            id: 'b_genesis',
            nameAr: 'شعار التأسيس الأول',
            nameEn: 'Genesis Founder',
            icon: '✨',
            description: 'حساب مؤسس شبكة Q',
            rarity: 'founder',
            earnedDate: '2026-11-07',
            isDisplayed: true
          }
        ] : [],
        appearancePreset: 'obsidian',
        accentColor: '#C5A46D',
        privacy: {
          allowMessagesFrom: 'everyone',
          showOnlineStatus: true,
          showLocation: false,
          isPrivateAccount: false
        },
        sectionVisibility: {
          posts: true,
          media: true,
          wall: true,
          achievements: true
        },
        isOnline: true
      };

      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      await setDoc(doc(db, 'usernames', cleanUsername), {
        username: cleanUsername,
        userId: cred.user.uid,
        createdAt: new Date().toISOString()
      });

      setAllUsers(prev => ({ ...prev, [cred.user.uid]: newProfile }));
      setCurrentUserId(cred.user.uid);
      setFirebaseUser(cred.user);
      setAuthMode('authenticated');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'حدث خطأ أثناء إنشاء الحساب.' };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setFirebaseUser(result.user);
      setCurrentUserId(result.user.uid);
      setAuthMode('authenticated');
      return { success: true };
    } catch (err: any) {
      console.warn('Google Sign-in failed:', err.code, err.message);
      let errorMsg = err.message || 'تعذر تسجيل الدخول عبر حساب Google.';
      if (err.code === 'auth/unauthorized-domain') {
        const hostname = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
        errorMsg = language === 'ar'
          ? `النطاق الحالي (${hostname}) غير مصرح به في Firebase Authentication. يرجى إضافته إلى قائمة Authorized Domains في لوحة تحكم مشروع yachty-exchanger-fm4ph.`
          : `Current domain (${hostname}) is not authorized in Firebase Authentication. Please add it to Authorized Domains in project yachty-exchanger-fm4ph.`;
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMsg = language === 'ar' ? 'تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية.' : 'Sign-in popup was closed.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMsg = language === 'ar' ? 'تم إلغاء طلب تسجيل الدخول.' : 'Sign-in request was cancelled.';
      }
      return { success: false, error: errorMsg };
    }
  };

  const resetPasswordEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'فشل إرسال رابط استعادة كلمة المرور.' };
    }
  };

  const deleteAccountPermanently = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (auth.currentUser) {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid));
        await deleteUser(auth.currentUser);
        setFirebaseUser(null);
        setCurrentUserId('');
        setAuthMode('splash');
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'فشل حذف الحساب بشكل دائم.' };
    }
  };

  const uploadFile = async (file: File, folder = 'uploads'): Promise<string> => {
    return await uploadMedia(file, folder);
  };

  const switchUser = (userId: string) => {
    if (allUsers[userId]) {
      setCurrentUserId(userId);
      setAuthMode('authenticated');
    }
  };

  const login = (usernameOrId: string) => {
    const clean = usernameOrId.trim().toLowerCase().replace('@', '');
    const found = Object.values(allUsers).find(
      u => u.username.toLowerCase() === clean || u.id === usernameOrId
    );
    if (found) {
      switchUser(found.id);
    }
  };

  const logout = () => {
    signOut(auth).catch(() => {});
    setFirebaseUser(null);
    setCurrentUserId('');
    setAuthMode('splash');
  };

  // Permission Evaluation
  const isOwner = useCallback(() => {
    return currentUser.role === 'owner' || ['sabosenpai33@gmail.com', 'athar1style@gmail.com'].includes(firebaseUser?.email?.toLowerCase() || '');
  }, [currentUser, firebaseUser]);

  const isStaff = useCallback(() => {
    return ['owner', 'super_admin', 'admin', 'senior_moderator', 'moderator', 'assistant'].includes(currentUser.role) || isOwner();
  }, [currentUser, isOwner]);

  const hasPermission = useCallback((perm: keyof StaffPermissions) => {
    if (isOwner()) return true;
    if (currentUser.status === 'banned' || currentUser.status === 'suspended') return false;

    if (currentUser.customPermissions && currentUser.customPermissions[perm] !== undefined) {
      return Boolean(currentUser.customPermissions[perm]);
    }

    const defaults = DEFAULT_ROLE_PERMISSIONS[currentUser.role] || DEFAULT_ROLE_PERMISSIONS.user;
    return Boolean(defaults[perm]);
  }, [currentUser, isOwner]);

  // Navigation handlers
  const navigateTo = useCallback((
    destination: NavigationDestination,
    opts?: { userId?: string; conversationId?: string; eventId?: string }
  ) => {
    setActiveTab(destination);
    if (opts?.userId) setViewingUserId(opts.userId);
    if (opts?.conversationId) setActiveConversationId(opts.conversationId);
    if (opts?.eventId) setSelectedEventId(opts.eventId);

    setNavigationHistory(prev => [
      ...prev,
      {
        destination,
        viewingUserId: opts?.userId,
        activeConversationId: opts?.conversationId,
        selectedEventId: opts?.eventId
      }
    ]);
  }, []);

  const goBack = useCallback(() => {
    if (navigationHistory.length <= 1) {
      if (activeTab !== 'home') {
        setActiveTab('home');
        return true;
      }
      return false;
    }

    const newHistory = [...navigationHistory];
    newHistory.pop();
    const previous = newHistory[newHistory.length - 1];

    setNavigationHistory(newHistory);
    setActiveTab(previous.destination);
    if (previous.viewingUserId) setViewingUserId(previous.viewingUserId);
    if (previous.activeConversationId !== undefined) setActiveConversationId(previous.activeConversationId);
    if (previous.selectedEventId !== undefined) setSelectedEventId(previous.selectedEventId);

    return true;
  }, [navigationHistory, activeTab]);

  const openUserProfile = useCallback((userId: string) => {
    navigateTo('profile', { userId });
  }, [navigateTo]);

  const isFollowing = useCallback((userId: string) => {
    if (!userId || userId === currentUserId) return false;
    return myFollowedUserIds.includes(userId) || Boolean((allUsers[userId] as any)?._isFollowedByMe);
  }, [currentUserId, myFollowedUserIds, allUsers]);

  const toggleFollow = useCallback((userId: string) => {
    if (!currentUserId || userId === currentUserId) return;

    const isCurrentlyFollowing = myFollowedUserIds.includes(userId) || Boolean((allUsers[userId] as any)?._isFollowedByMe);
    const isNowFollowing = !isCurrentlyFollowing;
    const targetFollowersDelta = isNowFollowing ? 1 : -1;
    const myFollowingDelta = isNowFollowing ? 1 : -1;

    setMyFollowedUserIds(prev =>
      isNowFollowing ? [...prev, userId] : prev.filter(id => id !== userId)
    );

    setAllUsers(prev => {
      const target = prev[userId];
      const me = prev[currentUserId];
      if (!target || !me) return prev;

      return {
        ...prev,
        [userId]: {
          ...target,
          _isFollowedByMe: isNowFollowing,
          stats: {
            ...target.stats,
            followersCount: Math.max(0, target.stats.followersCount + targetFollowersDelta)
          }
        } as UserProfile,
        [currentUserId]: {
          ...me,
          stats: {
            ...me.stats,
            followingCount: Math.max(0, me.stats.followingCount + myFollowingDelta)
          }
        }
      };
    });

    const followDoc = doc(db, 'follows', `${currentUserId}_${userId}`);
    if (isNowFollowing) {
      setDoc(followDoc, {
        id: `${currentUserId}_${userId}`,
        followerId: currentUserId,
        followingId: userId,
        createdAt: new Date().toISOString()
      }).catch(() => {});

      const newNotifId = `notif_${Date.now()}`;
      const newNotif: AppNotification = {
        id: newNotifId,
        type: 'follow',
        actorId: currentUserId,
        actorName: currentUser.displayName,
        actorUsername: currentUser.username,
        actorAvatar: currentUser.avatarUrl,
        actorVerified: currentUser.isVerified,
        content: language === 'ar' ? 'بدأ في متابعتك' : 'started following you',
        targetId: currentUserId,
        timestamp: language === 'ar' ? 'الآن' : 'just now',
        isRead: false
      };
      setNotifications(prev => [newNotif, ...prev]);

      setDoc(doc(db, 'notifications', newNotifId), {
        ...newNotif,
        recipientId: userId,
        createdAt: new Date().toISOString()
      }).catch(() => {});
    } else {
      deleteDoc(followDoc).catch(() => {});
    }

    const targetUser = allUsers[userId];
    if (targetUser) {
      updateDoc(doc(db, 'users', userId), {
        'stats.followersCount': Math.max(0, targetUser.stats.followersCount + targetFollowersDelta)
      }).catch(() => {});
    }

    updateDoc(doc(db, 'users', currentUserId), {
      'stats.followingCount': Math.max(0, currentUser.stats.followingCount + myFollowingDelta)
    }).catch(() => {});
  }, [currentUserId, currentUser, allUsers, language, myFollowedUserIds]);

  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    if (!currentUserId) return;
    setAllUsers(prev => {
      const existing = prev[currentUserId] || GUEST_USER;
      const updated = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString()
      };

      const userRef = doc(db, 'users', currentUserId);
      setDoc(userRef, updated, { merge: true }).catch(err => {
        console.warn("Firestore update profile notice:", err);
      });

      return {
        ...prev,
        [currentUserId]: updated
      };
    });
  }, [currentUserId]);

  // Administration Operations
  const recordAuditLog = useCallback((action: string, target: string, reason?: string, details?: string) => {
    const entry: AuditLogEntry = {
      id: `log_${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.displayName,
      actorRole: currentUser.role,
      action,
      target,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      reason,
      details
    };
    setAuditLogs(prev => [entry, ...prev]);
    setDoc(doc(db, 'audit_logs', entry.id), entry).catch(() => {});
  }, [currentUser]);

  const addAdminNote = useCallback((targetUserId: string, text: string) => {
    if (!hasPermission('canReviewReports') && !isOwner()) return;
    const newNote = {
      id: `note_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.displayName,
      authorRole: currentUser.role,
      text,
      date: new Date().toISOString().slice(0, 10)
    };

    setAllUsers(prev => {
      const target = prev[targetUserId];
      if (!target) return prev;
      const updatedNotes = [newNote, ...(target.adminNotes || [])];
      updateDoc(doc(db, 'users', targetUserId), { adminNotes: updatedNotes }).catch(() => {});
      return {
        ...prev,
        [targetUserId]: {
          ...target,
          adminNotes: updatedNotes
        }
      };
    });

    recordAuditLog('إضافة ملاحظة إدارية داخلية', `@${allUsers[targetUserId]?.username || targetUserId}`, text);
  }, [hasPermission, isOwner, currentUser, allUsers, recordAuditLog]);

  const assignTitleToUser = useCallback((targetUserId: string, titleData: { textAr: string; textEn: string; icon: string; color: string; isAdministrative?: boolean }) => {
    if (!hasPermission('canAssignTitles') && !isOwner()) return;

    const newTitle = {
      id: `t_${Date.now()}`,
      textAr: titleData.textAr,
      textEn: titleData.textEn,
      textTr: titleData.textEn,
      icon: titleData.icon,
      color: titleData.color,
      isDisplayed: true,
      isAdministrative: titleData.isAdministrative,
      assignedBy: currentUser.displayName,
      assignedDate: new Date().toISOString().slice(0, 10)
    };

    setAllUsers(prev => {
      const target = prev[targetUserId];
      if (!target) return prev;
      const updatedTitles = [...target.titles, newTitle];
      updateDoc(doc(db, 'users', targetUserId), { titles: updatedTitles }).catch(() => {});
      return {
        ...prev,
        [targetUserId]: { ...target, titles: updatedTitles }
      };
    });

    recordAuditLog(`منح لقب رسمي: ${titleData.textAr}`, `@${allUsers[targetUserId]?.username || targetUserId}`);
  }, [hasPermission, isOwner, currentUser, allUsers, recordAuditLog]);

  const removeTitleFromUser = useCallback((targetUserId: string, titleId: string) => {
    if (!hasPermission('canRemoveTitles') && !isOwner()) return;

    setAllUsers(prev => {
      const target = prev[targetUserId];
      if (!target) return prev;
      const updatedTitles = target.titles.filter(t => t.id !== titleId);
      updateDoc(doc(db, 'users', targetUserId), { titles: updatedTitles }).catch(() => {});
      return {
        ...prev,
        [targetUserId]: { ...target, titles: updatedTitles }
      };
    });

    recordAuditLog('إلغاء لقب رسمي', `@${allUsers[targetUserId]?.username || targetUserId}`);
  }, [hasPermission, isOwner, allUsers, recordAuditLog]);

  const assignBadgeToUser = useCallback((targetUserId: string, badgeData: { nameAr: string; nameEn: string; icon: string; description: string; rarity: any }) => {
    if (!hasPermission('canAssignBadges') && !isOwner()) return;

    const newBadge = {
      id: `b_${Date.now()}`,
      nameAr: badgeData.nameAr,
      nameEn: badgeData.nameEn,
      icon: badgeData.icon,
      description: badgeData.description,
      rarity: badgeData.rarity,
      earnedDate: new Date().toISOString().slice(0, 10),
      isDisplayed: true,
      assignedBy: currentUser.displayName
    };

    setAllUsers(prev => {
      const target = prev[targetUserId];
      if (!target) return prev;
      const updatedBadges = [...target.badges, newBadge];
      updateDoc(doc(db, 'users', targetUserId), { badges: updatedBadges }).catch(() => {});
      return {
        ...prev,
        [targetUserId]: { ...target, badges: updatedBadges }
      };
    });

    recordAuditLog(`منح وسام استحقاق: ${badgeData.nameAr}`, `@${allUsers[targetUserId]?.username || targetUserId}`);
  }, [hasPermission, isOwner, currentUser, allUsers, recordAuditLog]);

  const removeBadgeFromUser = useCallback((targetUserId: string, badgeId: string) => {
    if (!hasPermission('canAssignBadges') && !isOwner()) return;

    setAllUsers(prev => {
      const target = prev[targetUserId];
      if (!target) return prev;
      const updatedBadges = target.badges.filter(b => b.id !== badgeId);
      updateDoc(doc(db, 'users', targetUserId), { badges: updatedBadges }).catch(() => {});
      return {
        ...prev,
        [targetUserId]: { ...target, badges: updatedBadges }
      };
    });

    recordAuditLog('إلغاء وسام', `@${allUsers[targetUserId]?.username || targetUserId}`);
  }, [hasPermission, isOwner, allUsers, recordAuditLog]);

  const setMemberVerification = useCallback((targetUserId: string, isVerified: boolean, category?: VerificationCategory, reason?: string) => {
    if (!hasPermission('canVerifyAccounts') && !isOwner()) return;

    setAllUsers(prev => {
      const target = prev[targetUserId];
      if (!target) return prev;
      const updated = {
        ...target,
        isVerified,
        verificationCategory: isVerified ? (category || 'notable_figure') : undefined,
        verificationDetails: isVerified ? {
          category: category || 'notable_figure',
          verifiedBy: currentUser.displayName,
          verifiedAt: new Date().toISOString().slice(0, 10),
          reason
        } : undefined
      };

      updateDoc(doc(db, 'users', targetUserId), {
        isVerified: updated.isVerified,
        verificationCategory: updated.verificationCategory,
        verificationDetails: updated.verificationDetails
      }).catch(() => {});

      return { ...prev, [targetUserId]: updated };
    });

    recordAuditLog(isVerified ? `توثيق العضوية (${category})` : 'إلغاء التوثيق', `@${allUsers[targetUserId]?.username || targetUserId}`, reason);
  }, [hasPermission, isOwner, currentUser, allUsers, recordAuditLog]);

  const restrictMemberAccount = useCallback((targetUserId: string, status: AccountStatus, reason: string, features?: ('posting' | 'messaging' | 'commenting')[]) => {
    if (!hasPermission('canIssueWarnings') && !isOwner()) return;

    setAllUsers(prev => {
      const target = prev[targetUserId];
      if (!target) return prev;
      const updated = {
        ...target,
        status,
        restrictionDetails: {
          reason,
          issuedBy: currentUser.displayName,
          issuedAt: new Date().toISOString().slice(0, 10),
          restrictedFeatures: features || ['posting', 'messaging', 'commenting']
        }
      };

      updateDoc(doc(db, 'users', targetUserId), {
        status: updated.status,
        restrictionDetails: updated.restrictionDetails
      }).catch(() => {});

      return { ...prev, [targetUserId]: updated };
    });

    recordAuditLog(`فرض عقوبة: ${status}`, `@${allUsers[targetUserId]?.username || targetUserId}`, reason);
  }, [hasPermission, isOwner, currentUser, allUsers, recordAuditLog]);

  const restoreMemberAccount = useCallback((targetUserId: string) => {
    if (!hasPermission('canRestoreAccounts') && !isOwner()) return;

    setAllUsers(prev => {
      const target = prev[targetUserId];
      if (!target) return prev;
      const updated = {
        ...target,
        status: 'active' as AccountStatus,
        restrictionDetails: undefined
      };

      updateDoc(doc(db, 'users', targetUserId), {
        status: 'active',
        restrictionDetails: null
      }).catch(() => {});

      return { ...prev, [targetUserId]: updated };
    });

    recordAuditLog('استعادة العضوية ورفع العقوبات', `@${allUsers[targetUserId]?.username || targetUserId}`);
  }, [hasPermission, isOwner, allUsers, recordAuditLog]);

  const changeMemberRole = useCallback((targetUserId: string, newRole: UserRole) => {
    if (!hasPermission('canManageStaff') && !isOwner()) return;
    if (newRole === 'owner' && !isOwner()) return;

    setAllUsers(prev => {
      const target = prev[targetUserId];
      if (!target) return prev;
      const updated = { ...target, role: newRole };
      updateDoc(doc(db, 'users', targetUserId), { role: newRole }).catch(() => {});
      return { ...prev, [targetUserId]: updated };
    });

    recordAuditLog(`تغيير الرتبة إلى: ${newRole}`, `@${allUsers[targetUserId]?.username || targetUserId}`);
  }, [hasPermission, isOwner, allUsers, recordAuditLog]);

  const updateMemberPermissions = useCallback((targetUserId: string, permissions: Partial<StaffPermissions>) => {
    if (!hasPermission('canManagePermissions') && !isOwner()) return;

    setAllUsers(prev => {
      const target = prev[targetUserId];
      if (!target) return prev;
      const updated = {
        ...target,
        customPermissions: {
          ...(target.customPermissions || {}),
          ...permissions
        }
      };

      updateDoc(doc(db, 'users', targetUserId), { customPermissions: updated.customPermissions }).catch(() => {});
      return { ...prev, [targetUserId]: updated };
    });

    recordAuditLog('تعديل الصلاحيات المخصصة', `@${allUsers[targetUserId]?.username || targetUserId}`);
  }, [hasPermission, isOwner, allUsers, recordAuditLog]);

  // Posts & Interactions
  const toggleLikePost = useCallback((postId: string) => {
    if (!currentUserId) return;
    setPosts(prev => {
      const post = prev.find(p => p.id === postId);
      if (!post) return prev;
      const isNowLiked = !post.isLiked;
      const newLikesCount = isNowLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1);
      const existingLikedUserIds: string[] = (post as any).likedUserIds || [];
      const newLikedUserIds = isNowLiked
        ? Array.from(new Set([...existingLikedUserIds, currentUserId]))
        : existingLikedUserIds.filter(id => id !== currentUserId);

      updateDoc(doc(db, 'posts', postId), { 
        likesCount: newLikesCount,
        likedUserIds: newLikedUserIds
      }).catch(() => {});

      const likeDoc = doc(db, 'likes', `${postId}_${currentUserId}`);
      if (isNowLiked) {
        setDoc(likeDoc, {
          id: `${postId}_${currentUserId}`,
          postId,
          userId: currentUserId,
          createdAt: new Date().toISOString()
        }).catch(() => {});

        if (post.authorId !== currentUserId) {
          const newNotifId = `notif_like_${Date.now()}`;
          const newNotif: AppNotification = {
            id: newNotifId,
            type: 'like',
            actorId: currentUserId,
            actorName: currentUser.displayName,
            actorUsername: currentUser.username,
            actorAvatar: currentUser.avatarUrl,
            actorVerified: currentUser.isVerified,
            content: language === 'ar' ? 'أعجب بمنشورك' : 'liked your post',
            targetId: postId,
            timestamp: language === 'ar' ? 'الآن' : 'just now',
            isRead: false
          };
          setNotifications(p => [newNotif, ...p]);

          setDoc(doc(db, 'notifications', newNotifId), {
            ...newNotif,
            recipientId: post.authorId,
            createdAt: new Date().toISOString()
          }).catch(() => {});
        }
      } else {
        deleteDoc(likeDoc).catch(() => {});
      }

      return prev.map(p => {
        if (p.id === postId) {
          return { ...p, isLiked: isNowLiked, likesCount: newLikesCount, likedUserIds: newLikedUserIds } as any;
        }
        return p;
      });
    });
  }, [currentUserId, currentUser, language]);

  const toggleBookmarkPost = useCallback((postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, isBookmarked: !p.isBookmarked };
      }
      return p;
    }));
  }, []);

  const toggleRepost = useCallback((postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isNowReposted = !p.isReposted;
        const count = isNowReposted ? p.repostsCount + 1 : Math.max(0, p.repostsCount - 1);
        updateDoc(doc(db, 'posts', postId), { repostsCount: count }).catch(() => {});
        return { ...p, isReposted: isNowReposted, repostsCount: count };
      }
      return p;
    }));
  }, []);

  const votePoll = useCallback((postId: string, optionId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId && p.poll && !p.poll.hasVoted) {
        const updatedPoll = {
          ...p.poll,
          hasVoted: true,
          selectedOptionId: optionId,
          totalVotes: p.poll.totalVotes + 1,
          options: p.poll.options.map(opt => {
            if (opt.id === optionId) {
              return {
                ...opt,
                votes: opt.votes + 1,
                votedUserIds: [...opt.votedUserIds, currentUserId]
              };
            }
            return opt;
          })
        };
        updateDoc(doc(db, 'posts', postId), { poll: updatedPoll }).catch(() => {});
        return { ...p, poll: updatedPoll };
      }
      return p;
    }));
  }, [currentUserId]);

  const addPost = useCallback((content: string, mediaUrls?: string[], pollData?: any, category?: string, tags?: string[]) => {
    if (!currentUserId) return;
    const newPost: Post = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      authorId: currentUser.id,
      authorName: currentUser.displayName,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatarUrl,
      authorVerified: currentUser.isVerified,
      authorVerificationCategory: currentUser.verificationCategory,
      authorIsOG: currentUser.isOG,
      authorRole: currentUser.role,
      authorLevel: currentUser.level,
      timestamp: language === 'ar' ? 'الآن' : 'just now',
      content,
      mediaUrls: mediaUrls || [],
      poll: pollData,
      likesCount: 0,
      commentsCount: 0,
      repostsCount: 0,
      sharesCount: 0,
      isLiked: false,
      isReposted: false,
      isBookmarked: false,
      category: category || 'عام',
      tags: tags || []
    };

    setPosts(prev => [newPost, ...prev]);

    setDoc(doc(db, 'posts', newPost.id), {
      ...newPost,
      createdAt: new Date().toISOString()
    }).catch(err => {
      console.warn("Firestore addPost error:", err);
    });

    // Update XP
    setAllUsers(prev => {
      const me = prev[currentUserId];
      if (!me) return prev;
      const xpGained = platformSettings.xpPerPost || 25;
      const newXp = me.xp + xpGained;
      const updated = {
        ...me,
        xp: newXp,
        stats: {
          ...me.stats,
          postsCount: me.stats.postsCount + 1
        }
      };
      updateDoc(doc(db, 'users', currentUserId), {
        xp: newXp,
        'stats.postsCount': updated.stats.postsCount
      }).catch(() => {});
      return { ...prev, [currentUserId]: updated };
    });
  }, [currentUser, currentUserId, language, platformSettings]);

  const deletePost = useCallback((postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    if (post.authorId !== currentUserId && !hasPermission('canDeletePosts') && !isOwner()) return;

    setPosts(prev => prev.filter(p => p.id !== postId));
    deleteDoc(doc(db, 'posts', postId)).catch(() => {});

    if (post.authorId !== currentUserId) {
      recordAuditLog('حذف منشور بواسطة الإدارة', `@${post.authorUsername}`, `Post ID: ${postId}`);
    }
  }, [posts, currentUserId, hasPermission, isOwner, recordAuditLog]);

  const togglePinPost = useCallback((postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isNowPinned = !p.isPinned;
        updateDoc(doc(db, 'posts', postId), { isPinned: isNowPinned }).catch(() => {});
        return { ...p, isPinned: isNowPinned };
      }
      return p;
    }));
  }, []);

  const toggleFeaturePost = useCallback((postId: string) => {
    if (!hasPermission('canFeaturePosts') && !isOwner()) return;
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isNowFeatured = !p.isFeatured;
        updateDoc(doc(db, 'posts', postId), { isFeatured: isNowFeatured }).catch(() => {});
        return { ...p, isFeatured: isNowFeatured };
      }
      return p;
    }));
  }, [hasPermission, isOwner]);

  const toggleHidePost = useCallback((postId: string) => {
    if (!hasPermission('canHidePosts') && !isOwner()) return;
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isNowHidden = !p.isHidden;
        updateDoc(doc(db, 'posts', postId), { isHidden: isNowHidden }).catch(() => {});
        return { ...p, isHidden: isNowHidden };
      }
      return p;
    }));
  }, [hasPermission, isOwner]);

  const addComment = useCallback((postId: string, text: string, replyToCommentId?: string) => {
    if (!currentUserId) return;
    const newComment: PostComment = {
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      postId,
      authorId: currentUser.id,
      authorName: currentUser.displayName,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatarUrl,
      authorVerified: currentUser.isVerified,
      authorVerificationCategory: currentUser.verificationCategory,
      authorRole: currentUser.role,
      text,
      timestamp: language === 'ar' ? 'الآن' : 'just now',
      likesCount: 0,
      likedByCurrentUser: false,
      replyToCommentId
    };

    setPostComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const updatedCount = p.commentsCount + 1;
        updateDoc(doc(db, 'posts', postId), { commentsCount: updatedCount }).catch(() => {});
        return { ...p, commentsCount: updatedCount };
      }
      return p;
    }));

    setDoc(doc(db, 'comments', newComment.id), {
      ...newComment,
      createdAt: new Date().toISOString()
    }).catch(() => {});

    const targetPost = posts.find(p => p.id === postId);
    if (targetPost && targetPost.authorId !== currentUserId) {
      const newNotifId = `notif_comm_${Date.now()}`;
      const newNotif: AppNotification = {
        id: newNotifId,
        type: 'comment',
        actorId: currentUserId,
        actorName: currentUser.displayName,
        actorUsername: currentUser.username,
        actorAvatar: currentUser.avatarUrl,
        actorVerified: currentUser.isVerified,
        content: language === 'ar'
          ? `علّق على منشورك: "${text.slice(0, 30)}${text.length > 30 ? '...' : ''}"`
          : `commented on your post: "${text.slice(0, 30)}${text.length > 30 ? '...' : ''}"`,
        targetId: postId,
        timestamp: language === 'ar' ? 'الآن' : 'just now',
        isRead: false
      };
      setNotifications(prev => [newNotif, ...prev]);

      setDoc(doc(db, 'notifications', newNotifId), {
        ...newNotif,
        recipientId: targetPost.authorId,
        createdAt: new Date().toISOString()
      }).catch(() => {});
    }
  }, [currentUser, currentUserId, language, posts]);

  const likeComment = useCallback((postId: string, commentId: string) => {
    setPostComments(prev => {
      const list = prev[postId] || [];
      const updated = list.map(c => {
        if (c.id === commentId) {
          const isLiked = !c.likedByCurrentUser;
          const newLikes = isLiked ? c.likesCount + 1 : Math.max(0, c.likesCount - 1);
          updateDoc(doc(db, 'comments', commentId), { likesCount: newLikes }).catch(() => {});
          return {
            ...c,
            likedByCurrentUser: isLiked,
            likesCount: newLikes
          };
        }
        return c;
      });
      return { ...prev, [postId]: updated };
    });
  }, []);

  // Stories
  const addStory = useCallback((type: 'image' | 'text', urlOrText: string) => {
    if (!currentUserId) return;
    const newStory: Story = {
      id: `story_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.displayName,
      authorAvatar: currentUser.avatarUrl,
      type,
      imageUrl: type === 'image' ? urlOrText : undefined,
      textContent: type === 'text' ? urlOrText : undefined,
      timestamp: language === 'ar' ? 'الآن' : 'just now',
      hasUnseenStory: false,
      viewCount: 0
    };

    setStories(prev => [newStory, ...prev]);
    setDoc(doc(db, 'stories', newStory.id), {
      ...newStory,
      createdAt: new Date().toISOString()
    }).catch(() => {});
  }, [currentUser, currentUserId, language]);

  const markStoryViewed = useCallback((storyId: string) => {
    if (!currentUserId) return;
    setStories(prev => prev.map(s => {
      if (s.id === storyId) {
        const viewers: string[] = (s as any).viewers || [];
        if (!viewers.includes(currentUserId)) {
          const newViewers = [...viewers, currentUserId];
          const newCount = (s.viewCount || 0) + 1;
          updateDoc(doc(db, 'stories', storyId), {
            viewCount: newCount,
            viewers: newViewers
          }).catch(() => {});
          return { ...s, viewCount: newCount, hasUnseenStory: false, viewers: newViewers } as any;
        }
      }
      return s;
    }));
  }, [currentUserId]);

  // Messaging & Voice Notes
  const openConversation = useCallback((convId: string) => {
    setActiveConversationId(convId);
    navigateTo('inbox', { conversationId: convId });
  }, [navigateTo]);

  const startDirectMessageWith = useCallback((targetUserId: string) => {
    if (!currentUserId || targetUserId === currentUserId) return;

    const existing = conversations.find(c => 
      !c.isGroup && c.participantIds.includes(currentUserId) && c.participantIds.includes(targetUserId)
    );

    if (existing) {
      openConversation(existing.id);
      return;
    }

    const target = allUsers[targetUserId];
    if (!target) return;

    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      isGroup: false,
      participantIds: [currentUserId, targetUserId],
      participants: [
        {
          id: currentUserId,
          displayName: currentUser.displayName,
          username: currentUser.username,
          avatarUrl: currentUser.avatarUrl,
          isVerified: currentUser.isVerified,
          verificationCategory: currentUser.verificationCategory,
          isOnline: true
        },
        {
          id: target.id,
          displayName: target.displayName,
          username: target.username,
          avatarUrl: target.avatarUrl,
          isVerified: target.isVerified,
          verificationCategory: target.verificationCategory,
          isOnline: target.isOnline
        }
      ],
      lastMessage: '',
      lastMessageTimestamp: language === 'ar' ? 'الآن' : 'just now',
      unreadCount: 0
    };

    setConversations(prev => [newConv, ...prev]);
    setDoc(doc(db, 'conversations', newConv.id), {
      ...newConv,
      updatedAt: new Date().toISOString()
    }).catch(() => {});

    openConversation(newConv.id);
  }, [conversations, currentUserId, currentUser, allUsers, language, openConversation]);

  const sendMessage = useCallback((convId: string, text: string, mediaUrl?: string, replyTo?: any) => {
    if (!currentUserId) return;
    const conv = conversations.find(c => c.id === convId);
    const participantIds = conv?.participantIds || [currentUser.id];

    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId: convId,
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      senderAvatar: currentUser.avatarUrl,
      text,
      mediaUrl,
      mediaType: mediaUrl ? 'image' : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      reactions: [],
      replyToMessage: replyTo
    };

    setMessages(prev => ({
      ...prev,
      [convId]: [...(prev[convId] || []), newMsg]
    }));

    setConversations(prev => prev.map(c => {
      if (c.id === convId) {
        return {
          ...c,
          lastMessage: text || (mediaUrl ? '📷 صورة' : ''),
          lastMessageTimestamp: language === 'ar' ? 'الآن' : 'just now'
        };
      }
      return c;
    }));

    setDoc(doc(db, 'messages', newMsg.id), {
      ...newMsg,
      participantIds,
      timestamp: new Date().toISOString()
    }).catch(err => console.warn("Firestore send message notice:", err));

    updateDoc(doc(db, 'conversations', convId), {
      lastMessage: text || (mediaUrl ? '📷 صورة' : ''),
      lastMessageTimestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).catch(() => {});

    // Notification for other participant
    const otherParticipantId = participantIds.find(pid => pid !== currentUserId);
    if (otherParticipantId) {
      const newNotifId = `notif_msg_${Date.now()}`;
      setDoc(doc(db, 'notifications', newNotifId), {
        id: newNotifId,
        type: 'message',
        actorId: currentUserId,
        actorName: currentUser.displayName,
        actorUsername: currentUser.username,
        actorAvatar: currentUser.avatarUrl,
        actorVerified: currentUser.isVerified,
        recipientId: otherParticipantId,
        content: text ? (text.length > 35 ? text.slice(0, 35) + '...' : text) : 'أرسل لك صورة',
        targetId: convId,
        timestamp: language === 'ar' ? 'الآن' : 'just now',
        isRead: false,
        createdAt: new Date().toISOString()
      }).catch(() => {});
    }
  }, [currentUser, currentUserId, language, conversations]);

  const sendVoiceMessage = useCallback(async (convId: string, audioBlobOrUrl: Blob | string, durationSeconds: number) => {
    if (!currentUserId) return;
    const conv = conversations.find(c => c.id === convId);
    const participantIds = conv?.participantIds || [currentUser.id];

    let mediaUrl = '';
    if (typeof audioBlobOrUrl === 'string') {
      mediaUrl = audioBlobOrUrl;
    } else {
      const audioFile = new File([audioBlobOrUrl], `voice_${Date.now()}.mp3`, { type: 'audio/mpeg' });
      mediaUrl = await uploadMedia(audioFile, 'voice_messages');
    }

    const newMsg: Message = {
      id: `msg_voice_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId: convId,
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      senderAvatar: currentUser.avatarUrl,
      text: 'تسجيل صوتي 🎙️',
      mediaUrl,
      mediaType: 'voice',
      audioDuration: durationSeconds,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      reactions: []
    };

    setMessages(prev => ({
      ...prev,
      [convId]: [...(prev[convId] || []), newMsg]
    }));

    setConversations(prev => prev.map(c => {
      if (c.id === convId) {
        return {
          ...c,
          lastMessage: '🎙️ تسجيل صوتي',
          lastMessageTimestamp: language === 'ar' ? 'الآن' : 'just now'
        };
      }
      return c;
    }));

    setDoc(doc(db, 'messages', newMsg.id), {
      ...newMsg,
      participantIds,
      timestamp: new Date().toISOString()
    }).catch(() => {});

    updateDoc(doc(db, 'conversations', convId), {
      lastMessage: '🎙️ تسجيل صوتي',
      lastMessageTimestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).catch(() => {});

    const otherParticipantId = participantIds.find(pid => pid !== currentUserId);
    if (otherParticipantId) {
      const newNotifId = `notif_voice_${Date.now()}`;
      setDoc(doc(db, 'notifications', newNotifId), {
        id: newNotifId,
        type: 'message',
        actorId: currentUserId,
        actorName: currentUser.displayName,
        actorUsername: currentUser.username,
        actorAvatar: currentUser.avatarUrl,
        actorVerified: currentUser.isVerified,
        recipientId: otherParticipantId,
        content: 'أرسل لك تسجيلاً صوتياً 🎙️',
        targetId: convId,
        timestamp: language === 'ar' ? 'الآن' : 'just now',
        isRead: false,
        createdAt: new Date().toISOString()
      }).catch(() => {});
    }
  }, [currentUser, currentUserId, language, conversations]);

  const deleteMessage = useCallback(async (convId: string, messageId: string) => {
    setMessages(prev => ({
      ...prev,
      [convId]: (prev[convId] || []).filter(m => m.id !== messageId)
    }));
    deleteDoc(doc(db, 'messages', messageId)).catch(() => {});
  }, []);

  const addReaction = useCallback((convId: string, messageId: string, emoji: string) => {
    setMessages(prev => {
      const list = prev[convId] || [];
      const updated = list.map(m => {
        if (m.id === messageId) {
          const filtered = m.reactions.filter(r => r.userId !== currentUserId);
          return {
            ...m,
            reactions: [...filtered, { emoji, userId: currentUserId }]
          };
        }
        return m;
      });
      return { ...prev, [convId]: updated };
    });
  }, [currentUserId]);

  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // WebRTC Real Voice Calls
  const startVoiceCall = useCallback(async (receiverId: string, receiverName: string, receiverAvatar: string) => {
    if (!currentUserId) return;
    try {
      const callId = await webrtcVoiceManager.startCall(
        receiverId,
        receiverName,
        receiverAvatar,
        { id: currentUser.id, name: currentUser.displayName, avatar: currentUser.avatarUrl },
        (call) => setCurrentCall(call)
      );

      setCurrentCall({
        id: callId,
        callerId: currentUser.id,
        callerName: currentUser.displayName,
        callerAvatar: currentUser.avatarUrl,
        receiverId,
        receiverName,
        receiverAvatar,
        status: 'calling',
        createdAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.warn('Voice call initiation notice:', err.message || err);
    }
  }, [currentUserId, currentUser]);

  const acceptVoiceCall = useCallback(async () => {
    if (!currentCall) return;
    try {
      await webrtcVoiceManager.answerCall(currentCall.id, (call) => setCurrentCall(call));
      setCurrentCall(prev => prev ? { ...prev, status: 'connected' } : null);
    } catch (err: any) {
      console.warn("Call answer notice:", err.message || err);
    }
  }, [currentCall]);

  const declineVoiceCall = useCallback(async () => {
    if (!currentCall) return;
    await webrtcVoiceManager.rejectCall(currentCall.id);
    setCurrentCall(null);
  }, [currentCall]);

  const endVoiceCall = useCallback(async () => {
    if (!currentCall) return;
    await webrtcVoiceManager.endCall(currentCall.id);
    setCurrentCall(null);
  }, [currentCall]);

  const toggleCallMute = useCallback(() => {
    const next = !isCallMuted;
    setIsCallMuted(next);
    webrtcVoiceManager.setMute(next);
  }, [isCallMuted]);

  // Events
  const registerForEvent = useCallback((eventId: string) => {
    if (!currentUserId) return;
    setEvents(prev => prev.map(ev => {
      if (ev.id === eventId && !ev.participantUserIds.includes(currentUserId)) {
        const updated = {
          ...ev,
          isRegistered: true,
          registeredCount: ev.registeredCount + 1,
          participantUserIds: [...ev.participantUserIds, currentUserId]
        };

        updateDoc(doc(db, 'events', eventId), {
          registeredCount: updated.registeredCount,
          participantUserIds: updated.participantUserIds
        }).catch(() => {});

        setDoc(doc(db, 'event_participants', `${eventId}_${currentUserId}`), {
          id: `${eventId}_${currentUserId}`,
          eventId,
          userId: currentUserId,
          joinedAt: new Date().toISOString()
        }).catch(() => {});

        return updated;
      }
      return ev;
    }));
  }, [currentUserId]);

  const cancelEventRegistration = useCallback((eventId: string) => {
    if (!currentUserId) return;
    setEvents(prev => prev.map(ev => {
      if (ev.id === eventId && ev.participantUserIds.includes(currentUserId)) {
        const updated = {
          ...ev,
          isRegistered: false,
          registeredCount: Math.max(0, ev.registeredCount - 1),
          participantUserIds: ev.participantUserIds.filter(id => id !== currentUserId)
        };

        updateDoc(doc(db, 'events', eventId), {
          registeredCount: updated.registeredCount,
          participantUserIds: updated.participantUserIds
        }).catch(() => {});

        deleteDoc(doc(db, 'event_participants', `${eventId}_${currentUserId}`)).catch(() => {});

        return updated;
      }
      return ev;
    }));
  }, [currentUserId]);

  const addEvent = useCallback((eventData: Partial<SocialEvent>) => {
    if (!hasPermission('canManageEvents') && !isOwner()) return;

    const newEvent: SocialEvent = {
      id: `ev_${Date.now()}`,
      title: eventData.title || 'فعالية جديدة',
      subtitle: eventData.subtitle || '',
      description: eventData.description || '',
      coverUrl: eventData.coverUrl || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200',
      dateStr: eventData.dateStr || '2026-12-01',
      timeStr: eventData.timeStr || '20:00 GMT+3',
      locationType: eventData.locationType || 'in_app',
      locationLabel: eventData.locationLabel || 'شبكة Q الصوتية',
      organizer: {
        id: currentUser.id,
        name: currentUser.displayName,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
        isVerified: currentUser.isVerified
      },
      registeredCount: 0,
      maxParticipants: eventData.maxParticipants || 100,
      isOfficial: true,
      isRegistered: false,
      category: eventData.category || 'بطولات ومنافسات',
      participantUserIds: [],
      prizes: eventData.prizes || [],
      rules: eventData.rules || [],
      status: 'active'
    };

    setEvents(prev => [newEvent, ...prev]);
    setDoc(doc(db, 'events', newEvent.id), {
      ...newEvent,
      createdAt: new Date().toISOString()
    }).catch(() => {});

    recordAuditLog('إنشاء فعالية جديدة', newEvent.title);
  }, [hasPermission, isOwner, currentUser, recordAuditLog]);

  const updateEventStatus = useCallback((eventId: string, status: 'active' | 'completed' | 'cancelled') => {
    if (!hasPermission('canManageEvents') && !isOwner()) return;
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        updateDoc(doc(db, 'events', eventId), { status }).catch(() => {});
        return { ...e, status };
      }
      return e;
    }));
  }, [hasPermission, isOwner]);

  // Notifications
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    updateDoc(doc(db, 'notifications', id), { isRead: true }).catch(() => {});
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  // Reports
  const openReportModal = useCallback((target: any) => {
    setReportingTarget(target);
  }, []);

  const closeReportModal = useCallback(() => {
    setReportingTarget(null);
  }, []);

  const submitReport = useCallback((category: ReportCategory, explanation: string) => {
    if (!reportingTarget || !currentUserId) return;

    const newReport: ModerationReport = {
      id: `rep_${Date.now()}`,
      reporterId: currentUser.id,
      reporterName: currentUser.displayName,
      targetType: reportingTarget.type,
      targetId: reportingTarget.id,
      targetTitleOrSnippet: reportingTarget.title,
      targetAuthorId: reportingTarget.authorId,
      targetAuthorName: reportingTarget.authorName,
      category,
      explanation,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'pending'
    };

    setReports(prev => [newReport, ...prev]);
    setDoc(doc(db, 'reports', newReport.id), newReport).catch(() => {});
    setReportingTarget(null);
  }, [reportingTarget, currentUser, currentUserId]);

  const updateReportStatus = useCallback((reportId: string, status: ReportStatus, moderatorNotes?: string, action?: string) => {
    if (!hasPermission('canReviewReports') && !isOwner()) return;

    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        const updated = {
          ...r,
          status,
          assignedStaffId: currentUser.id,
          assignedStaffName: currentUser.displayName,
          moderatorNotes: moderatorNotes || r.moderatorNotes,
          resolutionAction: action || r.resolutionAction
        };
        updateDoc(doc(db, 'reports', reportId), updated).catch(() => {});
        return updated;
      }
      return r;
    }));

    recordAuditLog(`تحديث حالة البلاغ: ${status}`, `Report: ${reportId}`, action);
  }, [hasPermission, isOwner, currentUser, recordAuditLog]);

  // In-App Announcements & Welcome Banner
  const addAnnouncement = useCallback((ann: Partial<PlatformAnnouncement>) => {
    if (!isOwner()) return;
    const newAnn: PlatformAnnouncement = {
      id: `ann_${Date.now()}`,
      title: ann.title || '',
      content: ann.content || '',
      type: ann.type || 'banner',
      imageUrl: ann.imageUrl,
      actionText: ann.actionText,
      actionUrl: ann.actionUrl,
      targetRole: ann.targetRole || 'all',
      authorName: currentUser.displayName,
      timestamp: language === 'ar' ? 'الآن' : 'just now',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    setDoc(doc(db, 'announcements', newAnn.id), newAnn).catch(() => {});
    recordAuditLog('إنشاء إعلان منصة ترويجي', newAnn.title);
  }, [isOwner, currentUser, language, recordAuditLog]);

  const toggleAnnouncement = useCallback((id: string) => {
    if (!isOwner()) return;
    setAnnouncements(prev => prev.map(a => {
      if (a.id === id) {
        const next = !a.isActive;
        updateDoc(doc(db, 'announcements', id), { isActive: next }).catch(() => {});
        return { ...a, isActive: next };
      }
      return a;
    }));
  }, [isOwner]);

  const deleteAnnouncement = useCallback((id: string) => {
    if (!isOwner()) return;
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    deleteDoc(doc(db, 'announcements', id)).catch(() => {});
    recordAuditLog('حذف إعلان ترويجي', `ID: ${id}`);
  }, [isOwner, recordAuditLog]);

  const updateWelcomeBanner = useCallback((banner: WelcomeBannerSettings) => {
    if (!isOwner()) return;
    setPlatformSettings(prev => {
      const updated = { ...prev, welcomeBanner: banner };
      setDoc(doc(db, 'platform_settings', 'global'), updated, { merge: true }).catch(() => {});
      return updated;
    });
    recordAuditLog('تحديث رسالة الترحيب الرئيسية', banner.title);
  }, [isOwner, recordAuditLog]);

  const updatePlatformSettings = useCallback((settings: Partial<PlatformSettings>) => {
    if (!isOwner()) return;
    setPlatformSettings(prev => {
      const updated = { ...prev, ...settings };
      setDoc(doc(db, 'platform_settings', 'global'), updated, { merge: true }).catch(() => {});
      return updated;
    });
    recordAuditLog('تحديث إعدادات المنصة العامة', 'PlatformSettings');
  }, [isOwner, recordAuditLog]);

  const toggleBlockUser = useCallback((userId: string) => {
    setBlockedUserIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  }, []);

  const toggleMuteUser = useCallback((userId: string) => {
    setMutedUserIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  }, []);

  const openAdminProfileMenu = useCallback((targetUser: UserProfile) => {
    setAdminTargetUser(targetUser);
  }, []);

  const closeAdminProfileMenu = useCallback(() => {
    setAdminTargetUser(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        language,
        t,
        setLanguage,
        isRTL,

        firebaseUser,
        firebaseReady,
        isAuthenticated,
        authMode,
        setAuthMode,
        login,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        resetPasswordEmail,
        deleteAccountPermanently,
        uploadFile,
        logout,
        switchUser,

        hasPermission,
        isStaff,
        isOwner,

        activeTab,
        navigationHistory,
        navigateTo,
        goBack,

        currentUserId,
        currentUser,
        viewingUserId,
        viewingUser,
        allUsers,
        openUserProfile,
        toggleFollow,
        updateProfile,
        isFollowing,

        addAdminNote,
        assignTitleToUser,
        removeTitleFromUser,
        assignBadgeToUser,
        removeBadgeFromUser,
        setMemberVerification,
        restrictMemberAccount,
        restoreMemberAccount,
        changeMemberRole,
        updateMemberPermissions,

        posts,
        postComments,
        toggleLikePost,
        toggleBookmarkPost,
        toggleRepost,
        votePoll,
        addPost,
        deletePost,
        togglePinPost,
        toggleFeaturePost,
        toggleHidePost,
        addComment,
        likeComment,

        stories,
        activeStory,
        setActiveStory,
        addStory,
        markStoryViewed,
        myFollowedUserIds,

        conversations,
        messages,
        activeConversationId,
        openConversation,
        startDirectMessageWith,
        sendMessage,
        sendVoiceMessage,
        deleteMessage,
        addReaction,
        unreadMessagesCount,

        currentCall,
        isCallMuted,
        startVoiceCall,
        acceptVoiceCall,
        declineVoiceCall,
        endVoiceCall,
        toggleCallMute,

        events,
        selectedEventId,
        setSelectedEventId,
        registerForEvent,
        cancelEventRegistration,
        addEvent,
        updateEventStatus,

        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        markAllNotificationsRead,

        reports,
        auditLogs,
        reportingTarget,
        openReportModal,
        closeReportModal,
        submitReport,
        updateReportStatus,

        announcements,
        addAnnouncement,
        toggleAnnouncement,
        deleteAnnouncement,
        platformSettings,
        updatePlatformSettings,
        updateWelcomeBanner,

        blockedUserIds,
        toggleBlockUser,
        mutedUserIds,
        toggleMuteUser,

        adminTargetUser,
        openAdminProfileMenu,
        closeAdminProfileMenu,

        verificationDetailUser,
        setVerificationDetailUser,
        levelDetailUser,
        setLevelDetailUser,

        isDrawerOpen,
        setIsDrawerOpen,
        isCreatePostOpen,
        setIsCreatePostOpen,
        lightboxImage,
        setLightboxImage,
        selectedPostForComments,
        setSelectedPostForComments,
        deviceFrameMode,
        setDeviceFrameMode,
        showAndroidCodeExport,
        setShowAndroidCodeExport
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
