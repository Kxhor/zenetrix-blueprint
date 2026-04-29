import axios, { type AxiosInstance } from "axios";

// ── Types (mirror of backend) ────────────────────────────────
export type CredentialType = "kyc-basic" | "kyc-full" | "address-proof" | "income-proof";
export type CredentialStatus = "active" | "revoked" | "expired";
export type SessionStatus = "pending" | "in-review" | "approved" | "rejected" | "escalated";
export type ConsentStatus = "pending" | "active" | "revoked" | "expired";
export type Role = "user" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: Role;
  avatarColor: string;
}

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
  approvalsTrend: { day: string; approved: number; rejected: number; escalated: number }[];
  riskDistribution: { band: "Low" | "Medium" | "High"; value: number }[];
}

// ── API Client ────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || "";

function createClient(): AxiosInstance {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
  });

  // Attach token from localStorage
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem("zenetrix.token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle 401 globally
  client.interceptors.response.use(
    (r) => r,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("zenetrix.token");
        localStorage.removeItem("zenetrix.auth");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    },
  );

  return client;
}

const client = createClient();

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  sendOtp(phone: string) {
    return client.post<{ success: boolean; expiresIn: number; _devCode?: string }>(
      "/api/auth/otp/send",
      { phone },
    );
  },
  verifyOtp(phone: string, code: string) {
    return client.post<{ token: string; user: AuthUser; isNewUser: boolean }>(
      "/api/auth/otp/verify",
      { phone, code },
    );
  },
  adminLogin(email: string, password: string) {
    return client.post<{ token: string; user: AuthUser }>("/api/auth/admin/login", {
      email,
      password,
    });
  },
  register(phone: string, name?: string) {
    return client.post<{ token: string; user: AuthUser }>("/api/auth/register", {
      phone,
      name,
    });
  },
  logout() {
    localStorage.removeItem("zenetrix.token");
    localStorage.removeItem("zenetrix.auth");
  },
  setToken(token: string) {
    localStorage.setItem("zenetrix.token", token);
  },
};

// ── Credentials ───────────────────────────────────────────────
export const credentialsApi = {
  list() {
    return client.get<Credential[]>("/api/credentials");
  },
  get(id: string) {
    return client.get<Credential>(`/api/credentials/${id}`);
  },
  revoke(id: string, reason?: string) {
    return client.post<Credential>(`/api/credentials/${id}/revoke`, { reason });
  },
};

// ── Consents ──────────────────────────────────────────────────
export const consentsApi = {
  list(status?: string) {
    return client.get<ConsentRequest[]>("/api/consents", {
      params: status && status !== "all" ? { status } : {},
    });
  },
  get(id: string) {
    return client.get<ConsentRequest>(`/api/consents/${id}`);
  },
  respond(id: string, action: "approve" | "reject" | "revoke") {
    return client.post<ConsentRequest>(`/api/consents/${id}/respond`, { action });
  },
};

// ── Sessions ──────────────────────────────────────────────────
export const sessionsApi = {
  list(params?: {
    status?: SessionStatus | "all";
    risk?: "low" | "medium" | "high" | "all";
    q?: string;
    page?: number;
    pageSize?: number;
  }) {
    return client.get<{ rows: KycSession[]; total: number }>("/api/sessions", { params });
  },
  get(id: string) {
    return client.get<KycSession>(`/api/sessions/${id}`);
  },
  decide(id: string, decision: "approve" | "reject" | "escalate", note?: string) {
    return client.post<KycSession>(`/api/sessions/${id}/decide`, { decision, note });
  },
  create(data: {
    applicantName: string;
    applicantPhone: string;
    applicantEmail?: string;
    documentType: "aadhaar" | "pan" | "passport" | "voter-id";
    documentNumber: string;
    livenessScore?: number;
    faceMatchScore?: number;
    channel?: "wallet" | "partner-app" | "branch";
  }) {
    return client.post<{ id: string; status: string }>("/api/sessions", data);
  },
};

// ── Activity ──────────────────────────────────────────────────
export const activityApi = {
  list() {
    return client.get<ActivityItem[]>("/api/activity");
  },
};

// ── Dashboard ─────────────────────────────────────────────────
export const dashboardApi = {
  get() {
    return client.get<DashboardData>("/api/admin/dashboard");
  },
};

// ── Audit ─────────────────────────────────────────────────────
export const auditApi = {
  list() {
    return client.get<AuditEntry[]>("/api/admin/audit");
  },
};

// ── Aggregate API (drop-in replacement for mocks/api.ts) ──────
export const api = {
  async listCredentials(): Promise<Credential[]> {
    const { data } = await credentialsApi.list();
    return data;
  },
  async getCredential(id: string): Promise<Credential | null> {
    try {
      const { data } = await credentialsApi.get(id);
      return data;
    } catch {
      return null;
    }
  },
  async revokeCredential(id: string, reason?: string) {
    const { data } = await credentialsApi.revoke(id, reason);
    return data;
  },

  async listConsents(): Promise<ConsentRequest[]> {
    const { data } = await consentsApi.list();
    return data;
  },
  async getConsent(id: string): Promise<ConsentRequest | null> {
    try {
      const { data } = await consentsApi.get(id);
      return data;
    } catch {
      return null;
    }
  },
  async respondConsent(id: string, action: "approve" | "reject" | "revoke") {
    const { data } = await consentsApi.respond(id, action);
    return data;
  },

  async listActivity() {
    const { data } = await activityApi.list();
    return data;
  },

  async listSessions(params?: {
    status?: SessionStatus | "all";
    risk?: "low" | "medium" | "high" | "all";
    q?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ rows: KycSession[]; total: number }> {
    const { data } = await sessionsApi.list(params);
    return data;
  },
  async getSession(id: string): Promise<KycSession | null> {
    try {
      const { data } = await sessionsApi.get(id);
      return data;
    } catch {
      return null;
    }
  },
  async decideSession(id: string, decision: "approve" | "reject" | "escalate", note?: string) {
    const { data } = await sessionsApi.decide(id, decision, note);
    return data;
  },

  async dashboard() {
    const { data } = await dashboardApi.get();
    return data;
  },

  async listAudit() {
    const { data } = await auditApi.list();
    return data;
  },
};

export type Api = typeof api;
