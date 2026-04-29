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
  applicantEmail?: string;
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

export interface AuthUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: "user" | "admin";
  avatarColor: string;
}

export interface DashboardData {
  kpis: {
    sessionsToday: number;
    sessionsTodayDelta: number;
    approvalRate: number;
    approvalRateDelta: number;
    avgRisk: number;
    avgRiskDelta: number;
    pending: number;
    pendingDelta: number;
  };
  approvalsTrend: {
    day: string;
    approved: number;
    rejected: number;
    escalated: number;
  }[];
  riskDistribution: { band: "Low" | "Medium" | "High"; value: number }[];
}
