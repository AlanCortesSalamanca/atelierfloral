import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitOptions = {
  requests?: number;
  window?: Parameters<typeof Ratelimit.slidingWindow>[1];
  prefix?: string;
};

type RateLimitResult = {
  success: boolean;
};

type RateLimiter = {
  limit: (identifier: string) => Promise<RateLimitResult>;
};

const memoryHits = new Map<string, { count: number; resetAt: number }>();
const maxMemoryRateLimitEntries = 10_000;
let lastMemoryCleanup = 0;

function cleanupExpiredEntries(now: number) {
  if (now - lastMemoryCleanup < 60_000) return;
  lastMemoryCleanup = now;

  for (const [key, value] of memoryHits) {
    if (value.resetAt <= now) {
      memoryHits.delete(key);
    }
  }
}

function trimOldestEntry() {
  if (memoryHits.size < maxMemoryRateLimitEntries) return;
  const oldestKey = memoryHits.keys().next().value;
  if (oldestKey) {
    memoryHits.delete(oldestKey);
  }
}

function windowToMs(windowValue: RateLimitOptions["window"]) {
  const value = String(windowValue ?? "1 m").trim();
  const match = /^(\d+)\s*([smhd])$/.exec(value);
  if (!match) return 60_000;

  const amount = Number(match[1]);
  const unit = match[2];
  if (unit === "s") return amount * 1_000;
  if (unit === "m") return amount * 60_000;
  if (unit === "h") return amount * 60 * 60_000;
  return amount * 24 * 60 * 60_000;
}

function createMemoryRateLimit({ requests = 5, window = "1 m", prefix = "atelier-floral" }: RateLimitOptions): RateLimiter {
  const windowMs = windowToMs(window);

  return {
    async limit(identifier: string) {
      const now = Date.now();
      cleanupExpiredEntries(now);
      const key = `${prefix}:${identifier}`;
      const current = memoryHits.get(key);

      if (!current || current.resetAt <= now) {
        trimOldestEntry();
        memoryHits.set(key, { count: 1, resetAt: now + windowMs });
        return { success: true };
      }

      current.count += 1;
      if (current.count > requests) {
        return { success: false };
      }

      memoryHits.set(key, current);
      return { success: true };
    },
  };
}

function createUnavailableRateLimit(): RateLimiter {
  return {
    async limit() {
      return { success: false };
    },
  };
}

export function createRateLimit({ requests = 5, window = "1 m", prefix = "atelier-floral" }: RateLimitOptions = {}): RateLimiter {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (process.env.NODE_ENV === "production") {
      console.error("[rate-limit] Redis no está configurado en producción; rechazando solicitudes protegidas.");
      return createUnavailableRateLimit();
    }

    console.warn("[rate-limit] Redis no está configurado; usando rate limiting local en memoria.");
    return createMemoryRateLimit({ requests, window, prefix });
  }

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix,
  });
}
