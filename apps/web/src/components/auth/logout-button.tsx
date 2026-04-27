"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BRIDGE_VERSION, postToNative } from "@booklog/bridge";

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

export function LogoutButton() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout(): Promise<void> {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as ApiErrorResponse | null;
        setErrorMessage(data?.error?.message ?? "로그아웃에 실패했습니다.");
        return;
      }

      postToNative({
        v: BRIDGE_VERSION,
        type: "REQUEST_LOGOUT",
      });
      router.replace("/login");
      router.refresh();
    } catch {
      setErrorMessage("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      {errorMessage ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}
      <button
        type="button"
        onClick={handleLogout}
        disabled={isSubmitting}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmitting ? "처리 중..." : "로그아웃"}
      </button>
    </div>
  );
}
