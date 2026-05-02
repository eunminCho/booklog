"use client";

import styled from "@emotion/styled";

import { Button } from "@/components/ui/button";
import { Stack } from "@/components/ui/layout";
import { Heading, Text } from "@/components/ui/text";

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
    <ErrorSurface role="alert">
      <Stack gap={10} style={{ alignItems: "center" }}>
        <Icon aria-hidden>{config.icon}</Icon>
        <Heading level={3}>{config.title}</Heading>
        <Text size="sm" tone="secondary" style={{ textAlign: "center" }}>
          {config.description}
        </Text>
      </Stack>
      {state === "rateLimit" && retryAfterSec ? (
        <Text size="xs" tone="muted" style={{ textAlign: "center", marginTop: 8 }}>
          약 {retryAfterSec}초 후 재시도할 수 있습니다.
        </Text>
      ) : null}
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry} style={{ marginTop: 16 }}>
          다시 시도
        </Button>
      ) : null}
    </ErrorSurface>
  );
}

export type { ExternalApiState };

const ErrorSurface = styled.div(({ theme }) => ({
  borderRadius: theme.radius.lg,
  border: `1px solid ${theme.colors.border.subtle}`,
  backgroundColor: theme.colors.surface.default,
  boxShadow: theme.shadow.sm,
  padding: "40px 24px",
  textAlign: "center",
}));

const Icon = styled.span({
  fontSize: "1.6rem",
  lineHeight: 1,
});
