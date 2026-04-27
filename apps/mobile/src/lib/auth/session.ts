export type SessionState = {
  token: string;
  userId: string;
};

function decodeBase64Url(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded =
    padding === 0 ? normalized : `${normalized}${"=".repeat(4 - padding)}`;

  if (typeof globalThis.atob === "function") {
    return globalThis.atob(padded);
  }

  throw new Error("Base64 decoder is unavailable");
}

export function getUserIdFromSessionToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const payloadRaw = decodeBase64Url(parts[1] ?? "");
    const payload = JSON.parse(payloadRaw) as { sub?: unknown };
    if (typeof payload.sub === "string" && payload.sub.length > 0) {
      return payload.sub;
    }

    return null;
  } catch {
    return null;
  }
}

export function toSessionState(token: string): SessionState | null {
  const userId = getUserIdFromSessionToken(token);
  if (!userId) {
    return null;
  }

  return { token, userId };
}
