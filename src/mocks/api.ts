import {
  mockActivity,
  mockApprovalsTrend,
  mockAudit,
  mockConsents,
  mockCredentials,
  mockKpis,
  mockRiskDistribution,
  mockSessions,
  type ConsentRequest,
  type Credential,
  type KycSession,
  type SessionStatus,
} from "./fixtures";

// Simulated network latency
function latency(min = 250, max = 600) {
  return new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
}

// In-memory mutable copies (reset on reload)
let credentials = [...mockCredentials];
let consents = [...mockConsents];
let sessions = [...mockSessions];

export const api = {
  // Credentials
  async listCredentials(): Promise<Credential[]> {
    await latency();
    return credentials;
  },
  async getCredential(id: string): Promise<Credential | null> {
    await latency();
    return credentials.find((c) => c.id === id) ?? null;
  },
  async revokeCredential(id: string) {
    await latency();
    credentials = credentials.map((c) => (c.id === id ? { ...c, status: "revoked" } : c));
    return credentials.find((c) => c.id === id);
  },

  // Consent
  async listConsents(): Promise<ConsentRequest[]> {
    await latency();
    return consents;
  },
  async getConsent(id: string): Promise<ConsentRequest | null> {
    await latency();
    return consents.find((c) => c.id === id) ?? null;
  },
  async respondConsent(id: string, action: "approve" | "reject" | "revoke") {
    await latency();
    consents = consents.map((c) => {
      if (c.id !== id) return c;
      if (action === "approve") return { ...c, status: "active" };
      if (action === "reject") return { ...c, status: "revoked" };
      return { ...c, status: "revoked" };
    });
    return consents.find((c) => c.id === id);
  },

  // Activity
  async listActivity() {
    await latency();
    return mockActivity;
  },

  // Sessions (admin)
  async listSessions(params?: {
    status?: SessionStatus | "all";
    risk?: "low" | "medium" | "high" | "all";
    q?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ rows: KycSession[]; total: number }> {
    await latency(180, 420);
    let rows = [...sessions];
    if (params?.status && params.status !== "all") {
      rows = rows.filter((r) => r.status === params.status);
    }
    if (params?.risk && params.risk !== "all") {
      rows = rows.filter((r) => {
        const s = r.riskScore;
        if (params.risk === "low") return s < 30;
        if (params.risk === "medium") return s >= 30 && s < 70;
        return s >= 70;
      });
    }
    if (params?.q) {
      const q = params.q.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.applicantName.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.documentNumber.includes(q),
      );
    }
    const total = rows.length;
    const page = params?.page ?? 1;
    const size = params?.pageSize ?? 10;
    rows = rows.slice((page - 1) * size, page * size);
    return { rows, total };
  },
  async getSession(id: string) {
    await latency();
    return sessions.find((s) => s.id === id) ?? null;
  },
  async decideSession(id: string, decision: "approve" | "reject" | "escalate", note?: string) {
    await latency();
    sessions = sessions.map((s) =>
      s.id === id
        ? {
            ...s,
            status:
              decision === "approve"
                ? "approved"
                : decision === "reject"
                  ? "rejected"
                  : "escalated",
            notes: note ?? s.notes,
            reviewer: "You",
          }
        : s,
    );
    return sessions.find((s) => s.id === id);
  },

  // Dashboard
  async dashboard() {
    await latency();
    return {
      kpis: mockKpis,
      approvalsTrend: mockApprovalsTrend,
      riskDistribution: mockRiskDistribution,
    };
  },

  // Audit
  async listAudit() {
    await latency();
    return mockAudit;
  },
};

export type Api = typeof api;
