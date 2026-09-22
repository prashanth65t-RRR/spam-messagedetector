export type MessageClassification = 'SPAM' | 'NOT_SPAM' | 'UNCERTAIN';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type MessageSourceType = 'sms' | 'email' | 'chat' | 'unknown';

export interface SignalDetection {
  id: string;
  label: string;
  detected: boolean;
  explanation?: string;
}

export interface AnalysisResult {
  id: string;
  classification: MessageClassification;
  confidence: number;
  reasons: string[];
  riskLevel: RiskLevel;
  recommendation: string;
  rawFormattedText: string;
  signals: SignalDetection[];
  analyzedAt: string;
  sourceMessage: string;
  messageType: MessageSourceType;
  modelUsed?: string;
}

export interface SampleMessage {
  id: string;
  title: string;
  channel: 'sms' | 'email' | 'chat';
  category: 'Banking / Security' | 'Package / Delivery' | 'Prizes / Lottery' | 'Legitimate / Personal' | 'Marketing / Promo' | 'Urgent Friend Request';
  preview: string;
  content: string;
  hint: string;
}
