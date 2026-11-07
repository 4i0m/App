/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Download, Share2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LightboxModal: React.FC = () => {
  const { lightboxImage, setLightboxImage } = useApp();

  if (!lightboxImage) return null;

  return (
    <div
      onClick={() => setLightboxImage(null)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
        {/* Controls */}
        <div className="absolute top-4 end-4 flex items-center gap-3 z-10">
          <a
            href={lightboxImage}
            target="_blank"
            rel="noreferrer"
            download="aether_photo.jpg"
            className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
          >
            <Download size={18} />
          </a>
          <button
            onClick={() => setLightboxImage(null)}
            className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
          >
            <X size={20} />
          </button>
        </div>

        <img
          src={lightboxImage}
          alt="Full preview"
          className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};
