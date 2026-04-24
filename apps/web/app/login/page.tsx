import { AuthForm } from "@/src/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-12">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">로그인</h1>
        <p className="text-sm text-zinc-600">이메일과 비밀번호로 로그인해 주세요.</p>
      </div>
      <AuthForm mode="login" />
    </main>
  );
}
