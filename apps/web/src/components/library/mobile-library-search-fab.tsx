"use client";

import styled from "@emotion/styled";

import { ButtonLink } from "@/components/ui/button";
import { useIsNativeWebView } from "@/src/hooks/useIsNativeWebView";
import { Icon } from "../Icon/Icon";

export function MobileLibrarySearchFab() {
  const isNativeWebView = useIsNativeWebView();

  if (isNativeWebView === null) {
    return null;
  }

  if (!isNativeWebView) {
    return null;
  }

  return (
    <FabWrap>
      <ButtonLink href="/search" aria-label="책 검색" style={fabButtonStyle}>
        <Icon name="search" size={24} />
      </ButtonLink>
    </FabWrap>
  );
}

const FabWrap = styled.div({
  position: "fixed",
  insetInline: 0,
  bottom: 24,
  zIndex: 30,
  display: "flex",
  justifyContent: "center",
  paddingInline: 24,
  pointerEvents: "none",
});

const fabButtonStyle = {
  pointerEvents: "auto" as const,
  width: 56,
  height: 56,
  borderRadius: 999,
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.18)",
  padding: 0,
};
