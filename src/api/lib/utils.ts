export function generateId(prefix: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const random = Array.from({ length: 8 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
  return `${prefix}_${random}`;
}

export async function hashSha256(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function maskAadhaar(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 12) return value;
  return `XXXX XXXX ${digits.slice(8)}`;
}

export function maskPan(value: string): string {
  if (value.length < 5) return value;
  return `${value.slice(0, 2)}XXXX${value.slice(4)}`;
}
