import React from 'react';
import { ShieldCheck, Megaphone, EyeOff, AlertCircle } from 'lucide-react';

export const SafetyGuidelines: React.FC = () => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-600">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
        <AlertCircle className="w-4 h-4 text-indigo-600" />
        <span>Core Detection Principles & Privacy Safeguards</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
            <Megaphone className="w-4 h-4 text-amber-600" />
            <span>Ads ≠ Spam</span>
          </div>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Legitimate commercial advertisements with clear sender identities and standard opt-out/unsubscribe mechanisms are classified as <strong className="text-slate-700">NOT_SPAM</strong> unless deceptive triggers are present.
          </p>
        </div>

        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero-Trust Assurance</span>
          </div>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            In cybersecurity, no message is ever declared "100% safe." Even with low risk scores, always independently verify unexpected communications via verified channels.
          </p>
        </div>

        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
            <EyeOff className="w-4 h-4 text-indigo-600" />
            <span>Privacy Preserved</span>
          </div>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Your messages are inspected strictly for deceptive threat signatures. No passwords, credentials, or personal profiles are stored or harvested.
          </p>
        </div>
      </div>
    </div>
  );
};
