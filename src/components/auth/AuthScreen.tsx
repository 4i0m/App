/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QLogo } from '../common/QLogo';
import { UserAvatar } from '../common/UserAvatar';

export interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister
}) => {
  const { loginWithEmail, loginWithGoogle, resetPasswordEmail, t } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [resetSent, setResetSent] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string; general?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = 'يرجى إدخال البريد الإلكتروني.';
    } else if (!trimmedEmail.includes('@')) {
      newErrors.email = 'يرجى إدخال بريد إلكتروني صالح (مثال: name@domain.com).';
    }

    if (!password) {
      newErrors.password = 'يرجى إدخال كلمة المرور.';
    } else if (password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تتكون من ٦ خانات على الأقل.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') {
      setEmail(value);
      if (errors.email || errors.general) setErrors(prev => ({ ...prev, email: undefined, general: undefined }));
    } else {
      setPassword(value);
      if (errors.password || errors.general) setErrors(prev => ({ ...prev, password: undefined, general: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    const res = await loginWithEmail(email, password);
    setIsLoading(false);

    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setErrors({ general: res.error || 'فشل تسجيل الدخول. يرجى مراجعة البيانات.' });
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const res = await loginWithGoogle();
    setIsGoogleLoading(false);
    if (res.success && onSuccess) {
      onSuccess();
    } else if (!res.success) {
      setErrors({ general: res.error || 'تعذر تسجيل الدخول بحساب Google.' });
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim() || !email.includes('@')) {
      setErrors({ email: 'أدخل بريدك الإلكتروني أولاً لإرسال رابط الاستعادة.' });
      return;
    }
    setIsLoading(true);
    const res = await resetPasswordEmail(email);
    setIsLoading(false);
    if (res.success) {
      setResetSent(true);
    } else {
      setErrors({ general: res.error || 'تعذر إرسال رابط إعادة التعيين.' });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3.5 p-5 rounded-3xl bg-[#121212]/95 border border-[#C5A46D]/30 shadow-2xl backdrop-blur-md animate-in fade-in"
      noValidate
    >
      <div className="text-center space-y-1 mb-2">
        <h3 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
          <KeyRound size={16} className="text-[#C5A46D]" />
          <span>{t.login}</span>
        </h3>
        <p className="text-[11px] text-[#8E8E93]">
          أدخل بيانات حسابك للمتابعة إلى شبكة Q السحابية
        </p>
      </div>

      {errors.general && (
        <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center gap-2 text-[11px] text-red-300">
          <AlertCircle size={15} className="shrink-0 text-red-400" />
          <span>{errors.general}</span>
        </div>
      )}

      {resetSent && (
        <div className="p-2.5 rounded-xl bg-[#C5A46D]/15 border border-[#C5A46D]/40 flex items-center gap-2 text-[11px] text-[#DFCA98]">
          <CheckCircle2 size={15} className="shrink-0 text-[#C5A46D]" />
          <span>تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح.</span>
        </div>
      )}

      {/* Email field */}
      <div className="space-y-1">
        <label className="block text-[11px] font-semibold text-[#A8A8A8]">
          البريد الإلكتروني
        </label>
        <div className="relative flex items-center">
          <div className="absolute start-3 text-[#8E8E93]">
            <Mail size={15} />
          </div>
          <input
            type="email"
            value={email}
            onChange={e => handleInputChange('email', e.target.value)}
            placeholder="name@example.com"
            disabled={isLoading || isGoogleLoading}
            autoComplete="email"
            className={`w-full bg-[#181818] border rounded-xl ps-9 pe-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none transition-colors ${
              errors.email
                ? 'border-red-500/80 focus:border-red-500'
                : 'border-white/10 focus:border-[#C5A46D]'
            }`}
          />
        </div>
        {errors.email && (
          <p className="text-[10px] text-red-400 font-medium px-1 flex items-center gap-1">
            <AlertCircle size={11} />
            <span>{errors.email}</span>
          </p>
        )}
      </div>

      {/* Password field */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-semibold text-[#A8A8A8]">
            {t.password}
          </label>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-[10px] text-[#C5A46D] hover:underline"
          >
            {t.forgotPassword}
          </button>
        </div>
        <div className="relative flex items-center">
          <Lock size={15} className="absolute start-3 text-[#8E8E93]" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => handleInputChange('password', e.target.value)}
            placeholder="••••••••"
            disabled={isLoading || isGoogleLoading}
            autoComplete="current-password"
            className={`w-full bg-[#181818] border rounded-xl ps-9 pe-9 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none transition-colors ${
              errors.password
                ? 'border-red-500/80 focus:border-red-500'
                : 'border-white/10 focus:border-[#C5A46D]'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute end-3 text-[#8E8E93] hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-[10px] text-red-400 font-medium px-1 flex items-center gap-1">
            <AlertCircle size={11} />
            <span>{errors.password}</span>
          </p>
        )}
      </div>

      {/* Remember me option */}
      <div className="flex items-center justify-between text-xs py-0.5">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
            className="w-3.5 h-3.5 rounded accent-[#C5A46D] bg-[#181818] border-white/20"
          />
          <span className="text-[11px] text-[#A8A8A8]">تذكر تسجيل دخولي</span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || isGoogleLoading}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#DFCA98] to-[#C5A46D] text-black font-bold text-xs hover:brightness-105 active:scale-95 disabled:opacity-60 shadow-md transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={15} className="animate-spin text-black" />
            <span>جاري التحقق عبر السحابة...</span>
          </>
        ) : (
          <span>{t.login}</span>
        )}
      </button>

      {/* Google Login Option */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading || isGoogleLoading}
        className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium text-xs active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        {isGoogleLoading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
        )}
        <span>تسجيل الدخول عبر Google</span>
      </button>

      {/* Switch to Register link */}
      <div className="text-center pt-1 border-t border-white/[0.06]">
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-[11px] text-[#A8A8A8] hover:text-[#C5A46D] transition-colors"
        >
          ليس لديك حساب؟ <span className="text-[#C5A46D] font-bold">إنشاء حساب جديد</span>
        </button>
      </div>
    </form>
  );
};

export const AuthScreen: React.FC = () => {
  const {
    switchUser,
    setAuthMode,
    registerWithEmail,
    loginWithGoogle,
    t
  } = useApp();

  const [mode, setMode] = useState<'splash' | 'login' | 'register'>('splash');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerDisplayName, setRegisterDisplayName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const handleDemoSwitch = (userId: string) => {
    switchUser(userId);
    setAuthMode('authenticated');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    const cleanUsername = registerUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanUsername.length < 3) {
      setRegisterError('اسم المستخدم يجب أن يتكون من ٣ أحرف أو أرقام على الأقل.');
      return;
    }
    if (!registerEmail.trim() || !registerEmail.includes('@')) {
      setRegisterError('يرجى إدخال بريد إلكتروني صالح.');
      return;
    }
    if (registerPassword.length < 6) {
      setRegisterError('كلمة المرور يجب ألا تقل عن ٦ خانات.');
      return;
    }

    setIsRegistering(true);
    const res = await registerWithEmail(
      registerEmail,
      registerPassword,
      cleanUsername,
      registerDisplayName || cleanUsername
    );
    setIsRegistering(false);

    if (res.success) {
      setAuthMode('authenticated');
    } else {
      setRegisterError(res.error || 'فشل إنشاء الحساب، يرجى المحاولة ثانية.');
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-black flex flex-col justify-between overflow-y-auto no-scrollbar select-none text-white">
      {/* Background artwork */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10" />
        <img
          src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80"
          alt="Cosmic mountains"
          className="w-full h-full object-cover scale-105 opacity-60 filter contrast-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-[50%] left-1/2 -translate-x-1/2 w-[160%] h-44 bg-gradient-to-r from-transparent via-[#C5A46D]/35 to-transparent blur-3xl transform -rotate-6 pointer-events-none" />
      </div>

      {/* Top Bar Branding */}
      <div className="relative z-10 pt-10 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <QLogo size={28} withGlow={true} />
          <span className="font-bold text-sm tracking-widest text-[#EDEDED]">Q SOCIAL</span>
        </div>

        {mode !== 'splash' && (
          <button
            onClick={() => {
              setMode('splash');
              setAuthMode('splash');
            }}
            className="text-xs text-[#A8A8A8] hover:text-white transition-colors"
          >
            رجوع
          </button>
        )}
      </div>

      {/* Center Hero: Sculptural Q Mark */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 my-auto py-8">
        <div className="relative mb-6 transform hover:scale-105 transition-transform duration-500">
          <QLogo size={140} withGlow={true} />
        </div>

        <h1 className="text-sm font-bold tracking-[0.3em] uppercase text-[#E5D2A8] force-ltr mb-2 drop-shadow-md">
          {t.aWorldWithoutLimits}
        </h1>

        <p className="text-xs text-[#A8A8A8] font-medium tracking-wide">
          {t.tagline}
        </p>
      </div>

      {/* Bottom Area: Splash CTA or Login / Register Form */}
      <div className="relative z-10 p-6 pb-12 w-full max-w-sm mx-auto space-y-4">
        {mode === 'splash' && (
          <div className="space-y-3 animate-in fade-in duration-300">
            {/* Real Firebase Google Sign-In */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={async () => {
                  const res = await loginWithGoogle();
                  if (res.success) {
                    setAuthMode('authenticated');
                  }
                }}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white text-gray-900 font-semibold text-xs hover:bg-gray-100 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>المتابعة باستخدام Google (سريع وآمن)</span>
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider">أو بالبريد</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Standard Login / Register Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('login')}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#DFCA98] to-[#C5A46D] text-black font-bold text-xs hover:brightness-105 active:scale-95 transition-all shadow-[0_0_16px_rgba(197,164,109,0.35)] cursor-pointer"
                >
                  {t.login}
                </button>

                <button
                  onClick={() => setMode('register')}
                  className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-semibold text-xs border border-white/15 hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
                >
                  حساب جديد
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dedicated Functional Login Form Component */}
        {mode === 'login' && (
          <LoginForm
            onSuccess={() => setAuthMode('authenticated')}
            onSwitchToRegister={() => setMode('register')}
          />
        )}

        {/* Register form */}
        {mode === 'register' && (
          <form
            onSubmit={handleRegisterSubmit}
            className="space-y-3 p-5 rounded-3xl bg-[#121212]/95 border border-[#C5A46D]/30 shadow-2xl backdrop-blur-md animate-in fade-in"
          >
            <div className="text-center space-y-1 mb-2">
              <h3 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                <ShieldCheck size={16} className="text-[#C5A46D]" />
                <span>{t.register}</span>
              </h3>
              <p className="text-[11px] text-[#8E8E93]">
                أنشئ حسابك الحقيقي على سحابة شبكة Q
              </p>
            </div>

            {registerError && (
              <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center gap-2 text-[11px] text-red-300">
                <AlertCircle size={15} className="shrink-0 text-red-400" />
                <span>{registerError}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-[#A8A8A8] mb-1">
                اسم المستخدم الفريد (Username)
              </label>
              <div className="relative flex items-center">
                <User size={15} className="absolute start-3 text-[#8E8E93]" />
                <input
                  type="text"
                  value={registerUsername}
                  onChange={e => setRegisterUsername(e.target.value)}
                  placeholder="username (بدون مسافات)"
                  required
                  disabled={isRegistering}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl ps-9 pe-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A46D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#A8A8A8] mb-1">
                الاسم الظاهر (Display Name)
              </label>
              <div className="relative flex items-center">
                <User size={15} className="absolute start-3 text-[#8E8E93]" />
                <input
                  type="text"
                  value={registerDisplayName}
                  onChange={e => setRegisterDisplayName(e.target.value)}
                  placeholder="الاسم المستعار أو الكامل"
                  disabled={isRegistering}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl ps-9 pe-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A46D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#A8A8A8] mb-1">
                البريد الإلكتروني
              </label>
              <div className="relative flex items-center">
                <Mail size={15} className="absolute start-3 text-[#8E8E93]" />
                <input
                  type="email"
                  value={registerEmail}
                  onChange={e => setRegisterEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={isRegistering}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl ps-9 pe-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A46D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#A8A8A8] mb-1">
                كلمة المرور
              </label>
              <div className="relative flex items-center">
                <Lock size={15} className="absolute start-3 text-[#8E8E93]" />
                <input
                  type="password"
                  value={registerPassword}
                  onChange={e => setRegisterPassword(e.target.value)}
                  placeholder="٦ خانات على الأقل"
                  required
                  disabled={isRegistering}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl ps-9 pe-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A46D]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#DFCA98] to-[#C5A46D] text-black font-bold text-xs hover:brightness-105 active:scale-95 shadow-md transition-all mt-2 flex items-center justify-center gap-2"
            >
              {isRegistering ? (
                <>
                  <Loader2 size={15} className="animate-spin text-black" />
                  <span>جاري إنشاء الحساب السحابي...</span>
                </>
              ) : (
                <span>إنشاء الحساب والمتابعة</span>
              )}
            </button>

            <div className="text-center pt-1 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[11px] text-[#A8A8A8] hover:text-[#C5A46D]"
              >
                لديك حساب بالفعل؟ <span className="text-[#C5A46D] font-bold">تسجيل الدخول</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
