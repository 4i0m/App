/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReportCategory } from '../../types';

export const ReportModal: React.FC = () => {
  const { reportingTarget, closeReportModal, submitReport, t } = useApp();
  const [category, setCategory] = useState<ReportCategory>('harassment');
  const [explanation, setExplanation] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!reportingTarget) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport(category, explanation);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      closeReportModal();
    }, 1500);
  };

  const categories: { id: ReportCategory; label: string }[] = [
    { id: 'harassment', label: t.harassment },
    { id: 'hate_speech', label: t.hate_speech },
    { id: 'spam', label: t.spam },
    { id: 'impersonation', label: t.impersonation },
    { id: 'inappropriate_content', label: t.inappropriate_content },
    { id: 'threats', label: t.threats },
    { id: 'other', label: t.other }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-[#121212] border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldAlert size={20} />
            <h3 className="font-bold text-white text-base">{t.reportTitle}</h3>
          </div>
          <button
            onClick={closeReportModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 size={48} className="mx-auto text-emerald-400" />
            <h4 className="text-lg font-bold text-white">{t.reportSubmitted}</h4>
            <p className="text-xs text-[#A8A8A8]">شكراً لمساهمتك في الحفاظ على مجتمع أثير آمناً ومحترماً.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Target snippet */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
              <span className="text-[#8E8E93] block mb-1">المحتوى المستهدف:</span>
              <p className="font-medium text-white truncate">{reportingTarget.title}</p>
              {reportingTarget.authorName && (
                <span className="text-[11px] text-[#A8A8A8]">الناشر: {reportingTarget.authorName}</span>
              )}
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-[#A8A8A8] mb-2">{t.reportReason}</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {categories.map(c => (
                  <label
                    key={c.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      category === c.id
                        ? 'border-[#C5A46D] bg-[#C5A46D]/10 text-white'
                        : 'border-white/[0.06] bg-[#161616] text-[#A8A8A8] hover:border-white/20'
                    }`}
                  >
                    <span>{c.label}</span>
                    <input
                      type="radio"
                      name="reportCategory"
                      value={c.id}
                      checked={category === c.id}
                      onChange={() => setCategory(c.id)}
                      className="accent-[#C5A46D]"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Explanation textarea */}
            <div>
              <label className="block text-xs font-semibold text-[#A8A8A8] mb-1.5">
                {t.reportExplanation}
              </label>
              <textarea
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                placeholder="أضف أي تفاصيل تساعد المشرفين في التحقق..."
                rows={3}
                className="w-full rounded-xl bg-[#191919] border border-white/10 p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A46D] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={closeReportModal}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#DFCA98] to-[#C5A46D] text-black text-xs font-bold hover:brightness-105 active:scale-95"
              >
                {t.submitReport}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
