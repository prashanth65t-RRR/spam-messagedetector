import React from 'react';
import { SAMPLE_MESSAGES } from '../data/samples';
import { SampleMessage, MessageSourceType } from '../types';
import { MessageSquare, Mail, Smartphone, ExternalLink } from 'lucide-react';

interface SamplePickerProps {
  onSelectSample: (sample: SampleMessage) => void;
  selectedSampleId: string | null;
}

export const SamplePicker: React.FC<SamplePickerProps> = ({
  onSelectSample,
  selectedSampleId,
}) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Quick Test Examples
          </span>
          <span className="text-xs text-slate-400">
            (SMS, Email, Chat)
          </span>
        </div>
        <span className="text-xs text-slate-500">Click any example to load</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {SAMPLE_MESSAGES.map((sample) => {
          const isSelected = selectedSampleId === sample.id;
          return (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelectSample(sample)}
              className={`text-left p-3 rounded-lg border transition-all text-xs flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="font-semibold text-slate-900 truncate">
                    {sample.title}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider shrink-0 ${
                      sample.channel === 'sms'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : sample.channel === 'email'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {sample.channel === 'sms' && <Smartphone className="w-2.5 h-2.5" />}
                    {sample.channel === 'email' && <Mail className="w-2.5 h-2.5" />}
                    {sample.channel === 'chat' && <MessageSquare className="w-2.5 h-2.5" />}
                    {sample.channel}
                  </span>
                </div>
                <p className="text-slate-500 line-clamp-2 leading-relaxed">
                  {sample.preview}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[170px] text-slate-500 font-medium">
                  {sample.category}
                </span>
                <span className="text-indigo-600 font-medium group-hover:underline flex items-center gap-0.5">
                  Load <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
