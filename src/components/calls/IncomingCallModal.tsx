/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const IncomingCallModal: React.FC = () => {
  const { 
    currentCall, 
    acceptVoiceCall, 
    declineVoiceCall, 
    endVoiceCall, 
    toggleCallMute,
    isCallMuted,
    currentUserId
  } = useApp();

  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (currentCall && currentCall.status === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [currentCall?.status]);

  if (!currentCall) return null;

  const isIncoming = currentCall.receiverId === currentUserId && (currentCall.status === 'calling' || currentCall.status === 'ringing');
  const isCaller = currentCall.callerId === currentUserId;
  const otherPartyName = isCaller ? currentCall.receiverName : currentCall.callerName;
  const otherPartyAvatar = isCaller ? currentCall.receiverAvatar : currentCall.callerAvatar;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-[#121212] border border-[#C5A46D]/30 shadow-2xl p-6 flex flex-col items-center text-center space-y-6">
        
        {/* Caller Avatar with Pulse Animation */}
        <div className="relative mt-2">
          {currentCall.status === 'calling' || isIncoming ? (
            <div className="absolute -inset-3 rounded-full bg-[#C5A46D]/20 animate-ping opacity-75" />
          ) : null}
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#C5A46D] shadow-xl relative z-10">
            <img 
              src={otherPartyAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"} 
              alt={otherPartyName}
              className="w-full h-full object-cover" 
            />
          </div>
        </div>

        {/* Call Info */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">{otherPartyName}</h3>
          <p className="text-xs font-medium text-[#C5A46D]">
            {isIncoming && currentCall.status !== 'connected' && "مكالمة صوتية واردة..."}
            {isCaller && currentCall.status === 'calling' && "جاري الاتصال..."}
            {currentCall.status === 'connected' && (
              <span className="font-mono text-emerald-400">متصل · {formatDuration(callDuration)}</span>
            )}
            {currentCall.status === 'rejected' && <span className="text-red-400">تم رفض المكالمة</span>}
            {currentCall.status === 'ended' && <span className="text-gray-400">انتهت المكالمة</span>}
          </p>
        </div>

        {/* Incoming Call Accept/Reject Buttons */}
        {isIncoming && currentCall.status !== 'connected' ? (
          <div className="flex items-center justify-center gap-8 w-full pt-4">
            <button
              onClick={declineVoiceCall}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
              title="رفض"
            >
              <PhoneOff size={22} />
            </button>
            <button
              onClick={acceptVoiceCall}
              className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all animate-bounce"
              title="قبول المكالمة"
            >
              <Phone size={22} />
            </button>
          </div>
        ) : (
          /* Active / Outgoing Call Controls */
          <div className="flex items-center justify-center gap-6 w-full pt-4">
            <button
              onClick={toggleCallMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
                isCallMuted 
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/15'
              }`}
              title={isCallMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}
            >
              {isCallMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button
              onClick={endVoiceCall}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
              title="إنهاء المكالمة"
            >
              <PhoneOff size={22} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
