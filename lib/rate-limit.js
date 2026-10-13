/* ============================================================
   Rate-limit simple en mémoire (suffit pour un café)
   En production multi-instances, remplacer par Upstash Redis.
   ============================================================ */

const buckets = new Map();
const WINDOW_MS = 60 * 60 * 1000; // 1 heure
const MAX_PER_IP = 5;
const MAX_GLOBAL = 200;             // garde-fou global

let globalCount = 0;
let globalReset = Date.now() + WINDOW_MS;

export function checkRateLimit(ip){
  const now = Date.now();

  if (now > globalReset){
    globalCount = 0;
    globalReset = now + WINDOW_MS;
  }
  if (globalCount >= MAX_GLOBAL){
    return { allowed: false, reason: 'global' };
  }

  const bucket = buckets.get(ip) || { count: 0, reset: now + WINDOW_MS };
  if (now > bucket.reset){
    bucket.count = 0;
    bucket.reset = now + WINDOW_MS;
  }
  if (bucket.count >= MAX_PER_IP){
    return { allowed: false, reason: 'ip' };
  }

  bucket.count++;
  buckets.set(ip, bucket);
  globalCount++;

  // Nettoyage opportuniste
  if (buckets.size > 500){
    for (const [key, b] of buckets){
      if (now > b.reset) buckets.delete(key);
    }
  }

  return { allowed: true };
}

export function getClientIp(req){
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string') return fwd.split(',')[0].trim();
  if (Array.isArray(fwd)) return fwd[0];
  return req.socket?.remoteAddress || 'unknown';
}