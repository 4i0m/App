/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AndroidFrame } from './components/common/AndroidFrame';
import { AndroidTopBar } from './components/common/AndroidTopBar';
import { AndroidBottomNav } from './components/common/AndroidBottomNav';
import { HomeFeed } from './components/home/HomeFeed';
import { DiscoverScreen } from './components/discover/DiscoverScreen';
import { MessagingHub } from './components/messages/MessagingHub';
import { EventsScreen } from './components/events/EventsScreen';
import { UserProfileScreen } from './components/profile/UserProfileScreen';
import { ProfileEditorScreen } from './components/profile/ProfileEditorScreen';
import { NotificationsScreen } from './components/notifications/NotificationsScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Landing } from './components/Landing';
import { AuthScreen } from './components/auth/AuthScreen';
import { AdminProfileMenuModal } from './components/profile/AdminProfileMenuModal';
import { VerificationDetailModal, LevelDetailModal } from './components/common/IdentityModals';
import { ProfileDrawer } from './components/drawer/ProfileDrawer';
import { CreatePostModal } from './components/create/CreatePostModal';
import { ReportModal } from './components/common/ReportModal';
import { CommentsModal } from './components/common/CommentsModal';
import { StoryViewerModal } from './components/common/StoryViewerModal';
import { LightboxModal } from './components/common/LightboxModal';
import { AndroidCodeExportModal } from './components/export/AndroidCodeExportModal';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';

const AppContent: React.FC = () => {
  const { 
    activeTab, 
    activeConversationId, 
    authMode,
    setAuthMode,
    goBack,
    lightboxImage,
    setLightboxImage,
    selectedPostForComments,
    setSelectedPostForComments,
    isCreatePostOpen,
    setIsCreatePostOpen,
    isDrawerOpen,
    setIsDrawerOpen,
    reportingTarget,
    closeReportModal,
    adminTargetUser,
    closeAdminProfileMenu,
    verificationDetailUser,
    setVerificationDetailUser,
    levelDetailUser,
    setLevelDetailUser,
    showAndroidCodeExport,
    setShowAndroidCodeExport
  } = useApp();

  // Android hardware back button & system UI configuration
  useEffect(() => {
    try {
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#000000' }).catch(() => {});
    } catch (_) {}

    let listenerHandle: any = null;
    try {
      listenerHandle = CapApp.addListener('backButton', () => {
        if (lightboxImage) { setLightboxImage(null); return; }
        if (selectedPostForComments) { setSelectedPostForComments(null); return; }
        if (isCreatePostOpen) { setIsCreatePostOpen(false); return; }
        if (isDrawerOpen) { setIsDrawerOpen(false); return; }
        if (reportingTarget) { closeReportModal(); return; }
        if (adminTargetUser) { closeAdminProfileMenu(); return; }
        if (verificationDetailUser) { setVerificationDetailUser(null); return; }
        if (levelDetailUser) { setLevelDetailUser(null); return; }
        if (showAndroidCodeExport) { setShowAndroidCodeExport(false); return; }

        const handled = goBack();
        if (!handled) {
          CapApp.exitApp();
        }
      });
    } catch (_) {}

    return () => {
      listenerHandle?.then?.((l: any) => l.remove()).catch?.(() => {});
    };
  }, [
    goBack,
    lightboxImage,
    setLightboxImage,
    selectedPostForComments,
    setSelectedPostForComments,
    isCreatePostOpen,
    setIsCreatePostOpen,
    isDrawerOpen,
    setIsDrawerOpen,
    reportingTarget,
    closeReportModal,
    adminTargetUser,
    closeAdminProfileMenu,
    verificationDetailUser,
    setVerificationDetailUser,
    levelDetailUser,
    setLevelDetailUser,
    showAndroidCodeExport,
    setShowAndroidCodeExport
  ]);

  // Protected Entry: If not authenticated, prompt sign-in with Google via Landing or AuthScreen
  if (authMode !== 'authenticated') {
    if (authMode === 'login' || authMode === 'register') {
      return (
        <AndroidFrame>
          <AuthScreen />
        </AndroidFrame>
      );
    }

    return (
      <AndroidFrame>
        <Landing onSuccess={() => setAuthMode('authenticated')} />
      </AndroidFrame>
    );
  }

  const renderCurrentScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <AndroidTopBar />
            <HomeFeed />
          </>
        );
      case 'discover':
        return <DiscoverScreen />;
      case 'inbox':
        return <MessagingHub />;
      case 'events':
        return <EventsScreen />;
      case 'profile':
        return <UserProfileScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'profile_editor':
        return <ProfileEditorScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'admin_dashboard':
        return <AdminDashboard />;
      default:
        return (
          <>
            <AndroidTopBar />
            <HomeFeed />
          </>
        );
    }
  };

  // Hide bottom nav when in an active direct message conversation or full-screen editor
  const shouldShowBottomNav =
    activeTab !== 'profile_editor' &&
    activeTab !== 'admin_dashboard' &&
    !(activeTab === 'inbox' && activeConversationId);

  return (
    <AndroidFrame>
      <div className="relative flex-1 flex flex-col w-full bg-black min-h-full">
        {renderCurrentScreen()}

        {shouldShowBottomNav && <AndroidBottomNav />}

        {/* Global Overlays & Modals */}
        <ProfileDrawer />
        <CreatePostModal />
        <ReportModal />
        <CommentsModal />
        <StoryViewerModal />
        <LightboxModal />
        <AndroidCodeExportModal />
        <AdminProfileMenuModal />
        <VerificationDetailModal />
        <LevelDetailModal />
      </div>
    </AndroidFrame>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
