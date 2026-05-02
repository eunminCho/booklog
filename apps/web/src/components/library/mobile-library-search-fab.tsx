"use client";

import styled from "@emotion/styled";

import { ButtonLink } from "@/components/ui/button";
import { useIsNativeWebView } from "@/src/hooks/useIsNativeWebView";

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
        <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2.625C4.13604 2.625 2.625 4.13604 2.625 6H3.375C3.375 4.55025 4.55025 3.375 6 3.375V2.625Z" fill="currentColor" />
          <path fillRule="evenodd" clipRule="evenodd" d="M0 6.5C0 2.91015 2.91015 0 6.5 0C10.0899 0 13 2.91015 13 6.5C13 8.13558 12.3959 9.63006 11.3987 10.7725C11.4736 10.7958 11.5442 10.8371 11.6036 10.8964L15 14.2929C15.1953 14.4882 15.1953 14.8047 15 15C14.8047 15.1953 14.4882 15.1953 14.2929 15L10.8964 11.6036C10.8371 11.5442 10.7958 11.4736 10.7725 11.3987C9.63006 12.3959 8.13558 13 6.5 13C2.91015 13 0 10.0899 0 6.5ZM6.5 1C3.46243 1 1 3.46243 1 6.5C1 9.53757 3.46243 12 6.5 12C9.53757 12 12 9.53757 12 6.5C12 3.46243 9.53757 1 6.5 1Z" fill="currentColor" />
        </svg>
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
