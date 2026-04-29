/**
 * Zenetrix mock fixtures. Deterministic seed data used by all routes when
 * VITE_USE_MOCKS=true (default).
 */

export type CredentialType = "kyc-basic" | "kyc-full" | "address-proof" | "income-proof";
export type CredentialStatus = "active" | "revoked" | "expired";

export interface Credential {
  id: string;
  type: CredentialType;
  title: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string;
  status: CredentialStatus;
  serial: string;
  claims: { label: string; value: string; sensitive?: boolean }[];
}

export type SessionStatus = "pending" | "in-review" | "approved" | "rejected" | "escalated";

export interface KycSession {
  id: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  documentType: "aadhaar" | "pan" | "passport" | "voter-id";
  documentNumber: string;
  riskScore: number;
  status: SessionStatus;
  submittedAt: string;
  livenessScore: number;
  faceMatchScore: number;
  flags: string[];
  channel: "wallet" | "partner-app" | "branch";
  reviewer?: string;
  notes?: string;
}

export type ConsentStatus = "pending" | "active" | "revoked" | "expired";

export interface ConsentRequest {
  id: string;
  institution: string;
  institutionType: "bank" | "nbfc" | "broker" | "insurer" | "exchange";
  purpose: string;
  scope: string[];
  requestedAt: string;
  expiresAt: string;
  status: ConsentStatus;
  duration: string;
}

export type ActivityKind =
  | "credential.issued"
  | "credential.revoked"
  | "consent.granted"
  | "consent.revoked"
  | "session.submitted"
  | "rekyc.due"
  | "verification.success"
  | "verification.failed";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  description: string;
  at: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  resource: string;
  hash: string;
  ip: string;
}

const isoDaysAgo = (d: number, hours = 0) =>
  new Date(Date.now() - d * 86400000 - hours * 3600000).toISOString();

export const mockCredentials: Credential[] = [
  {
    id: "cred_01HZX8YA",
    type: "kyc-full",
    title: "Verified KYC — Full",
    issuer: "Zenetrix Identity Network",
    issuedAt: isoDaysAgo(14),
    expiresAt: isoDaysAgo(-351),
    status: "active",
    serial: "ZNX-IND-2046-71B3-A19C",
    claims: [
      { label: "Full name", value: "Aarav Sharma" },
      { label: "Date of birth", value: "12 Mar 1994" },
      { label: "Aadhaar", value: "XXXX XXXX 4187", sensitive: true },
      { label: "PAN", value: "ABXXXX19F", sensitive: true },
      { label: "Address", value: "Bengaluru, KA" },
      { label: "Liveness", value: "Passed (98%)" },
    ],
  },
  {
    id: "cred_01HZX8YB",
    type: "address-proof",
    title: "Address Proof",
    issuer: "Zenetrix Identity Network",
    issuedAt: isoDaysAgo(40),
    expiresAt: isoDaysAgo(-325),
    status: "active",
    serial: "ZNX-ADR-2046-22F1-91DD",
    claims: [
      { label: "Address line", value: "12, MG Road" },
      { label: "City", value: "Bengaluru" },
      { label: "State", value: "Karnataka" },
      { label: "PIN", value: "560001" },
    ],
  },
  {
    id: "cred_01HZX8YC",
    type: "income-proof",
    title: "Income Verification",
    issuer: "Zenetrix Income Bureau",
    issuedAt: isoDaysAgo(120),
    expiresAt: isoDaysAgo(-245),
    status: "expired",
    serial: "ZNX-INC-2045-C8AE-77B0",
    claims: [
      { label: "Annual income band", value: "₹18–24 L" },
      { label: "Source", value: "Salaried" },
      { label: "Employer", value: "Verified" },
    ],
  },
];

const indianNames = [
  "Aarav Sharma", "Diya Mehta", "Vihaan Iyer", "Ananya Reddy", "Kabir Nair",
  "Saanvi Kapoor", "Arjun Verma", "Ishaan Pillai", "Kiara Joshi", "Reyansh Patel",
  "Myra Bose", "Aditya Rao", "Anika Sen", "Vivaan Khan", "Tara Menon",
  "Rohan Das", "Prisha Singh", "Krish Bhat", "Navya Kulkarni", "Dhruv Trivedi",
];

const flagsPool = [
  "device-mismatch", "vpn-detected", "doc-tamper-low", "face-low-confidence",
  "geo-mismatch", "duplicate-aadhaar", "blocklist-hit", "age-mismatch",
];

function rand<T>(arr: T[], i: number) {
  return arr[i % arr.length];
}

export const mockSessions: KycSession[] = Array.from({ length: 48 }).map((_, i) => {
  const statuses: SessionStatus[] = ["pending", "in-review", "approved", "rejected", "escalated"];
  const status = rand(statuses, i);
  const risk = (i * 37) % 100;
  return {
    id: `sess_${(10000 + i).toString(16).toUpperCase()}`,
    applicantName: rand(indianNames, i),
    applicantPhone: `+91 9${(800000000 + i * 13571).toString().slice(0, 9)}`,
    applicantEmail: rand(indianNames, i).toLowerCase().replace(" ", ".") + "@example.in",
    documentType: rand(["aadhaar", "pan", "passport", "voter-id"] as const, i),
    documentNumber: `${(1000_0000 + i * 137).toString().padStart(12, "0")}`,
    riskScore: risk,
    status,
    submittedAt: isoDaysAgo((i % 14), (i * 3) % 24),
    livenessScore: 60 + ((i * 7) % 40),
    faceMatchScore: 70 + ((i * 11) % 30),
    flags: i % 3 === 0 ? [rand(flagsPool, i), rand(flagsPool, i + 1)] : i % 5 === 0 ? [rand(flagsPool, i)] : [],
    channel: rand(["wallet", "partner-app", "branch"] as const, i),
    reviewer: status === "approved" || status === "rejected" ? "Neha Patel" : undefined,
    notes: status === "escalated" ? "Manual review requested by L1 reviewer." : undefined,
  };
});

export const mockConsents: ConsentRequest[] = [
  {
    id: "csnt_01",
    institution: "HDFC Bank",
    institutionType: "bank",
    purpose: "Savings account opening",
    scope: ["full-name", "dob", "aadhaar-last4", "pan", "address", "liveness"],
    requestedAt: isoDaysAgo(0, 2),
    expiresAt: isoDaysAgo(-7),
    status: "pending",
    duration: "7 days",
  },
  {
    id: "csnt_02",
    institution: "Zerodha",
    institutionType: "broker",
    purpose: "Demat account onboarding",
    scope: ["full-name", "pan", "dob", "address"],
    requestedAt: isoDaysAgo(0, 6),
    expiresAt: isoDaysAgo(-3),
    status: "pending",
    duration: "3 days",
  },
  {
    id: "csnt_03",
    institution: "Bajaj Finserv",
    institutionType: "nbfc",
    purpose: "Personal loan KYC",
    scope: ["full-name", "pan", "address", "income-band"],
    requestedAt: isoDaysAgo(3),
    expiresAt: isoDaysAgo(-27),
    status: "active",
    duration: "30 days",
  },
  {
    id: "csnt_04",
    institution: "ICICI Lombard",
    institutionType: "insurer",
    purpose: "Health insurance policy",
    scope: ["full-name", "dob", "address"],
    requestedAt: isoDaysAgo(11),
    expiresAt: isoDaysAgo(-19),
    status: "active",
    duration: "30 days",
  },
  {
    id: "csnt_05",
    institution: "Groww",
    institutionType: "broker",
    purpose: "Mutual funds onboarding",
    scope: ["full-name", "pan", "address"],
    requestedAt: isoDaysAgo(60),
    expiresAt: isoDaysAgo(30),
    status: "expired",
    duration: "30 days",
  },
];

export const mockActivity: ActivityItem[] = [
  { id: "a1", kind: "consent.granted", title: "Consent granted to Bajaj Finserv", description: "Personal loan KYC · 30 days", at: isoDaysAgo(0, 1) },
  { id: "a2", kind: "verification.success", title: "Identity verified at Zerodha", description: "Demat account · partner verification", at: isoDaysAgo(0, 4) },
  { id: "a3", kind: "credential.issued", title: "Address Proof issued", description: "Verified by Zenetrix Identity Network", at: isoDaysAgo(1) },
  { id: "a4", kind: "rekyc.due", title: "Re-KYC reminder", description: "Income verification expires in 14 days", at: isoDaysAgo(2) },
  { id: "a5", kind: "consent.revoked", title: "Revoked consent for Groww", description: "Mutual funds onboarding", at: isoDaysAgo(5) },
  { id: "a6", kind: "session.submitted", title: "KYC session submitted", description: "Re-KYC for HDFC Bank", at: isoDaysAgo(6) },
  { id: "a7", kind: "credential.issued", title: "Verified KYC — Full issued", description: "Initial onboarding complete", at: isoDaysAgo(14) },
];

export const mockAudit: AuditEntry[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `audit_${i}`,
  at: isoDaysAgo(i % 20, (i * 5) % 24),
  actor: rand(["Neha Patel", "Rohan Das", "system", "Aarav Sharma"], i),
  action: rand(
    [
      "session.approved",
      "session.rejected",
      "session.escalated",
      "credential.revoked",
      "policy.updated",
      "consent.granted",
      "consent.revoked",
      "user.signin",
    ],
    i,
  ),
  resource: rand(
    ["sess_10027", "cred_01HZX8YC", "policy.risk-thresholds", "csnt_03", "user:aarav.sharma"],
    i,
  ),
  hash: `0x${(i * 0x9e3779b1).toString(16).padStart(8, "0")}${(i * 0x85ebca77).toString(16).padStart(8, "0")}`,
  ip: `103.${(i * 7) % 255}.${(i * 13) % 255}.${(i * 31) % 255}`,
}));

// Dashboard analytics
export const mockApprovalsTrend = Array.from({ length: 14 }).map((_, i) => {
  const base = 80 + Math.round(Math.sin(i / 2) * 18);
  return {
    day: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    approved: base + (i % 3) * 4,
    rejected: 14 + (i % 5) * 2,
    escalated: 6 + (i % 4),
  };
});

export const mockRiskDistribution = [
  { band: "Low", value: 412 },
  { band: "Medium", value: 198 },
  { band: "High", value: 64 },
];

export const mockKpis = {
  sessionsToday: 248,
  sessionsTodayDelta: 12.4,
  approvalRate: 86.2,
  approvalRateDelta: 1.8,
  avgRisk: 31.4,
  avgRiskDelta: -2.1,
  pending: 27,
  pendingDelta: -4,
};
