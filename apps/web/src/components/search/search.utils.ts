import type { ExternalApiState } from "@/src/components/errors/ExternalApiError";

import type { BookSummary } from "./search.types";

const ERROR_CODE_STATE_MAP: Record<string, ExternalApiState> = {
  EXTERNAL_RATE_LIMITED: "rateLimit",
  EXTERNAL_UPSTREAM: "upstream",
  EXTERNAL_NOT_FOUND: "notFound",
  EXTERNAL_OFFLINE: "offline",
};

const MOCK_STATE_MAP: Record<string, ExternalApiState> = {
  loading: "loading",
  empty: "empty",
  offline: "offline",
  rateLimit: "rateLimit",
  upstream: "upstream",
  notFound: "notFound",
};

export function mapErrorCodeToState(code: string | undefined): ExternalApiState {
  if (!code) {
    return "upstream";
  }
  return ERROR_CODE_STATE_MAP[code] ?? "upstream";
}

export function mapMockToState(mock: string | undefined): ExternalApiState | null {
  if (!mock) {
    return null;
  }
  return MOCK_STATE_MAP[mock] ?? null;
}

export function getBookKey(book: BookSummary): string {
  return [book.isbn ?? "no-isbn", book.title.trim(), book.authors.join("|").trim()].join("::");
}
