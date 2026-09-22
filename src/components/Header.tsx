import React from 'react';
import { ShieldAlert, ShieldCheck, Lock, Sparkles } from 'lucide-react';

interface HeaderProps {
  hasGeminiKey: boolean;
  totalScans: number;
}

export const Header: React.FC<HeaderProps> = ({ hasGeminiKey, totalScans }) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm ring-1 ring-slate-800/10">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Spam Message Detector
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                AI Assistant
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Intelligent SMS, email & chat classification for phishing, scams and suspicious links
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Privacy Guarded</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{hasGeminiKey ? 'Gemini 3.8 Flash' : 'Hybrid AI + Heuristic'}</span>
          </div>

          {totalScans > 0 && (
            <div className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              {totalScans} {totalScans === 1 ? 'analysis' : 'analyses'} saved
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
