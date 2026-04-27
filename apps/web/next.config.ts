import type { NextConfig } from "next";

function toHostname(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

function buildAllowedDevOrigins(): string[] {
  const defaults = ["localhost", "127.0.0.1"];
  const envHosts = [
    toHostname(process.env.EXPO_PUBLIC_API_BASE_URL),
    toHostname(process.env.NEXT_PUBLIC_APP_BASE_URL),
  ].filter((host): host is string => Boolean(host));

  return Array.from(new Set([...defaults, ...envHosts]));
}

const nextConfig: NextConfig = {
  allowedDevOrigins: buildAllowedDevOrigins(),
};

export default nextConfig;
