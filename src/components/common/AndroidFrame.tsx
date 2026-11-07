/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { IncomingCallModal } from '../calls/IncomingCallModal';

export const AndroidFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-black text-[#EDEDED] flex justify-center selection:bg-[#C5A46D]/30 selection:text-[#C5A46D]">
      {/* Seamless native viewport container: responsive edge-to-edge on mobile, sleek centered max-w-md on desktop */}
      <main className="w-full max-w-md min-h-screen bg-black flex flex-col relative overflow-x-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border-x border-white/[0.04]">
        {children}
        {/* Real-time WebRTC Incoming Call Overlay */}
        <IncomingCallModal />
      </main>
    </div>
  );
};
