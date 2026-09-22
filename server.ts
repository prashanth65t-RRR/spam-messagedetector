import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

interface AnalyzedOutput {
  classification: "SPAM" | "NOT_SPAM" | "UNCERTAIN";
  confidence: number;
  reasons: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  recommendation: string;
  rawFormattedText: string;
  detectedSignals: {
    id: string;
    label: string;
    detected: boolean;
    explanation?: string;
  }[];
  modelUsed: string;
}

const OFFICIAL_SIGNAL_METADATA = [
  { id: "suspicious_links", label: "Suspicious links or unknown websites" },
  { id: "fake_prizes", label: "Fake prizes, rewards, or lottery claims" },
  { id: "credential_requests", label: "Requests for passwords, verification codes, money, or banking details" },
  { id: "urgency_threats", label: "Excessive urgency or threats" },
  { id: "unusual_grammar", label: "Unusual grammar or formatting" },
  { id: "aggressive_marketing", label: "Aggressive marketing language" },
  { id: "impersonation", label: "Impersonation of banks, companies, government agencies, or friends" },
  { id: "unexpected_attachments", label: "Unexpected attachments or downloads" },
  { id: "unknown_contacts", label: "Requests to contact an unknown phone number or account" },
];

function parseGeminiResponse(rawText: string, userMessage: string): AnalyzedOutput {
  let classification: "SPAM" | "NOT_SPAM" | "UNCERTAIN" = "UNCERTAIN";
  let confidence = 75;
  const reasons: string[] = [];
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM";
  let recommendation = "Verify the authenticity of this message through official channels before taking action.";

  const classMatch = rawText.match(/Classification:\s*\[?(SPAM|NOT_SPAM|UNCERTAIN)\]?/i);
  if (classMatch) {
    const matched = classMatch[1].toUpperCase();
    if (matched === "SPAM" || matched === "NOT_SPAM" || matched === "UNCERTAIN") {
      classification = matched;
    }
  }

  const confMatch = rawText.match(/Confidence:\s*\[?(\d{1,3})\]?%/i);
  if (confMatch) {
    const val = parseInt(confMatch[1], 10);
    if (!isNaN(val)) {
      confidence = Math.min(100, Math.max(0, val));
    }
  }

  const reasonsMatch = rawText.match(/Reasons:([\s\S]*?)(?=Risk level:|$)/i);
  if (reasonsMatch) {
    const rawReasonsBlock = reasonsMatch[1];
    const lines = rawReasonsBlock.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("-") || trimmed.startsWith("•") || trimmed.startsWith("*")) {
        const clean = trimmed.replace(/^[-•*]\s*/, "").replace(/^\[|\]$/g, "").trim();
        if (clean.length > 0) {
          reasons.push(clean);
        }
      }
    }
  }

  const riskMatch = rawText.match(/Risk level:\s*\[?(LOW|MEDIUM|HIGH)\]?/i);
  if (riskMatch) {
    const r = riskMatch[1].toUpperCase();
    if (r === "LOW" || r === "MEDIUM" || r === "HIGH") {
      riskLevel = r;
    }
  } else {
    if (classification === "SPAM") riskLevel = "HIGH";
    else if (classification === "NOT_SPAM") riskLevel = "LOW";
    else riskLevel = "MEDIUM";
  }

  const recMatch = rawText.match(/Recommendation:\s*([\s\S]*?)(?=(?:Message to analyze:|$))/i);
  if (recMatch) {
    const recText = recMatch[1].trim().replace(/^\[|\]$/g, "");
    if (recText.length > 0) {
      recommendation = recText;
    }
  }

  if (reasons.length === 0) {
    if (classification === "SPAM") {
      reasons.push("Multiple indicators typical of unsolicited deceptive communication detected.");
      reasons.push("Message structure exhibits artificial urgency or suspicious routing.");
    } else if (classification === "NOT_SPAM") {
      reasons.push("Message context appears consistent with standard communication.");
      reasons.push("No solicitation of credentials, sensitive data, or high-risk downloads.");
    } else {
      reasons.push("Insufficient context to confirm sender legitimacy.");
      reasons.push("Message contains elements that could be benign or deceptive.");
    }
  }

  // Detect which of the 9 official signals are genuinely detected as threats/concerns
  const positiveReasons = reasons.filter((r) => {
    const lr = r.toLowerCase();
    return !lr.includes("no ") && !lr.includes("does not") && !lr.includes("without") && !lr.includes("lacks") && !lr.includes("absence of");
  }).join(" ").toLowerCase();

  const msgLower = userMessage.toLowerCase();

  const detectedSignals = OFFICIAL_SIGNAL_METADATA.map((sig) => {
    let detected = false;

    if (sig.id === "suspicious_links") {
      const hasLink = /https?:\/\/|bit\.ly|\.info|\.xyz|\.top|\.online|\.biz/i.test(userMessage);
      const isFlaggedInReasons = /link|url|website|domain/i.test(positiveReasons);
      detected = (hasLink && (classification === "SPAM" || isFlaggedInReasons)) || isFlaggedInReasons;
    } else if (sig.id === "fake_prizes") {
      const hasPrizeKeywords = /prize|winner|won|lottery|reward|gift card|sweepstake|\$1,000|\$500/i.test(msgLower);
      const isFlaggedInReasons = /prize|winner|lottery|reward|gift card/i.test(positiveReasons);
      detected = hasPrizeKeywords && (classification === "SPAM" || isFlaggedInReasons);
    } else if (sig.id === "credential_requests") {
      const hasCredKeywords = /password|pin|verification code|otp|banking|debit card|credit card|ssn|social security|routing|wire transfer|cashapp|zelle/i.test(msgLower);
      const isFlaggedInReasons = /password|pin|verification code|otp|banking|credential|wire|money/i.test(positiveReasons);
      detected = (hasCredKeywords && (classification === "SPAM" || classification === "UNCERTAIN")) || isFlaggedInReasons;
    } else if (sig.id === "urgency_threats") {
      const hasUrgencyKeywords = /immediately|urgent|within \d+|suspended|terminated|arrest|lawsuit|action required|final notice|account locked|restricted/i.test(msgLower);
      const isFlaggedInReasons = /urgency|threat|deadline|pressure|immediate/i.test(positiveReasons);
      detected = hasUrgencyKeywords || isFlaggedInReasons;
    } else if (sig.id === "unusual_grammar") {
      const isFlaggedInReasons = /grammar|formatting|awkward|inconsistent|typo|capitalization|syntax/i.test(positiveReasons);
      detected = isFlaggedInReasons;
    } else if (sig.id === "aggressive_marketing") {
      const isFlaggedInReasons = /aggressive|marketing|hyped|unsolicited promo|commercial pressure/i.test(positiveReasons);
      detected = isFlaggedInReasons;
    } else if (sig.id === "impersonation") {
      const hasBrand = /usps|fedex|ups|irs|chase|wells fargo|bank of america|paypal|amazon|apple|netflix|it's dan|lost my phone/i.test(msgLower);
      const isFlaggedInReasons = /impersonat|spoof|mimic|pretend/i.test(positiveReasons);
      detected = (hasBrand && (classification === "SPAM" || classification === "UNCERTAIN")) || isFlaggedInReasons;
    } else if (sig.id === "unexpected_attachments") {
      const hasAttachKeywords = /\.exe|\.apk|\.zip|download the attached|attachment/i.test(msgLower);
      const isFlaggedInReasons = /attachment|download|executable|file/i.test(positiveReasons);
      detected = (hasAttachKeywords && (classification === "SPAM" || classification === "UNCERTAIN")) || isFlaggedInReasons;
    } else if (sig.id === "unknown_contacts") {
      const hasContactKeywords = /call 1-800|call this number|contact us at \+?\d{8,}|reach out to unknown/i.test(msgLower);
      const isFlaggedInReasons = /unknown phone|contact number|unverified line/i.test(positiveReasons);
      detected = hasContactKeywords || isFlaggedInReasons;
    }

    return {
      id: sig.id,
      label: sig.label,
      detected,
    };
  });

  // Canonicalize rawFormattedText to ensure exact format compliance
  const canonicalFormatted = `Classification: ${classification}
Confidence: ${confidence}%

Reasons:
${reasons.map((r) => `- ${r}`).join("\n")}

Risk level: ${riskLevel}

Recommendation:
${recommendation}`;

  return {
    classification,
    confidence,
    reasons,
    riskLevel,
    recommendation,
    rawFormattedText: canonicalFormatted,
    detectedSignals,
    modelUsed: "gemini-3.8-flash",
  };
}

function runHeuristicRuleEngine(userMessage: string): AnalyzedOutput {
  const text = userMessage.toLowerCase();
  const reasons: string[] = [];
  let spamScore = 0;
  let uncertainScore = 0;

  const hasSuspiciousLink = /https?:\/\/[^\s]+|bit\.ly|tinyurl|\.xyz|\.top|\.info|\.biz|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i.test(userMessage);
  const hasPrizeClaim = /congratulations|you have won|lottery|winner|claim your reward|\$1,000 gift card|free prize/i.test(text);
  const hasCredentialRequest = /password|passcode|verification code|otp|banking details|ssn|social security|routing number|credit card|send \$\d+|cashapp|zelle/i.test(text);
  const hasUrgency = /immediately|within \d+ (minutes|hours)|account (suspended|locked|restricted)|action required|final warning/i.test(text);
  const hasImpersonation = /(usps|irs|internal revenue|chase|wells fargo|bank of america|paypal|amazon security|it's dan|lost my phone)/i.test(text);
  const hasAttachment = /\.exe|\.apk|\.zip|download the attached|w8ben.*\.exe/i.test(text);
  const hasUnknownContact = /call 1-800|contact us at \+?\d{8,}|reach out to unknown/i.test(text);
  const isMarketingPromo = /unsubscribe|sale|off all|code [a-z0-9]+|preference center/i.test(text) && !hasCredentialRequest && !hasAttachment;

  if (hasSuspiciousLink) {
    spamScore += 30;
    reasons.push("Contains unverified, shortened, or suspicious website link.");
  }
  if (hasPrizeClaim) {
    spamScore += 35;
    reasons.push("Claims unsolicited high-value prize or lottery reward.");
  }
  if (hasCredentialRequest) {
    spamScore += 35;
    reasons.push("Requests sensitive credentials, direct money transfers, or verification data.");
  }
  if (hasUrgency) {
    spamScore += 20;
    reasons.push("Employs artificial time pressure or account threat to force hasty action.");
  }
  if (hasImpersonation) {
    spamScore += 25;
    reasons.push("Appears to impersonate a trusted institution, bank, courier, or distress contact.");
  }
  if (hasAttachment) {
    spamScore += 40;
    reasons.push("Includes or urges execution of dangerous unexpected files or disguised attachments.");
  }
  if (hasUnknownContact) {
    spamScore += 15;
    reasons.push("Directs the recipient to contact an unverified phone number or account.");
  }

  // Uncertain cases (e.g. personal friend asking for money on friend's phone)
  if (/lost my phone|buddy's phone|stranded|send \$|in a bind/i.test(text) && !hasSuspiciousLink && !hasAttachment) {
    uncertainScore += 50;
  }

  let classification: "SPAM" | "NOT_SPAM" | "UNCERTAIN" = "NOT_SPAM";
  let confidence = 80;
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  let recommendation = "This message shows normal communication patterns, but always exercise standard caution with unsolicited senders.";

  if (uncertainScore >= 40 && spamScore < 50) {
    classification = "UNCERTAIN";
    confidence = 72;
    riskLevel = "MEDIUM";
    recommendation = "Contact your friend through a trusted, known secondary channel (e.g., call their usual number or ask a shared acquaintance) before sending funds.";
    if (reasons.length === 0) {
      reasons.push("Unverified sender claiming to be a friend in distress.");
      reasons.push("Requests quick money transfer from an unknown number.");
    }
  } else if (spamScore >= 35) {
    classification = "SPAM";
    confidence = Math.min(98, 65 + spamScore / 2);
    riskLevel = "HIGH";
    recommendation = "Do not click any embedded links, do not download attachments, and avoid replying. Report and block the sender immediately.";
  } else if (isMarketingPromo) {
    classification = "NOT_SPAM";
    confidence = 88;
    riskLevel = "LOW";
    recommendation = "Message appears to be an opt-in promotional bulletin. If unwanted, use the official unsubscribe link or mark as promotional in your mail client.";
    reasons.push("Identified as legitimate commercial promotion with opt-out mechanisms.");
    reasons.push("No solicitation of passwords, direct funds, or malicious file downloads.");
  } else {
    classification = "NOT_SPAM";
    confidence = 85;
    riskLevel = "LOW";
    recommendation = "Message shows no overt deception or credential solicitation. As best practice, avoid sharing sensitive personal data.";
    reasons.push("No suspicious links, deceptive urgency, or credential requests identified.");
    reasons.push("Communication tone matches expected interpersonal or operational correspondence.");
  }

  const detectedSignals = OFFICIAL_SIGNAL_METADATA.map((sig) => ({
    id: sig.id,
    label: sig.label,
    detected:
      (sig.id === "suspicious_links" && hasSuspiciousLink) ||
      (sig.id === "fake_prizes" && hasPrizeClaim) ||
      (sig.id === "credential_requests" && hasCredentialRequest) ||
      (sig.id === "urgency_threats" && hasUrgency) ||
      (sig.id === "unusual_grammar" && /[A-Z]{5,}|!{3,}/.test(userMessage)) ||
      (sig.id === "aggressive_marketing" && isMarketingPromo) ||
      (sig.id === "impersonation" && hasImpersonation) ||
      (sig.id === "unexpected_attachments" && hasAttachment) ||
      (sig.id === "unknown_contacts" && hasUnknownContact),
  }));

  const rawFormattedText = `Classification: ${classification}
Confidence: ${Math.round(confidence)}%

Reasons:
${reasons.map((r) => `- ${r}`).join("\n")}

Risk level: ${riskLevel}

Recommendation:
${recommendation}`;

  return {
    classification,
    confidence: Math.round(confidence),
    reasons,
    riskLevel,
    recommendation,
    rawFormattedText,
    detectedSignals,
    modelUsed: "Heuristic Defense Analyzer",
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
      model: "gemini-3.8-flash",
    });
  });

  // Spam message analysis endpoint
  app.post("/api/analyze", async (req, res) => {
    const { message, messageType } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      res.status(400).json({ error: "Please provide a valid message to analyze." });
      return;
    }

    const trimmedMessage = message.trim();

    // Check if Gemini API Key is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not configured. Falling back to heuristic rule engine.");
      const heuristicResult = runHeuristicRuleEngine(trimmedMessage);
      res.json(heuristicResult);
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemPrompt = `You are an intelligent spam-message detection assistant.

Your task is to analyze the user’s SMS, email, or chat message and classify it as either:
- SPAM
- NOT_SPAM
- UNCERTAIN

Consider the following signals:
- Suspicious links or unknown websites
- Fake prizes, rewards, or lottery claims
- Requests for passwords, verification codes, money, or banking details
- Excessive urgency or threats
- Unusual grammar or formatting
- Aggressive marketing language
- Impersonation of banks, companies, government agencies, or friends
- Unexpected attachments or downloads
- Requests to contact an unknown phone number or account

Do not assume a message is spam only because it contains advertisements. Also, do not claim that a message is definitely safe. Protect the user’s privacy and do not request unnecessary personal information.

Return the result using exactly this format:

Classification: [SPAM, NOT_SPAM, or UNCERTAIN]
Confidence: [0–100]%

Reasons:
- [Reason 1]
- [Reason 2]
- [Reason 3]

Risk level: [LOW, MEDIUM, or HIGH]

Recommendation:
[Give a short, practical safety recommendation.]`;

      const prompt = `${systemPrompt}

Message to analyze (Type: ${messageType || "unknown"}):
${trimmedMessage}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      const responseText = response.text || "";
      if (!responseText.trim()) {
        throw new Error("Empty response from AI model.");
      }

      const parsedOutput = parseGeminiResponse(responseText, trimmedMessage);
      res.json(parsedOutput);
    } catch (err: unknown) {
      console.error("Gemini API call failed, falling back to heuristic analyzer:", err);
      // Fallback gracefully so user experience is always functional
      const fallbackResult = runHeuristicRuleEngine(trimmedMessage);
      res.json(fallbackResult);
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Spam Message Detector running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
