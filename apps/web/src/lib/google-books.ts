const GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1/volumes";
const REQUEST_TIMEOUT_MS = 5000;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 300;

export type BookSummary = {
  isbn: string | null;
  title: string;
  authors: string[];
  thumbnail: string | null;
};

class GoogleBooksError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class NetworkError extends GoogleBooksError {}

export class RateLimitError extends GoogleBooksError {
  retryAfterSec?: number;

  constructor(message: string, retryAfterSec?: number) {
    super(message);
    this.retryAfterSec = retryAfterSec;
  }
}

export class UpstreamError extends GoogleBooksError {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export class NotFoundError extends GoogleBooksError {}

type GoogleBooksResponse = {
  totalItems?: number;
  items?: GoogleBooksItem[];
};

type GoogleBooksItem = {
  volumeInfo?: {
    title?: string;
    authors?: string[];
    industryIdentifiers?: Array<{
      type?: string;
      identifier?: string;
    }>;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
};

function parseRetryAfter(headerValue: string | null): number | undefined {
  if (!headerValue) {
    return undefined;
  }

  const asInt = Number.parseInt(headerValue, 10);
  if (Number.isFinite(asInt) && asInt > 0) {
    return asInt;
  }

  const asDate = Date.parse(headerValue);
  if (Number.isNaN(asDate)) {
    return undefined;
  }

  const sec = Math.ceil((asDate - Date.now()) / 1000);
  return sec > 0 ? sec : undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function resolveIsbn(item: GoogleBooksItem): string | null {
  const identifiers = item.volumeInfo?.industryIdentifiers ?? [];

  const isbn13 = identifiers.find((identifier) => identifier.type === "ISBN_13")?.identifier;
  if (isbn13) {
    return isbn13;
  }

  const isbn10 = identifiers.find((identifier) => identifier.type === "ISBN_10")?.identifier;
  return isbn10 ?? null;
}

function mapItemToSummary(item: GoogleBooksItem): BookSummary | null {
  const title = item.volumeInfo?.title?.trim();
  if (!title) {
    return null;
  }

  return {
    isbn: resolveIsbn(item),
    title,
    authors: item.volumeInfo?.authors?.filter(Boolean) ?? [],
    thumbnail: item.volumeInfo?.imageLinks?.thumbnail ?? item.volumeInfo?.imageLinks?.smallThumbnail ?? null,
  };
}

async function fetchGoogleBooks(url: URL): Promise<GoogleBooksResponse> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
      });

      if (response.status === 429) {
        const retryAfterSec = parseRetryAfter(response.headers.get("retry-after"));
        if (attempt < MAX_RETRIES) {
          const delayMs = retryAfterSec
            ? retryAfterSec * 1000
            : RETRY_BASE_DELAY_MS * 2 ** attempt;
          await sleep(delayMs);
          continue;
        }

        throw new RateLimitError("Google Books rate limit exceeded", retryAfterSec);
      }

      if (response.status >= 500) {
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
          continue;
        }

        throw new UpstreamError("Google Books upstream error", response.status);
      }

      if (response.status === 404) {
        throw new NotFoundError("Google Books resource not found");
      }

      if (!response.ok) {
        throw new UpstreamError("Google Books request failed", response.status);
      }

      const data = (await response.json()) as GoogleBooksResponse;
      return data;
    } catch (error) {
      if (
        error instanceof RateLimitError ||
        error instanceof UpstreamError ||
        error instanceof NotFoundError
      ) {
        throw error;
      }

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
        continue;
      }

      throw new NetworkError("Failed to reach Google Books");
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new UpstreamError("Google Books retry attempts exhausted", 503);
}

type SearchBooksOptions = {
  offset?: number;
  limit?: number;
};

type SearchBooksResult = {
  books: BookSummary[];
  hasMore: boolean;
  nextOffset: number;
};

function buildGoogleBooksUrl(query: string, { offset = 0, limit = 10 }: SearchBooksOptions): URL {
  const url = new URL(GOOGLE_BOOKS_BASE_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("startIndex", String(offset));
  url.searchParams.set("maxResults", String(limit));

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY?.trim();
  if (apiKey) {
    url.searchParams.set("key", apiKey);
  }

  return url;
}

export async function searchBooks(q: string, options: SearchBooksOptions = {}): Promise<SearchBooksResult> {
  const query = q.trim();
  if (!query) {
    return {
      books: [],
      hasMore: false,
      nextOffset: 0,
    };
  }

  const offset = options.offset ?? 0;
  const limit = options.limit ?? 10;
  const data = await fetchGoogleBooks(buildGoogleBooksUrl(query, { offset, limit }));
  const items = data.items ?? [];
  const books = items
    .map(mapItemToSummary)
    .filter((item): item is BookSummary => item !== null);
  const totalItems = data.totalItems ?? 0;

  return {
    books,
    hasMore: offset + items.length < totalItems,
    nextOffset: offset + items.length,
  };
}

export async function getBookByIsbn(isbn: string): Promise<BookSummary | null> {
  const normalizedIsbn = isbn.trim();
  if (!normalizedIsbn) {
    return null;
  }

  const data = await fetchGoogleBooks(buildGoogleBooksUrl(`isbn:${normalizedIsbn}`, { limit: 1 }));
  const first = data.items?.[0];
  if (!first) {
    return null;
  }

  return mapItemToSummary(first);
}
