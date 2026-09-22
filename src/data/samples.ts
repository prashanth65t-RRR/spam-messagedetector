import { SampleMessage, SignalDetection } from '../types';

export const OFFICIAL_SIGNALS: { id: string; label: string; description: string }[] = [
  {
    id: 'suspicious_links',
    label: 'Suspicious links or unknown websites',
    description: 'URLs with odd domains, obfuscated redirects, typosquatted names, or IP addresses.',
  },
  {
    id: 'fake_prizes',
    label: 'Fake prizes, rewards, or lottery claims',
    description: 'Offers of unexpected gift cards, lottery winnings, or high-value bonuses.',
  },
  {
    id: 'credential_requests',
    label: 'Requests for passwords, verification codes, money, or banking details',
    description: 'Direct solicitations for OTPs, credit cards, SSNs, wire transfers, or gift card codes.',
  },
  {
    id: 'urgency_threats',
    label: 'Excessive urgency or threats',
    description: 'Artificial deadlines ("within 15 minutes", "account terminated in 24 hours", "warrant issued").',
  },
  {
    id: 'unusual_grammar',
    label: 'Unusual grammar or formatting',
    description: 'Awkward phrasing, inconsistent casing (e.g. "VeRiFy nOw"), random symbols, or machine translation quirks.',
  },
  {
    id: 'aggressive_marketing',
    label: 'Aggressive marketing language',
    description: 'Hyperbolic claims, all-caps hype, repeatedly pushing deceptive unsolicited purchase triggers.',
  },
  {
    id: 'impersonation',
    label: 'Impersonation of banks, companies, government agencies, or friends',
    description: 'Claiming to represent IRS, USPS, Chase, Amazon, or a friend in distress without verified origin.',
  },
  {
    id: 'unexpected_attachments',
    label: 'Unexpected attachments or downloads',
    description: 'References to unknown PDFs, zipped files, APKs, or invoices requiring immediate execution.',
  },
  {
    id: 'unknown_contacts',
    label: 'Requests to contact an unknown phone number or account',
    description: 'Urging the user to call an unverified 1-800 number, Telegram handle, or foreign phone line.',
  },
];

export const SAMPLE_MESSAGES: SampleMessage[] = [
  {
    id: 'sms-usps-delivery',
    title: 'USPS Package Hold Scam',
    channel: 'sms',
    category: 'Package / Delivery',
    preview: 'USPS: Your package #US9402 has been put on hold due to incomplete address...',
    content: 'USPS Notice: Your package tracking #9400-1118-9956 has been held at the local distribution facility due to an incomplete street address. Please update your delivery details within 12 hours to avoid package return to sender: https://usps-post-redelivery-hub.info/confirm?id=9402',
    hint: 'Phishing SMS impersonating USPS with fake urgency and suspicious lookalike domain.',
  },
  {
    id: 'sms-bank-alert',
    title: 'Chase Bank Account Suspended Alert',
    channel: 'sms',
    category: 'Banking / Security',
    preview: 'Chase Alert: Unauthorized $499.00 charge detected. Account locked...',
    content: 'CHASE SECURITY: We detected a suspicious charge of $499.00 at BEST BUY on your debit card ending in 4108. Your account has been temporarily restricted. Reply STOP to cancel, or immediately verify your login credentials here: https://chase-security-resolver.com/auth',
    hint: 'Classic smishing impersonating Chase with immediate panic trigger and credential harvesting link.',
  },
  {
    id: 'sms-lottery-gift',
    title: 'Walmart $1,000 Gift Card Win',
    channel: 'sms',
    category: 'Prizes / Lottery',
    preview: 'CONGRATULATIONS! You have been selected as our 1st prize winner...',
    content: 'CONGRATULATIONS! Your mobile number was chosen in our Customer Loyalty Sweepstakes to receive a $1,000 Walmart Gift Card! Claim your reward within 15 minutes before it is offered to the next contestant: http://win-promo-walmart-giftcard.xyz/claim',
    hint: 'Fake prize reward scam featuring artificial countdown timer and scam domain.',
  },
  {
    id: 'chat-friend-distress',
    title: 'Distressed Friend Request',
    channel: 'chat',
    category: 'Urgent Friend Request',
    preview: 'Hey! Lost my phone and using my buddy’s phone. In a huge bind...',
    content: 'Hey, it’s Dan! My phone died and I am stranded outside the train station right now. My wallet was in my bag which got stolen. Could you send $60 on CashApp or Zelle to $quickdan91? I will pay you back the second I get home tomorrow morning!',
    hint: 'Impersonation / uncertain scenario. Demands caution and out-of-band verification.',
  },
  {
    id: 'email-legit-colleague',
    title: 'Legitimate Project Update Email',
    channel: 'email',
    category: 'Legitimate / Personal',
    preview: 'Hi team, sharing the revised sprint roadmap and deck for tomorrow’s sync...',
    content: 'Hi Sarah,\n\nFollowing up on our sprint planning session earlier today. I’ve uploaded the slides to our shared Google Drive folder under Q3-Deliverables. Let’s spend the first 10 minutes of tomorrow’s 10:00 AM sync reviewing slide 4.\n\nBest,\nMarcus Chen\nProduct Lead',
    hint: 'Normal business communication with no deceptive triggers, urgency, or credential requests.',
  },
  {
    id: 'email-promo-store',
    title: 'Retail Store Promotional Newsletter',
    channel: 'email',
    category: 'Marketing / Promo',
    preview: 'Patagonia Summer Sale: Up to 30% off past-season gear through Sunday...',
    content: 'Patagonia Gear Updates:\n\nOur End-of-Season Sale is now live online and in retail stores. Enjoy up to 30% off select jackets, fleeces, and daypacks through Sunday, July 28 at 11:59 PM PT.\n\nFree shipping on orders over $99. To manage your email preferences or unsubscribe, visit our customer preference center at https://www.patagonia.com/unsubscribe.',
    hint: 'Legitimate advertisement. Note: Marketing/ads are not spam if legitimate and unsubscribable.',
  },
  {
    id: 'email-tax-refund',
    title: 'IRS Tax Refund Pending Notification',
    channel: 'email',
    category: 'Banking / Security',
    preview: 'Internal Revenue Service: Direct Deposit of $1,420.50 Failed...',
    content: 'INTERNAL REVENUE SERVICE (IRS)\nNotification of Undelivered Tax Refund\n\nOur records indicate you are eligible for an outstanding federal tax refund of $1,420.50. However, the direct deposit details on file could not be verified by your financial institution.\n\nDownload the attached form "IRS_W8BEN_Verification.pdf.exe" or visit the IRS Taxpayer Assistance portal at http://194.26.29.112/irs/verify to submit your banking routing number and Social Security verification.',
    hint: 'Government impersonation with dangerous executable attachment disguise and direct IP URL.',
  },
];
