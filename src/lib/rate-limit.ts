/**
 * In-memory sliding window rate limiter.
 * No external dependencies required.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });
 *   const result = limiter.check(identifier);
 *   if (!result.allowed) { return 429 response }
 */

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimiterOptions {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum number of requests allowed within the window */
  maxRequests: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number | null;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(name: string): Map<string, RateLimitEntry> {
  if (!stores.has(name)) {
    stores.set(name, new Map());
  }
  return stores.get(name)!;
}

// Clean up expired entries periodically (every 5 minutes)
if (typeof globalThis !== "undefined") {
  const CLEANUP_INTERVAL = 5 * 60 * 1000;

  const globalRef = globalThis as unknown as {
    __rateLimitCleanup?: ReturnType<typeof setInterval>;
  };

  if (!globalRef.__rateLimitCleanup) {
    globalRef.__rateLimitCleanup = setInterval(() => {
      const now = Date.now();
      for (const [, store] of stores) {
        for (const [key, entry] of store) {
          entry.timestamps = entry.timestamps.filter((t) => now - t < 24 * 60 * 60 * 1000);
          if (entry.timestamps.length === 0) {
            store.delete(key);
          }
        }
      }
    }, CLEANUP_INTERVAL);

    // Allow Node.js to exit even if the interval is active
    if (globalRef.__rateLimitCleanup?.unref) {
      globalRef.__rateLimitCleanup.unref();
    }
  }
}

export function createRateLimiter(name: string, options: RateLimiterOptions) {
  const store = getStore(name);

  return {
    check(identifier: string): RateLimitResult {
      const now = Date.now();
      const entry = store.get(identifier) ?? { timestamps: [] };

      // Remove timestamps outside the current window
      entry.timestamps = entry.timestamps.filter(
        (t) => now - t < options.windowMs,
      );

      if (entry.timestamps.length >= options.maxRequests) {
        const oldestInWindow = entry.timestamps[0];
        const retryAfterMs = options.windowMs - (now - oldestInWindow);

        return {
          allowed: false,
          remaining: 0,
          retryAfterMs,
        };
      }

      entry.timestamps.push(now);
      store.set(identifier, entry);

      return {
        allowed: true,
        remaining: options.maxRequests - entry.timestamps.length,
        retryAfterMs: null,
      };
    },

    reset(identifier: string): void {
      store.delete(identifier);
    },
  };
}

// ── Pre-configured limiters ──────────────────────────────────────────

/** AI chat: 50 requests per day per user */
export const aiChatLimiter = createRateLimiter("ai-chat", {
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  maxRequests: 50,
});

/** Progress API: 100 requests per minute per user */
export const progressLimiter = createRateLimiter("progress", {
  windowMs: 60 * 1000,
  maxRequests: 100,
});

/** Admin API: 60 requests per minute per user */
export const adminLimiter = createRateLimiter("admin", {
  windowMs: 60 * 1000,
  maxRequests: 60,
});

/** General API: 120 requests per minute per IP */
export const generalLimiter = createRateLimiter("general", {
  windowMs: 60 * 1000,
  maxRequests: 120,
});
