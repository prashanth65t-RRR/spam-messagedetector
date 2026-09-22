import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MessageInput } from './components/MessageInput';
import { SamplePicker } from './components/SamplePicker';
import { AnalysisResultView } from './components/AnalysisResultView';
import { SignalsInspector } from './components/SignalsInspector';
import { ScanHistory } from './components/ScanHistory';
import { SafetyGuidelines } from './components/SafetyGuidelines';
import { AnalysisResult, MessageSourceType, SampleMessage } from './types';
import { AlertCircle, RefreshCw } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'spam_detector_history_v1';

export default function App() {
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<MessageSourceType>('sms');
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(true);
  const [history, setHistory] = useState<AnalysisResult[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Check health and backend connectivity on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.hasGeminiApiKey === 'boolean') {
          setHasGeminiKey(data.hasGeminiApiKey);
        }
      })
      .catch((err) => {
        console.warn('Could not contact /api/health:', err);
      });
  }, []);

  // Save history changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history.slice(0, 20)));
    } catch (e) {
      console.warn('Failed to save history to localStorage:', e);
    }
  }, [history]);

  const handleSelectSample = (sample: SampleMessage) => {
    setMessage(sample.content);
    setMessageType(sample.channel);
    setSelectedSampleId(sample.id);
    setError(null);
  };

  const handleClear = () => {
    setMessage('');
    setSelectedSampleId(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!message.trim()) {
      setError('Please enter or paste a message to analyze.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          messageType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned error (${response.status})`);
      }

      const data = await response.json();

      const newResult: AnalysisResult = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        classification: data.classification || 'UNCERTAIN',
        confidence: typeof data.confidence === 'number' ? data.confidence : 75,
        reasons: Array.isArray(data.reasons) ? data.reasons : ['Signal evaluation completed.'],
        riskLevel: data.riskLevel || 'MEDIUM',
        recommendation: data.recommendation || 'Verify with official channels.',
        rawFormattedText: data.rawFormattedText || '',
        signals: data.detectedSignals || [],
        analyzedAt: new Date().toISOString(),
        sourceMessage: message.trim(),
        messageType,
        modelUsed: data.modelUsed,
      };

      setCurrentResult(newResult);
      setHistory((prev) => [newResult, ...prev.filter((item) => item.sourceMessage !== newResult.sourceMessage).slice(0, 19)]);

      // Scroll smoothly to results
      setTimeout(() => {
        const resultElement = document.getElementById('analysis-result-panel');
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    } catch (err: unknown) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: AnalysisResult) => {
    setCurrentResult(item);
    setMessage(item.sourceMessage);
    setMessageType(item.messageType);
    setSelectedSampleId(null);
    const resultElement = document.getElementById('analysis-result-panel');
    if (resultElement) {
      resultElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header hasGeminiKey={hasGeminiKey} totalScans={history.length} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Error banner if present */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-900 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Input & Quick Samples Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Analyze Incoming Message
              </h2>
              <p className="text-xs text-slate-500">
                Paste suspicious SMS, email, or chat messages to evaluate for scams, phishing, and deceptive links.
              </p>
            </div>
          </div>

          <MessageInput
            message={message}
            onChangeMessage={(val) => {
              setMessage(val);
              if (selectedSampleId) setSelectedSampleId(null);
            }}
            messageType={messageType}
            onChangeMessageType={setMessageType}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            onClear={handleClear}
          />

          <SamplePicker
            onSelectSample={handleSelectSample}
            selectedSampleId={selectedSampleId}
          />
        </section>

        {/* Analysis Output Section */}
        {currentResult && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Classification & Risk Assessment
                </h2>
                <p className="text-xs text-slate-500">
                  Detailed evaluation matching the official spam assistant criteria.
                </p>
              </div>
            </div>

            <AnalysisResultView result={currentResult} />

            {/* Evaluated Signals Inspector */}
            <SignalsInspector detectedSignals={currentResult.signals} />
          </section>
        )}

        {/* Scan History (if available) */}
        {history.length > 0 && (
          <section>
            <ScanHistory
              history={history}
              onSelectResult={handleSelectHistoryItem}
              onClearHistory={handleClearHistory}
              activeId={currentResult?.id || null}
            />
          </section>
        )}

        {/* Educational safety guidelines and privacy commitment */}
        <section>
          <SafetyGuidelines />
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Spam Message Detector</span>
            <span>•</span>
            <span>Intelligent Threat & Phishing Classifier</span>
          </div>
          <p className="text-slate-400 text-center sm:text-right">
            Always exercise caution with unsolicited links, requests for money, or credential verification.
          </p>
        </div>
      </footer>
    </div>
  );
}
