import React from 'react';
import { OFFICIAL_SIGNALS } from '../data/samples';
import { SignalDetection } from '../types';
import {
  Link,
  Gift,
  KeyRound,
  ClockAlert,
  Type,
  Megaphone,
  UserX,
  FileDown,
  PhoneCall,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';

interface SignalsInspectorProps {
  detectedSignals?: SignalDetection[];
}

export const SignalsInspector: React.FC<SignalsInspectorProps> = ({ detectedSignals = [] }) => {
  const getSignalIcon = (id: string) => {
    switch (id) {
      case 'suspicious_links':
        return <Link className="w-4 h-4" />;
      case 'fake_prizes':
        return <Gift className="w-4 h-4" />;
      case 'credential_requests':
        return <KeyRound className="w-4 h-4" />;
      case 'urgency_threats':
        return <ClockAlert className="w-4 h-4" />;
      case 'unusual_grammar':
        return <Type className="w-4 h-4" />;
      case 'aggressive_marketing':
        return <Megaphone className="w-4 h-4" />;
      case 'impersonation':
        return <UserX className="w-4 h-4" />;
      case 'unexpected_attachments':
        return <FileDown className="w-4 h-4" />;
      case 'unknown_contacts':
        return <PhoneCall className="w-4 h-4" />;
      default:
        return <AlertOctagon className="w-4 h-4" />;
    }
  };

  const detectedMap = new Map(detectedSignals.map((s) => [s.id, s.detected]));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Core Evaluation Signals</span>
            <span className="text-xs font-normal text-slate-500">
              (Prompt Standard Rubric)
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            The assistant inspects each incoming communication across these 9 deceptive risk dimensions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {OFFICIAL_SIGNALS.map((signal) => {
          const isFlagged = Boolean(detectedMap.get(signal.id));
          const hasEvaluation = detectedSignals.length > 0;

          return (
            <div
              key={signal.id}
              className={`p-3 rounded-lg border transition-colors flex items-start gap-3 ${
                isFlagged
                  ? 'bg-rose-50/70 border-rose-200 ring-1 ring-rose-300/40'
                  : hasEvaluation
                  ? 'bg-slate-50/60 border-slate-200/80 opacity-90'
                  : 'bg-slate-50/40 border-slate-200/70'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  isFlagged
                    ? 'bg-rose-600 text-white'
                    : hasEvaluation
                    ? 'bg-slate-200 text-slate-600'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {getSignalIcon(signal.id)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className="text-xs font-semibold text-slate-900 truncate">
                    {signal.label}
                  </h4>
                  {hasEvaluation && (
                    <span
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        isFlagged
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isFlagged ? (
                        <>
                          <AlertOctagon className="w-2.5 h-2.5" />
                          <span>Flagged</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Clear</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {signal.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
