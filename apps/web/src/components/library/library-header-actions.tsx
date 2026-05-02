"use client";

import { ButtonLink } from "@/components/ui/button";
import { Inline } from "@/components/ui/layout";
import { useIsNativeWebView } from "@/src/hooks/useIsNativeWebView";

export function LibraryHeaderActions() {
  const isNativeWebView = useIsNativeWebView();

  if (isNativeWebView === null) {
    return null;
  }

  if (isNativeWebView) {
    return null;
  }

  return (
    <Inline gap={12} style={{ marginTop: 16 }}>
      <ButtonLink href="/search">책 검색</ButtonLink>
      <ButtonLink href="/logout" variant="outline">
        로그아웃
      </ButtonLink>
    </Inline>
  );
}
