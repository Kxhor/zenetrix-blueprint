export function maskAadhaar(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return digits;
  return `XXXX XXXX ${digits.slice(-4)}`;
}

export function maskPan(value: string) {
  if (value.length < 4) return value;
  return `${value.slice(0, 3)}XXXX${value.slice(-2)}`;
}

export function formatRelativeTime(iso: string) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function shortHash(value: string, len = 8) {
  if (value.length <= len * 2 + 3) return value;
  return `${value.slice(0, len)}…${value.slice(-len)}`;
}

export function classByRisk(score: number) {
  if (score < 30) return "success";
  if (score < 70) return "warning";
  return "destructive";
}

export function riskBand(score: number): "low" | "medium" | "high" {
  if (score < 30) return "low";
  if (score < 70) return "medium";
  return "high";
}
