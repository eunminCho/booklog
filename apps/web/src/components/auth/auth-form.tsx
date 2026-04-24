"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

type ApiErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  };
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";
  const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as ApiErrorResponse | null;
        setErrorMessage(data?.error?.message ?? "요청을 처리하지 못했습니다.");
        return;
      }

      router.replace("/library");
      router.refresh();
    } catch {
      setErrorMessage("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor={`${mode}-email`} className="text-sm font-medium">
          이메일
        </label>
        <input
          id={`${mode}-email`}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none ring-blue-300 focus:ring-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${mode}-password`} className="text-sm font-medium">
          비밀번호
        </label>
        <input
          id={`${mode}-password`}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          autoComplete={isLogin ? "current-password" : "new-password"}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none ring-blue-300 focus:ring-2"
        />
      </div>

      {errorMessage ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmitting ? "처리 중..." : isLogin ? "로그인" : "가입하기"}
      </button>

      <p className="text-sm text-zinc-600">
        {isLogin ? "계정이 없나요?" : "이미 계정이 있나요?"}{" "}
        <Link href={isLogin ? "/signup" : "/login"} className="underline">
          {isLogin ? "회원가입" : "로그인"}
        </Link>
      </p>
    </form>
  );
}
