import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  FileText,
  Eye,
  Info,
  ExternalLink,
} from 'lucide-react';

interface AnalysisResultViewProps {
  result: AnalysisResult;
}

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'raw'>('card');

  const handleCopyRaw = async () => {
    try {
      await navigator.clipboard.writeText(result.rawFormattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getClassificationMeta = (classification: AnalysisResult['classification']) => {
    switch (classification) {
      case 'SPAM':
        return {
          title: 'SPAM DETECTED',
          badgeText: 'SPAM',
          badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 ring-rose-500/20',
          containerClass: 'border-rose-200 bg-rose-50/20',
          icon: <ShieldAlert className="w-6 h-6 text-rose-600" />,
          accentBg: 'bg-rose-600',
          accentText: 'text-rose-700',
        };
      case 'NOT_SPAM':
        return {
          title: 'LIKELY NOT SPAM',
          badgeText: 'NOT_SPAM',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-emerald-500/20',
          containerClass: 'border-emerald-200 bg-emerald-50/20',
          icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
          accentBg: 'bg-emerald-600',
          accentText: 'text-emerald-700',
        };
      case 'UNCERTAIN':
      default:
        return {
          title: 'UNCERTAIN / CAUTION',
          badgeText: 'UNCERTAIN',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 ring-amber-500/20',
          containerClass: 'border-amber-200 bg-amber-50/20',
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          accentBg: 'bg-amber-600',
          accentText: 'text-amber-700',
        };
    }
  };

  const getRiskMeta = (risk: AnalysisResult['riskLevel']) => {
    switch (risk) {
      case 'HIGH':
        return {
          label: 'HIGH RISK',
          pillClass: 'bg-rose-600 text-white',
          desc: 'High probability of credential harvesting, fraud, or device malware.',
        };
      case 'MEDIUM':
        return {
          label: 'MEDIUM RISK',
          pillClass: 'bg-amber-500 text-white',
          desc: 'Ambiguous indicators present. Sender legitimacy unverified.',
        };
      case 'LOW':
      default:
        return {
          label: 'LOW RISK',
          pillClass: 'bg-emerald-600 text-white',
          desc: 'Standard conversational or opt-in promotional markers.',
        };
    }
  };

  const meta = getClassificationMeta(result.classification);
  const riskMeta = getRiskMeta(result.riskLevel);

  return (
    <div
      id="analysis-result-panel"
      className={`rounded-xl border shadow-xs overflow-hidden transition-all bg-white ${meta.containerClass}`}
    >
      {/* Result Header Bar */}
      <div className="px-5 py-4 border-b border-slate-200/80 bg-white/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 shadow-2xs">
            {meta.icon}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span
                id="result-classification-badge"
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide border uppercase ring-2 ${meta.badgeClass}`}
              >
                {meta.badgeText}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Risk Level: <strong className="text-slate-800">{result.riskLevel}</strong>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Analyzed {new Date(result.analyzedAt).toLocaleTimeString()} • Confidence: {result.confidence}%
            </p>
          </div>
        </div>

        {/* View mode toggle and copy button */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('card')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                viewMode === 'card'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                viewMode === 'raw'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Exact Format</span>
            </button>
          </div>

          <button
            type="button"
            id="copy-formatted-result-btn"
            onClick={handleCopyRaw}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-all active:scale-[0.98]"
            title="Copy exact required output format"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Format</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Raw Formatted View Tab */}
      {viewMode === 'raw' ? (
        <div className="p-5 bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400">
            <span>Canonical Format Output</span>
            <span className="text-[11px] text-emerald-400">Exact prompt specification</span>
          </div>
          <pre className="whitespace-pre-wrap selection:bg-indigo-500 selection:text-white">
            {result.rawFormattedText}
          </pre>
        </div>
      ) : (
        /* Visual Card View */
        <div className="p-5 sm:p-6 space-y-6">
          {/* Key Metrics: Confidence & Risk Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Confidence Metric */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Confidence
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {result.confidence}%
                </span>
              </div>
              {/* Visual Progress Bar */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    result.classification === 'SPAM'
                      ? 'bg-rose-500'
                      : result.classification === 'NOT_SPAM'
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Model confidence score based on message signal correlations.
              </p>
            </div>

            {/* Risk Level Metric */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Assessed Risk
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${riskMeta.pillClass}`}
                >
                  {riskMeta.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 my-1">
                <div
                  className={`h-2 flex-1 rounded-full ${
                    result.riskLevel === 'LOW' || result.riskLevel === 'MEDIUM' || result.riskLevel === 'HIGH'
                      ? 'bg-emerald-500'
                      : 'bg-slate-200'
                  }`}
                />
                <div
                  className={`h-2 flex-1 rounded-full ${
                    result.riskLevel === 'MEDIUM' || result.riskLevel === 'HIGH'
                      ? 'bg-amber-500'
                      : 'bg-slate-200'
                  }`}
                />
                <div
                  className={`h-2 flex-1 rounded-full ${
                    result.riskLevel === 'HIGH' ? 'bg-rose-500' : 'bg-slate-200'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {riskMeta.desc}
              </p>
            </div>
          </div>

          {/* Reasons List */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <span>Reasons Identified</span>
              <span className="text-slate-400 font-normal">({result.reasons.length})</span>
            </h3>
            <ul className="space-y-2.5">
              {result.reasons.map((reason, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs sm:text-sm text-slate-800 leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-200/80 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Safety Recommendation Box */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-1">
                  Safety Recommendation
                </h4>
                <p className="text-sm text-indigo-950 font-medium leading-relaxed">
                  {result.recommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Analyzed Message Preview */}
          <div className="pt-2 border-t border-slate-100">
            <details className="group text-xs">
              <summary className="cursor-pointer text-slate-500 font-medium hover:text-slate-700 flex items-center justify-between select-none">
                <span>View original analyzed text snippet</span>
                <span className="text-indigo-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-2.5 p-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
                {result.sourceMessage}
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};
