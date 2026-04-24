import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitResult =
  | { success: true }
  | { success: false; retryAfter: number };

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const canUseUpstash = Boolean(upstashUrl && upstashToken);

const redis = canUseUpstash
  ? new Redis({
      url: upstashUrl!,
      token: upstashToken!,
    })
  : null;

const loginRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "5 m"),
      prefix: "booklog:auth:login",
    })
  : null;

const signupRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      prefix: "booklog:auth:signup",
    })
  : null;

let warnedMissingUpstashEnv = false;

function warnNoopRateLimiter(): void {
  if (warnedMissingUpstashEnv) {
    return;
  }

  warnedMissingUpstashEnv = true;
  console.warn(
    "[auth/rate-limit] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is missing. Rate limit runs in no-op mode.",
  );
}

function toRetryAfterSeconds(reset: number): number {
  const seconds = Math.ceil((reset - Date.now()) / 1_000);
  return Number.isFinite(seconds) ? Math.max(1, seconds) : 60;
}

export async function loginLimiter(input: {
  email: string;
  ip: string;
}): Promise<RateLimitResult> {
  if (!loginRateLimiter) {
    warnNoopRateLimiter();
    return { success: true };
  }

  const key = `${input.email.trim().toLowerCase()}:${input.ip}`;
  const result = await loginRateLimiter.limit(key);

  if (result.success) {
    return { success: true };
  }

  return {
    success: false,
    retryAfter: toRetryAfterSeconds(result.reset),
  };
}

export async function signupLimiter(input: { ip: string }): Promise<RateLimitResult> {
  if (!signupRateLimiter) {
    warnNoopRateLimiter();
    return { success: true };
  }

  const result = await signupRateLimiter.limit(input.ip);

  if (result.success) {
    return { success: true };
  }

  return {
    success: false,
    retryAfter: toRetryAfterSeconds(result.reset),
  };
}
