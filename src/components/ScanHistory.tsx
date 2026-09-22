import React from 'react';
import { AnalysisResult } from '../types';
import { History, Trash2, ArrowUpRight, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ScanHistoryProps {
  history: AnalysisResult[];
  onSelectResult: (result: AnalysisResult) => void;
  onClearHistory: () => void;
  activeId: string | null;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({
  history,
  onSelectResult,
  onClearHistory,
  activeId,
}) => {
  if (history.length === 0) {
    return null;
  }

  const getBadge = (classification: AnalysisResult['classification']) => {
    switch (classification) {
      case 'SPAM':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
            <ShieldAlert className="w-2.5 h-2.5" />
            SPAM
          </span>
        );
      case 'NOT_SPAM':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <ShieldCheck className="w-2.5 h-2.5" />
            NOT SPAM
          </span>
        );
      case 'UNCERTAIN':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-2.5 h-2.5" />
            UNCERTAIN
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Recent Analyses ({history.length})
          </h3>
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {history.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectResult(item)}
              className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between gap-3 text-xs ${
                isActive
                  ? 'bg-indigo-50/60 border-indigo-300 ring-1 ring-indigo-400/30'
                  : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getBadge(item.classification)}
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.analyzedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {item.confidence}% Conf.
                  </span>
                </div>
                <p className="text-slate-600 truncate font-mono text-[11px]">
                  {item.sourceMessage}
                </p>
              </div>

              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
