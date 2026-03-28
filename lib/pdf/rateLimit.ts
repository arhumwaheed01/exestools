import { PDF_RATE_LIMIT_MAX, PDF_RATE_LIMIT_WINDOW_MS } from "./constants";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function clientKeyFromRequest(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export function checkPdfRateLimit(key: string): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + PDF_RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (b.count >= PDF_RATE_LIMIT_MAX) return false;
  b.count += 1;
  return true;
}
