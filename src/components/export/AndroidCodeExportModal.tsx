/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Copy, Check, Code, ShieldCheck, Database, Smartphone, Terminal } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AndroidCodeExportModal: React.FC = () => {
  const { showAndroidCodeExport, setShowAndroidCodeExport } = useApp();
  const [activeTab, setActiveTab] = useState<'capacitor' | 'activity' | 'theme' | 'nav' | 'viewmodel' | 'rules'>('capacitor');
  const [copied, setCopied] = useState(false);

  if (!showAndroidCodeExport) return null;

  const CODE_SNIPPETS = {
    capacitor: `// Capacitor & Android APK Build Instructions
// App ID: com.q.social
// App Name: Q — Global Android Network

# 1. Build the modern web bundle:
npm run build

# 2. Add Android platform (if not already added):
npx cap add android

# 3. Synchronize plugins and assets:
npx cap sync android

# 4. Open in Android Studio to build APK or AAB:
npx cap open android

# 5. Build directly from command line (Release APK):
cd android
./gradlew assembleRelease
# Output APK location:
# android/app/build/outputs/apk/release/app-release-unsigned.apk`,

    activity: `// MainActivity.kt - Native Android Single Activity Architecture
package com.q.social

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.q.social.ui.navigation.QNavGraph
import com.q.social.ui.theme.QTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            QTheme {
                val navController = rememberNavController()
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = QTheme.colors.primaryBackground
                ) {
                    QNavGraph(navController = navController)
                }
            }
        }
    }
}`,

    theme: `// QTheme.kt - Custom Obsidian & Gold Material3 Theme
package com.q.social.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

val PureBlack = Color(0xFF000000)
val ObsidianSurface = Color(0xFF121212)
val ElevatedSurface = Color(0xFF191919)
val GoldAccent = Color(0xFFC5A46D)
val GoldLight = Color(0xFFDFCA98)
val MutedBlue = Color(0xFF1C2C4A)
val PurpleAdmin = Color(0xFF8B5CF6)
val TextPrimary = Color(0xFFFFFFFF)
val TextSecondary = Color(0xFFA8A8A8)
val HairlineBorder = Color(0x14FFFFFF)

private val DarkColorScheme = darkColorScheme(
    primary = GoldAccent,
    onPrimary = PureBlack,
    surface = ObsidianSurface,
    onSurface = TextPrimary,
    background = PureBlack,
    onBackground = TextPrimary
)

@Composable
fun QTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = QTypography,
        content = content
    )
}`,

    nav: `// NavGraph.kt - Navigation Compose with Deeplinking & User ID Arguments
package com.q.social.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.q.social.ui.screens.*

@Composable
fun QNavGraph(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = Screen.Home.route
    ) {
        composable(Screen.Home.route) {
            HomeScreen(
                onNavigateToProfile = { userId ->
                    navController.navigate(Screen.Profile.createRoute(userId))
                },
                onNavigateToNotifications = {
                    navController.navigate(Screen.Notifications.route)
                }
            )
        }
        composable(
            route = Screen.Profile.route,
            arguments = listOf(navArgument("userId") { type = NavType.StringType })
        ) { backStackEntry ->
            val userId = backStackEntry.arguments?.getString("userId") ?: ""
            UserProfileScreen(
                userId = userId,
                onNavigateBack = { navController.popBackStack() },
                onNavigateToEditor = { navController.navigate(Screen.ProfileEditor.route) }
            )
        }
        composable(Screen.ProfileEditor.route) {
            ProfileEditorScreen(onNavigateBack = { navController.popBackStack() })
        }
        composable(Screen.Notifications.route) {
            NotificationsScreen(onNavigateBack = { navController.popBackStack() })
        }
        composable(Screen.Discover.route) {
            DiscoverScreen(onNavigateToProfile = { userId ->
                navController.navigate(Screen.Profile.createRoute(userId))
            })
        }
        composable(Screen.Inbox.route) {
            MessagingHubScreen(navController = navController)
        }
        composable(Screen.Events.route) {
            EventsScreen(navController = navController)
        }
    }
}`,

    viewmodel: `// UserProfileViewModel.kt - MVVM Architecture with Coroutines & StateFlow
package com.q.social.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.q.social.domain.model.UserProfile
import com.q.social.domain.repository.UserRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface ProfileUiState {
    object Loading : ProfileUiState
    data class Success(val profile: UserProfile, val isFollowing: Boolean) : ProfileUiState
    data class Error(val message: String) : ProfileUiState
}

@HiltViewModel
class UserProfileViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<ProfileUiState>(ProfileUiState.Loading)
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    fun loadProfile(userId: String) {
        viewModelScope.launch {
            _uiState.value = ProfileUiState.Loading
            userRepository.getUserProfile(userId).collect { profile ->
                if (profile != null) {
                    val isFollowing = userRepository.checkIsFollowing(userId)
                    _uiState.value = ProfileUiState.Success(profile, isFollowing)
                } else {
                    _uiState.value = ProfileUiState.Error("User profile not found")
                }
            }
        }
    }

    fun toggleFollow(userId: String) {
        viewModelScope.launch {
            userRepository.toggleFollow(userId)
        }
    }
}`,

    firestore: `// UserRepositoryImpl.kt - Repository Pattern with Flow & Firestore
package com.q.social.data.repository

import com.q.social.domain.model.UserProfile
import com.q.social.domain.repository.UserRepository
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import javax.inject.Inject

class UserRepositoryImpl @Inject constructor(
    private val firestore: FirebaseFirestore,
    private val auth: FirebaseAuth
) : UserRepository {

    override fun getUserProfile(userId: String): Flow<UserProfile?> = callbackFlow {
        val listener = firestore.collection("user_profiles")
            .document(userId)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val profile = snapshot?.toObject(UserProfile::class.java)
                trySend(profile)
            }
        awaitClose { listener.remove() }
    }
}`,

    rules: `// firestore.rules - Security Rules with Strict Role-Based Access Control
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/roles/$(request.auth.uid)).data.role == 'owner';
    }

    function isStaff() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/roles/$(request.auth.uid)).data.role in 
        ['owner', 'super_admin', 'admin', 'senior_moderator', 'moderator', 'assistant'];
    }

    // User Profiles
    match /user_profiles/{userId} {
      allow read: if true;
      allow write: if isAuthenticated() && (request.auth.uid == userId || isOwner());
    }

    // Posts & Comments
    match /posts/{postId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
        (resource.data.authorId == request.auth.uid || isStaff());
    }

    // Direct Messages: Strictly private between participants
    match /conversations/{conversationId} {
      allow read, write: if isAuthenticated() && 
        request.auth.uid in resource.data.participantIds;
    }

    // Moderation Reports: Only reporter can create, only staff can read
    match /reports/{reportId} {
      allow create: if isAuthenticated();
      allow read, update: if isStaff();
      allow delete: if isOwner();
    }
  }
}`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE_SNIPPETS[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[85vh] rounded-3xl bg-[#121212] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Smartphone size={20} className="text-[#C5A46D]" />
            <h3 className="font-bold text-white text-base">معمارية أندرويد الأصلية (Kotlin & Compose)</h3>
          </div>
          <button
            onClick={() => setShowAndroidCodeExport(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto no-scrollbar bg-[#161616] border-b border-white/[0.06]">
          {[
            { id: 'capacitor', label: 'Capacitor APK' },
            { id: 'activity', label: 'MainActivity.kt' },
            { id: 'theme', label: 'QTheme.kt' },
            { id: 'nav', label: 'QNavGraph.kt' },
            { id: 'viewmodel', label: 'ProfileViewModel.kt' },
            { id: 'firestore', label: 'UserRepository.kt' },
            { id: 'rules', label: 'firestore.rules' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono shrink-0 transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#C5A46D] text-black font-bold'
                  : 'bg-white/5 text-[#A8A8A8] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code Content */}
        <div className="relative flex-1 overflow-y-auto p-4 bg-black font-mono text-xs text-[#D1D5DB] leading-relaxed">
          <button
            onClick={handleCopy}
            className="absolute top-3 end-3 px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs flex items-center gap-1.5 hover:bg-white/20 active:scale-95 transition-all shadow"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'تم النسخ!' : 'نسخ الكود'}</span>
          </button>

          <pre className="overflow-x-auto whitespace-pre">
            <code>{CODE_SNIPPETS[activeTab]}</code>
          </pre>
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-[#161616] border-t border-white/[0.08] flex items-center justify-between text-[11px] text-[#8E8E93]">
          <span>Single Activity · Jetpack Compose Material3 · Hilt · Coroutines · Flow</span>
          <button
            onClick={() => setShowAndroidCodeExport(false)}
            className="px-4 py-1.5 rounded-xl bg-[#C5A46D] text-black font-bold text-xs"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
