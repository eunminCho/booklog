type ExternalApiState = "loading" | "empty" | "offline" | "rateLimit" | "upstream" | "notFound";

type ExternalApiErrorProps = {
  state: ExternalApiState;
  onRetry?: () => void;
  retryAfterSec?: number;
};

const stateConfig: Record<
  ExternalApiState,
  {
    icon: string;
    title: string;
    description: string;
  }
> = {
  loading: {
    icon: "⌛",
    title: "검색 중",
    description: "책 정보를 불러오고 있습니다.",
  },
  empty: {
    icon: "📭",
    title: "검색 결과 없음",
    description: "다른 검색어로 다시 시도해 보세요.",
  },
  offline: {
    icon: "📡",
    title: "오프라인 상태",
    description: "인터넷 연결을 확인한 뒤 다시 시도해 주세요.",
  },
  rateLimit: {
    icon: "⏱",
    title: "요청 제한",
    description: "요청이 많아 잠시 대기 후 다시 시도해야 합니다.",
  },
  upstream: {
    icon: "⚠",
    title: "외부 서비스 오류",
    description: "Google Books 응답이 불안정합니다. 잠시 후 다시 시도해 주세요.",
  },
  notFound: {
    icon: "🔎",
    title: "책 정보를 찾지 못함",
    description: "해당 ISBN 또는 검색어로 일치하는 책이 없습니다.",
  },
};

export function ExternalApiError({ state, onRetry, retryAfterSec }: ExternalApiErrorProps) {
  const config = stateConfig[state];

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white px-6 py-10 text-center shadow-sm"
    >
      <span aria-hidden className="text-2xl">
        {config.icon}
      </span>
      <p className="mt-3 text-lg font-semibold">{config.title}</p>
      <p className="mt-1 text-sm text-zinc-600">{config.description}</p>
      {state === "rateLimit" && retryAfterSec ? (
        <p className="mt-2 text-xs text-zinc-500">약 {retryAfterSec}초 후 재시도할 수 있습니다.</p>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md border border-zinc-300 px-4 py-2 text-sm"
        >
          다시 시도
        </button>
      ) : null}
    </div>
  );
}

export type { ExternalApiState };
