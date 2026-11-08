/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const { isRTL } = useApp();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 inset-x-4 max-w-sm mx-auto z-50 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#1A1A1A] border border-amber-500/40 text-amber-200 shadow-2xl backdrop-blur-md animate-fade-in"
    >
      <div className="flex items-center gap-2.5">
        <WifiOff size={16} className="text-amber-400 shrink-0" />
        <span className="text-xs font-medium">
          {isRTL ? 'أنت غير متصل بالإنترنت حالياً' : 'You are currently offline'}
        </span>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="text-[11px] px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold flex items-center gap-1 transition-colors"
      >
        <RefreshCw size={11} />
        {isRTL ? 'إعادة المحاولة' : 'Retry'}
      </button>
    </div>
  );
};
