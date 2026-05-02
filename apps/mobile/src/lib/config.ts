const WEB_BASE_URL_BY_ENV = {
  development: "https://booklog-web-fovj.vercel.app",
  production: "https://booklog-web-fovj.vercel.app",
} as const;

function normalizeWebBaseUrl(value: string): string {
  return value.replace(/\/$/, "");
}

function assertValidWebBaseUrl(value: string): string {
  if (value.trim().length === 0) {
    throw new Error("webBaseUrl is required.");
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`Invalid webBaseUrl: ${value}`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`webBaseUrl must use http or https: ${value}`);
  }

  if (!__DEV__ && parsed.protocol !== "https:") {
    throw new Error(`Production webBaseUrl must use https: ${value}`);
  }

  return normalizeWebBaseUrl(parsed.toString());
}

export function getWebBaseUrl(): string {
  const candidate = __DEV__
    ? WEB_BASE_URL_BY_ENV.development
    : WEB_BASE_URL_BY_ENV.production;
  return assertValidWebBaseUrl(candidate);
}

export function getWebOrigin(): string {
  return new URL(getWebBaseUrl()).origin;
}

export function buildWebUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getWebBaseUrl()}${normalizedPath}`;
}
