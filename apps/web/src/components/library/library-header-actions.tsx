"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
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
    <div className="mt-4 flex gap-3">
      <Button asChild>
        <Link href="/search">책 검색</Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/logout">로그아웃</Link>
      </Button>
    </div>
  );
}
