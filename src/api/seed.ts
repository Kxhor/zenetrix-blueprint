/**
 * Seed script — populates D1 with initial demo data.
 * Run: npx wrangler d1 execute zenetrix-db --file=./migrations/0001_initial.sql
 * Then: npx wrangler d1 execute zenetrix-db --command="<seed SQL>"
 *
 * Or use the HTTP API via this script:
 *   npx tsx src/api/seed.ts
 */

const isoDaysAgo = (d: number, hours = 0) =>
  new Date(Date.now() - d * 86400000 - hours * 3600000).toISOString();

function generateSql(): string {
  const sql: string[] = [];

  // ── Users ────────────────────────────────────────────
  sql.push(`INSERT OR IGNORE INTO users (id, phone, email, name, role, avatar_color) VALUES
    ('usr_DEMO0001', '+919876543210', NULL, 'Aarav Sharma', 'user', '#0EA5E9'),
    ('usr_DEMO0002', '+919876543211', NULL, 'Diya Mehta', 'user', '#16A34A'),
    ('adm_ADMIN001', NULL, 'neha.patel@zenetrix.in', 'Neha Patel', 'admin', '#0EA5E9'),
    ('adm_ADMIN002', NULL, 'rohan.das@zenetrix.in', 'Rohan Das', 'admin', '#7C3AED');
  `);

  // ── Credentials ──────────────────────────────────────
  sql.push(`INSERT OR IGNORE INTO credentials (id, user_id, type, title, issuer, issued_at, expires_at, status, serial, claims_json) VALUES
    ('cred_01HZX8YA', 'usr_DEMO0001', 'kyc-full', 'Verified KYC — Full', 'Zenetrix Identity Network', '${isoDaysAgo(14)}', '${isoDaysAgo(-351)}', 'active', 'ZNX-IND-2046-71B3-A19C', '[{"label":"Full name","value":"Aarav Sharma"},{"label":"Date of birth","value":"12 Mar 1994"},{"label":"Aadhaar","value":"XXXX XXXX 4187","sensitive":true},{"label":"PAN","value":"ABXXXX19F","sensitive":true},{"label":"Address","value":"Bengaluru, KA"},{"label":"Liveness","value":"Passed (98%)"}]'),
    ('cred_01HZX8YB', 'usr_DEMO0001', 'address-proof', 'Address Proof', 'Zenetrix Identity Network', '${isoDaysAgo(40)}', '${isoDaysAgo(-325)}', 'active', 'ZNX-ADR-2046-22F1-91DD', '[{"label":"Address line","value":"12, MG Road"},{"label":"City","value":"Bengaluru"},{"label":"State","value":"Karnataka"},{"label":"PIN","value":"560001"}]'),
    ('cred_01HZX8YC', 'usr_DEMO0001', 'income-proof', 'Income Verification', 'Zenetrix Income Bureau', '${isoDaysAgo(120)}', '${isoDaysAgo(-245)}', 'expired', 'ZNX-INC-2045-C8AE-77B0', '[{"label":"Annual income band","value":"₹18–24 L"},{"label":"Source","value":"Salaried"},{"label":"Employer","value":"Verified"}]'),
    ('cred_01HZX8YD', 'usr_DEMO0002', 'kyc-full', 'Verified KYC — Full', 'Zenetrix Identity Network', '${isoDaysAgo(7)}', '${isoDaysAgo(-358)}', 'active', 'ZNX-IND-2046-82C4-B20D', '[{"label":"Full name","value":"Diya Mehta"},{"label":"Date of birth","value":"05 Jul 1996"},{"label":"Aadhaar","value":"XXXX XXXX 7892","sensitive":true},{"label":"PAN","value":"CDXXXX28G","sensitive":true},{"label":"Address","value":"Mumbai, MH"},{"label":"Liveness","value":"Passed (96%)"}]');
  `);

  // ── Consents ─────────────────────────────────────────
  sql.push(`INSERT OR IGNORE INTO consents (id, user_id, institution, institution_type, purpose, scope_json, requested_at, expires_at, status, duration) VALUES
    ('csnt_01', 'usr_DEMO0001', 'HDFC Bank', 'bank', 'Savings account opening', '["full-name","dob","aadhaar-last4","pan","address","liveness"]', '${isoDaysAgo(0, 2)}', '${isoDaysAgo(-7)}', 'pending', '7 days'),
    ('csnt_02', 'usr_DEMO0001', 'Zerodha', 'broker', 'Demat account onboarding', '["full-name","pan","dob","address"]', '${isoDaysAgo(0, 6)}', '${isoDaysAgo(-3)}', 'pending', '3 days'),
    ('csnt_03', 'usr_DEMO0001', 'Bajaj Finserv', 'nbfc', 'Personal loan KYC', '["full-name","pan","address","income-band"]', '${isoDaysAgo(3)}', '${isoDaysAgo(-27)}', 'active', '30 days'),
    ('csnt_04', 'usr_DEMO0001', 'ICICI Lombard', 'insurer', 'Health insurance policy', '["full-name","dob","address"]', '${isoDaysAgo(11)}', '${isoDaysAgo(-19)}', 'active', '30 days'),
    ('csnt_05', 'usr_DEMO0001', 'Groww', 'broker', 'Mutual funds onboarding', '["full-name","pan","address"]', '${isoDaysAgo(60)}', '${isoDaysAgo(30)}', 'expired', '30 days');
  `);

  // ── Activities ───────────────────────────────────────
  sql.push(`INSERT OR IGNORE INTO activities (id, user_id, kind, title, description, at) VALUES
    ('a1', 'usr_DEMO0001', 'consent.granted', 'Consent granted to Bajaj Finserv', 'Personal loan KYC · 30 days', '${isoDaysAgo(0, 1)}'),
    ('a2', 'usr_DEMO0001', 'verification.success', 'Identity verified at Zerodha', 'Demat account · partner verification', '${isoDaysAgo(0, 4)}'),
    ('a3', 'usr_DEMO0001', 'credential.issued', 'Address Proof issued', 'Verified by Zenetrix Identity Network', '${isoDaysAgo(1)}'),
    ('a4', 'usr_DEMO0001', 'rekyc.due', 'Re-KYC reminder', 'Income verification expires in 14 days', '${isoDaysAgo(2)}'),
    ('a5', 'usr_DEMO0001', 'consent.revoked', 'Revoked consent for Groww', 'Mutual funds onboarding', '${isoDaysAgo(5)}'),
    ('a6', 'usr_DEMO0001', 'session.submitted', 'KYC session submitted', 'Re-KYC for HDFC Bank', '${isoDaysAgo(6)}'),
    ('a7', 'usr_DEMO0001', 'credential.issued', 'Verified KYC — Full issued', 'Initial onboarding complete', '${isoDaysAgo(14)}');
  `);

  // ── Sessions (48 demo sessions) ──────────────────────
  const indianNames = [
    "Aarav Sharma",
    "Diya Mehta",
    "Vihaan Iyer",
    "Ananya Reddy",
    "Kabir Nair",
    "Saanvi Kapoor",
    "Arjun Verma",
    "Ishaan Pillai",
    "Kiara Joshi",
    "Reyansh Patel",
    "Myra Bose",
    "Aditya Rao",
    "Anika Sen",
    "Vivaan Khan",
    "Tara Menon",
    "Rohan Das",
    "Prisha Singh",
    "Krish Bhat",
    "Navya Kulkarni",
    "Dhruv Trivedi",
  ];
  const statuses = ["pending", "in-review", "approved", "rejected", "escalated"];
  const docTypes = ["aadhaar", "pan", "passport", "voter-id"];
  const channels = ["wallet", "partner-app", "branch"];
  const flagsPool = [
    "device-mismatch",
    "vpn-detected",
    "doc-tamper-low",
    "face-low-confidence",
    "geo-mismatch",
    "duplicate-aadhaar",
    "blocklist-hit",
    "age-mismatch",
  ];

  const sessionValues: string[] = [];
  for (let i = 0; i < 48; i++) {
    const status = statuses[i % statuses.length];
    const risk = (i * 37) % 100;
    const name = indianNames[i % indianNames.length];
    const docType = docTypes[i % docTypes.length];
    const channel = channels[i % channels.length];
    const flags =
      i % 3 === 0
        ? [flagsPool[i % flagsPool.length], flagsPool[(i + 1) % flagsPool.length]]
        : i % 5 === 0
          ? [flagsPool[i % flagsPool.length]]
          : [];

    sessionValues.push(`(
      'sess_${(10000 + i).toString(16).toUpperCase()}',
      NULL,
      '${name}',
      '+91 9${(800000000 + i * 13571).toString().slice(0, 9)}',
      '${name.toLowerCase().replace(" ", ".")}@example.in',
      '${docType}',
      '${(10000000 + i * 137).toString().padStart(12, "0")}',
      ${risk},
      '${status}',
      '${isoDaysAgo(i % 14, (i * 3) % 24)}',
      ${60 + ((i * 7) % 40)},
      ${70 + ((i * 11) % 30)},
      '${JSON.stringify(flags)}',
      '${channel}',
      ${status === "approved" || status === "rejected" ? "'Neha Patel'" : "NULL"},
      ${status === "escalated" ? "'Manual review requested by L1 reviewer.'" : "NULL"}
    )`);
  }

  sql.push(`INSERT OR IGNORE INTO sessions (id, user_id, applicant_name, applicant_phone, applicant_email, document_type, document_number, risk_score, status, submitted_at, liveness_score, face_match_score, flags_json, channel, reviewer, notes) VALUES
${sessionValues.join(",\n")};
`);

  // ── Audit log (30 entries) ───────────────────────────
  const auditActions = [
    "session.approved",
    "session.rejected",
    "session.escalated",
    "credential.revoked",
    "policy.updated",
    "consent.granted",
    "consent.revoked",
    "user.signin",
  ];
  const auditActors = ["Neha Patel", "Rohan Das", "system", "Aarav Sharma"];
  const auditResources = [
    "sess_10027",
    "cred_01HZX8YC",
    "policy.risk-thresholds",
    "csnt_03",
    "user:aarav.sharma",
  ];

  const auditValues: string[] = [];
  for (let i = 0; i < 30; i++) {
    const hash = `0x${(i * 0x9e3779b1).toString(16).padStart(8, "0")}${(i * 0x85ebca77).toString(16).padStart(8, "0")}`;
    const ip = `103.${(i * 7) % 255}.${(i * 13) % 255}.${(i * 31) % 255}`;
    auditValues.push(`(
      'audit_${i}',
      NULL,
      '${auditActors[i % auditActors.length]}',
      '${auditActions[i % auditActions.length]}',
      '${auditResources[i % auditResources.length]}',
      '${hash}',
      '${ip}',
      '${isoDaysAgo(i % 20, (i * 5) % 24)}'
    )`);
  }

  sql.push(`INSERT OR IGNORE INTO audit_log (id, user_id, actor, action, resource, hash, ip, at) VALUES
${auditValues.join(",\n")};
`);

  return sql.join("\n");
}

// Output SQL to stdout
console.log(generateSql());
