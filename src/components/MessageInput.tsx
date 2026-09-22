import React, { useState } from 'react';
import { MessageSourceType } from '../types';
import { Smartphone, Mail, MessageSquare, HelpCircle, Clipboard, Trash2, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface MessageInputProps {
  message: string;
  onChangeMessage: (msg: string) => void;
  messageType: MessageSourceType;
  onChangeMessageType: (type: MessageSourceType) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  onClear: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  message,
  onChangeMessage,
  messageType,
  onChangeMessageType,
  onAnalyze,
  isLoading,
  onClear,
}) => {
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          onChangeMessage(text);
          setPasteNotice('Pasted from clipboard!');
          setTimeout(() => setPasteNotice(null), 2000);
        }
      }
    } catch {
      setPasteNotice('Clipboard permission denied');
      setTimeout(() => setPasteNotice(null), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (message.trim().length > 0 && !isLoading) {
        onAnalyze();
      }
    }
  };

  const channels: { id: MessageSourceType; label: string; icon: React.ReactNode }[] = [
    { id: 'sms', label: 'SMS / Text', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: 'email', label: 'Email', icon: <Mail className="w-3.5 h-3.5" /> },
    { id: 'chat', label: 'Chat / Messaging', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'unknown', label: 'Auto / Unknown', icon: <HelpCircle className="w-3.5 h-3.5" /> },
  ];

  const charCount = message.length;
  const wordCount = message.trim().length > 0 ? message.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Top Bar with Channel Selector */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Channel:
          </span>
          {channels.map((chan) => {
            const active = messageType === chan.id;
            return (
              <button
                key={chan.id}
                type="button"
                onClick={() => onChangeMessageType(chan.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  active
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {chan.icon}
                <span>{chan.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handlePaste}
            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded hover:bg-slate-200/60 transition-colors"
            title="Paste text from clipboard"
          >
            <Clipboard className="w-3.5 h-3.5 text-slate-500" />
            <span>Paste</span>
          </button>
          {message.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50 transition-colors"
              title="Clear input"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Paste feedback notification */}
      {pasteNotice && (
        <div className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium border-b border-indigo-100 flex items-center justify-between">
          <span>{pasteNotice}</span>
        </div>
      )}

      {/* Textarea Area */}
      <div className="p-4">
        <label htmlFor="message-input" className="sr-only">
          Message to analyze
        </label>
        <textarea
          id="message-input"
          value={message}
          onChange={(e) => onChangeMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste or type the SMS, email, or chat message you received... (e.g. 'Your USPS package is on hold, verify at bit.ly/...')"
          rows={6}
          className="w-full resize-y text-sm text-slate-900 placeholder:text-slate-400 bg-transparent border-0 focus:ring-0 focus:outline-hidden p-0 leading-relaxed font-sans"
        />
      </div>

      {/* Footer with Character Counter and Submit */}
      <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>
            {charCount} characters • {wordCount} words
          </span>
          <span className="hidden sm:inline-block text-slate-300">•</span>
          <span className="hidden sm:inline-block text-slate-400">
            Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-600">Cmd/Ctrl + Enter</kbd> to analyze
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="analyze-message-btn"
            disabled={isLoading || message.trim().length === 0}
            onClick={onAnalyze}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-xs transition-all ${
              isLoading || message.trim().length === 0
                ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] cursor-pointer ring-1 ring-indigo-600/50'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Evaluating Signals...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Analyze Message</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
