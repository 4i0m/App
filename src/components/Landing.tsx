/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { signInWithGoogle } from '../auth';
import { QLogo } from './common/QLogo';
import {
  Sparkles,
  ShieldCheck,
  Radio,
  Flame,
  Globe,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Mail,
  UserCheck
} from 'lucide-react';
import { LoginForm } from './auth/AuthScreen';

interface LandingProps {
  /**
   * Protected children (e.g. HomeFeed or main app view) rendered when authenticated.
   */
  children?: React.ReactNode;
  /**
   * Optional custom callback when user successfully signs in.
   */
  onSuccess?: () => void;
}

export const Landing: React.FC<LandingProps> = ({ children, onSuccess }) => {
  const {
    firebaseUser,
    authMode,
    setAuthMode,
    loginWithGoogle: appLoginWithGoogle,
    language,
    setLanguage,
    t,
    isRTL,
    currentUser
  } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAlternativeLogin, setShowAlternativeLogin] = useState(false);

  // Check if user is authenticated (Protected Component check)
  const isUserAuthenticated = authMode === 'authenticated' && !!firebaseUser;

  // If already authenticated and children provided, render protected content
  if (isUserAuthenticated && children) {
    return <>{children}</>;
  }

  // Handle Google Sign-In using auth.ts helper + AppContext sync
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Execute the Google popup sign-in
      const res = await signInWithGoogle();

      if (res.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
        return;
      }

      if (res.user) {
        // Synchronize with application state
        await appLoginWithGoogle();
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err: unknown) {
      console.error('Landing Google Sign-in Error:', err);
      setErrorMessage(
        language === 'ar'
          ? 'تعذر إكمال تسجيل الدخول باستخدام حساب Google. يرجى المحاولة مرة أخرى.'
          : 'Unable to complete sign in with Google. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-[#EDEDED] flex flex-col justify-between overflow-x-hidden selection:bg-[#C5A46D]/30 selection:text-[#C5A46D]">
      {/* Dynamic Ambient Luxury Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-96 bg-gradient-to-b from-[#C5A46D]/20 via-[#9C7E45]/05 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-72 h-72 bg-[#C5A46D]/10 blur-[100px] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="relative z-10 pt-6 px-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <QLogo size={32} withGlow={true} />
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-widest text-[#EDEDED]">
              Q NETWORK
            </span>
            <span className="text-[9px] tracking-wider text-[#C5A46D] font-semibold uppercase">
              {language === 'ar' ? 'الشبكة الاجتماعية العالمية' : 'Global Creator Network'}
            </span>
          </div>
        </div>

        {/* Language Selector */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs text-[#A8A8A8] hover:text-white transition-all active:scale-95"
          title="Switch Language"
        >
          <Globe size={13} className="text-[#C5A46D]" />
          <span className="font-medium uppercase">{language === 'ar' ? 'English' : 'عربي'}</span>
        </button>
      </header>

      {/* Main Content Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-6 max-w-md mx-auto w-full">
        {/* Glowing Hero Emblem */}
        <div className="relative my-4 group cursor-pointer">
          <div className="absolute -inset-4 rounded-full bg-[#C5A46D]/20 blur-xl group-hover:bg-[#C5A46D]/30 transition-all duration-700" />
          <QLogo size={110} withGlow={true} className="transform group-hover:scale-105 transition-transform duration-500" />
        </div>

        {/* Hero Title */}
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-2 mb-2 leading-tight">
          {language === 'ar' ? (
            <>
              بوابتك إلى <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F9E8C7] via-[#DFCA98] to-[#C5A46D]">شبكة المبدعين</span> العالمية
            </>
          ) : (
            <>
              Welcome to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F9E8C7] via-[#DFCA98] to-[#C5A46D]">Global Creator</span> Network
            </>
          )}
        </h1>

        {/* Hero Description */}
        <p className="text-xs text-[#A8A8A8] font-normal leading-relaxed max-w-xs mb-6">
          {language === 'ar'
            ? 'سجّل الدخول بحساب Google للوصول إلى التغذية الإخبارية، الغرف الصوتية المباشرة، وشارات التوثيق الحصرية.'
            : 'Sign in with Google to explore the live feed, WebRTC voice rooms, verified ranks, and connect with creators.'}
        </p>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="w-full mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-start animate-in fade-in">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[11px] font-medium text-red-300 leading-snug">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Primary Call-to-Action: Google Sign-In Button */}
        <div className="w-full space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full relative flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-white hover:bg-[#F2F2F2] active:bg-[#E5E5E5] text-[#1F1F1F] font-bold text-sm shadow-[0_4px_24px_rgba(255,255,255,0.15)] hover:shadow-[0_6px_30px_rgba(197,164,109,0.3)] transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin text-[#1F1F1F]" />
                <span>{language === 'ar' ? 'جارٍ تسجيل الدخول...' : 'Signing in...'}</span>
              </>
            ) : (
              <>
                {/* Official Google Brand 'G' Logo */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>

                <span className="font-semibold text-xs sm:text-sm tracking-wide">
                  {language === 'ar' ? 'تسجيل الدخول باستخدام Google' : 'Sign in with Google'}
                </span>

                {isRTL ? (
                  <ArrowLeft size={16} className="text-[#757575] group-hover:-translate-x-0.5 transition-transform ms-auto" />
                ) : (
                  <ArrowRight size={16} className="text-[#757575] group-hover:translate-x-0.5 transition-transform ms-auto" />
                )}
              </>
            )}
          </button>

          {/* Quick Access or Continue as Authenticated */}
          {isUserAuthenticated && (
            <button
              onClick={() => {
                if (onSuccess) onSuccess();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#C5A46D]/15 border border-[#C5A46D]/40 text-[#DFCA98] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#C5A46D]/25 transition-all"
            >
              <CheckCircle2 size={14} className="text-[#C5A46D]" />
              <span>
                {language === 'ar'
                  ? `متابعة الحساب (${currentUser.displayName || 'الحساب الحالي'})`
                  : `Continue as ${currentUser.displayName || 'Current User'}`}
              </span>
            </button>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-2.5 w-full mt-6">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-start flex flex-col justify-between hover:border-[#C5A46D]/30 transition-all">
            <div className="w-7 h-7 rounded-lg bg-[#C5A46D]/15 flex items-center justify-center text-[#DFCA98] mb-2">
              <Radio size={14} />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-white mb-0.5">
                {language === 'ar' ? 'مكالمات صوتية WebRTC' : 'Live Voice Rooms'}
              </h4>
              <p className="text-[9px] text-[#8E8E93] leading-snug">
                {language === 'ar' ? 'محادثات صوتية حية نقية وفورية' : 'Crystal-clear audio channels'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-start flex flex-col justify-between hover:border-[#C5A46D]/30 transition-all">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 mb-2">
              <Sparkles size={14} />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-white mb-0.5">
                {language === 'ar' ? 'شارات وتوثيق ملكي' : 'Verified Badges'}
              </h4>
              <p className="text-[9px] text-[#8E8E93] leading-snug">
                {language === 'ar' ? 'نظام ألقاب وتدرج حصري' : 'Exclusive progression & titles'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-start flex flex-col justify-between hover:border-[#C5A46D]/30 transition-all">
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400 mb-2">
              <Flame size={14} />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-white mb-0.5">
                {language === 'ar' ? 'تغذية اجتماعية حية' : 'Live Social Feed'}
              </h4>
              <p className="text-[9px] text-[#8E8E93] leading-snug">
                {language === 'ar' ? 'منشورات وقصص وتفاعل فوري' : 'Stories, polls & creator posts'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-start flex flex-col justify-between hover:border-[#C5A46D]/30 transition-all">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 mb-2">
              <ShieldCheck size={14} />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-white mb-0.5">
                {language === 'ar' ? 'أمان وسحابة مشفرة' : 'Cloud Security'}
              </h4>
              <p className="text-[9px] text-[#8E8E93] leading-snug">
                {language === 'ar' ? 'خصوصية وحماية متقدمة' : 'Zero-trust protected data'}
              </p>
            </div>
          </div>
        </div>

        {/* Collapsible Alternative Login (Email / Demo Accounts) */}
        <div className="w-full mt-5">
          <button
            onClick={() => setShowAlternativeLogin(!showAlternativeLogin)}
            className="text-[11px] text-[#8E8E93] hover:text-[#C5A46D] transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            <Mail size={12} />
            <span>
              {language === 'ar'
                ? showAlternativeLogin
                  ? 'إخفاء خيارات تسجيل الدخول الأخرى'
                  : 'أو تسجيل الدخول عبر البريد الإلكتروني / الحسابات التجريبية'
                : showAlternativeLogin
                ? 'Hide alternative options'
                : 'Or sign in with Email / Demo Accounts'}
            </span>
            <ChevronDown
              size={12}
              className={`transform transition-transform ${showAlternativeLogin ? 'rotate-180' : ''}`}
            />
          </button>

          {showAlternativeLogin && (
            <div className="mt-4 p-4 rounded-3xl bg-[#121212]/95 border border-[#C5A46D]/20 text-start animate-in fade-in">
              <LoginForm
                onSuccess={() => {
                  setAuthMode('authenticated');
                  if (onSuccess) onSuccess();
                }}
                onSwitchToRegister={() => {
                  setAuthMode('register');
                }}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="relative z-10 py-4 px-6 text-center border-t border-white/[0.05]">
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8E8E93]">
          <ShieldCheck size={12} className="text-[#C5A46D]" />
          <span>
            {language === 'ar'
              ? 'مصادقة آمنة عبر بروتوكول Google OAuth وسحابة Firebase'
              : 'Secure authentication via Google OAuth & Firebase Cloud'}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
