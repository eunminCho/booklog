import {
  NetworkError,
  NotFoundError,
  RateLimitError,
  UpstreamError,
} from "@/src/lib/google-books";

export type ApiErrorCode =
  | "INVALID_INPUT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "BOOK_NOT_FOUND"
  | "NOTE_NOT_FOUND"
  | "RATE_LIMITED"
  | "EXTERNAL_OFFLINE"
  | "EXTERNAL_RATE_LIMITED"
  | "EXTERNAL_UPSTREAM"
  | "EXTERNAL_NOT_FOUND"
  | "INTERNAL_SERVER_ERROR";

type ErrorBody = {
  error: {
    code: ApiErrorCode;
    message: string;
  };
};

type JsonErrorOptions = {
  headers?: HeadersInit;
  retryAfterSec?: number;
};

export function jsonError(
  status: number,
  code: ApiErrorCode,
  message: string,
  options?: JsonErrorOptions,
): Response {
  const headers = new Headers(options?.headers);
  if (options?.retryAfterSec) {
    headers.set("Retry-After", String(options.retryAfterSec));
  }

  return Response.json(
    {
      error: {
        code,
        message,
      },
    } satisfies ErrorBody,
    { status, headers },
  );
}

export function externalApiErrorToResponse(error: unknown): Response {
  if (error instanceof RateLimitError) {
    return jsonError(429, "EXTERNAL_RATE_LIMITED", "외부 API 요청이 많습니다. 잠시 후 다시 시도해 주세요.", {
      retryAfterSec: error.retryAfterSec,
    });
  }

  if (error instanceof NetworkError) {
    return jsonError(503, "EXTERNAL_OFFLINE", "네트워크 연결을 확인하고 다시 시도해 주세요.");
  }

  if (error instanceof UpstreamError) {
    return jsonError(
      502,
      "EXTERNAL_UPSTREAM",
      "외부 서비스 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    );
  }

  if (error instanceof NotFoundError) {
    return jsonError(404, "EXTERNAL_NOT_FOUND", "요청한 책 정보를 찾지 못했습니다.");
  }

  return jsonError(500, "INTERNAL_SERVER_ERROR", "서버 오류가 발생했습니다.");
}

export function parseRetryAfterSec(response: Response): number | undefined {
  const retryAfter = response.headers.get("retry-after");
  if (!retryAfter) {
    return undefined;
  }

  const asInt = Number.parseInt(retryAfter, 10);
  if (Number.isFinite(asInt) && asInt > 0) {
    return asInt;
  }

  return undefined;
}
