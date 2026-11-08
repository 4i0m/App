/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useApp } from '../../context/AppContext';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'banner' | 'pill' | 'menuItem';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'pill'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { isRTL } = useApp();

  // If running inside standalone PWA window or native app, don't show prompt
  if (isInstalled) {
    return null;
  }

  // If not installable and not iOS, don't show
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleClick = () => {
    if (isInstallable) {
      install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      {variant === 'menuItem' ? (
        <button
          onClick={handleClick}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-[#C5A46D]/15 to-[#DFCA98]/5 border border-[#C5A46D]/30 text-white hover:border-[#C5A46D]/60 transition-all ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C5A46D]/20 flex items-center justify-center text-[#C5A46D]">
              <Download size={18} />
            </div>
            <div className="text-start">
              <div className="text-xs font-semibold text-white">
                {isRTL ? 'تثبيت تطبيق Q (PWA)' : 'Install Q App (PWA)'}
              </div>
              <div className="text-[10px] text-[#A8A8A8]">
                {isRTL ? 'تشغيل كتطبيق شاشة رئيسية مستقل' : 'Run as standalone app'}
              </div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5A46D] text-black font-bold">
            {isRTL ? 'تثبيت' : 'Install'}
          </span>
        </button>
      ) : variant === 'banner' ? (
        <div className={`p-3 rounded-xl bg-[#141414] border border-[#C5A46D]/30 flex items-center justify-between gap-3 shadow-lg ${className}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black border border-[#C5A46D]/40 flex items-center justify-center text-[#C5A46D] shrink-0">
              <Download size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                {isRTL ? 'ثبّت Q على جهازك' : 'Install Q on your device'}
              </p>
              <p className="text-[10px] text-[#8E8E93]">
                {isRTL ? 'وصول أسرع وتجربة تطبيق متكاملة بدون متصفح' : 'Fast standalone experience without browser bar'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClick}
            className="px-3 py-1.5 rounded-lg bg-[#C5A46D] hover:bg-[#DFCA98] text-black text-xs font-bold shrink-0 transition-colors shadow"
          >
            {isRTL ? 'تثبيت' : 'Install'}
          </button>
        </div>
      ) : (
        <button
          onClick={handleClick}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C5A46D]/15 border border-[#C5A46D]/40 text-[#DFCA98] hover:bg-[#C5A46D]/25 text-xs font-medium transition-all ${className}`}
        >
          <Download size={13} />
          <span>{isRTL ? 'تثبيت التطبيق' : 'Install App'}</span>
        </button>
      )}

      {/* iOS Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#141414] border border-[#C5A46D]/40 p-6 shadow-2xl relative text-[#EDEDED]">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 end-4 text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="w-12 h-12 rounded-xl bg-[#C5A46D]/15 border border-[#C5A46D]/30 flex items-center justify-center text-[#C5A46D] mb-4">
              <Download size={24} />
            </div>

            <h3 className="text-base font-bold text-white mb-2">
              {isRTL ? 'تثبيت Q على iPhone أو iPad' : 'Install Q on iOS'}
            </h3>

            <div className="space-y-3 text-xs text-[#A8A8A8] mb-6">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Share2 size={13} />
                </div>
                <div>
                  <strong className="text-white">
                    {isRTL ? '1. اضغط على زر المشاركة' : '1. Tap Share'}
                  </strong>
                  <p>{isRTL ? 'في شريط أدوات سفاري بالأسفل' : 'in Safari navigation toolbar'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <PlusSquare size={13} />
                </div>
                <div>
                  <strong className="text-white">
                    {isRTL ? '2. اختر إضافة إلى الشاشة الرئيسية' : '2. Tap Add to Home Screen'}
                  </strong>
                  <p>{isRTL ? 'مرر للأسفل واضغط على Add to Home Screen' : 'scroll down and choose Add to Home Screen'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#C5A46D] text-black font-bold text-xs hover:bg-[#DFCA98] transition-colors"
            >
              {isRTL ? 'فهمت ذلك' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
