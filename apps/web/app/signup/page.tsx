import { AuthForm } from "@/src/components/auth/auth-form";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-12">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">회원가입</h1>
        <p className="text-sm text-zinc-600">새 계정을 만든 뒤 바로 사용을 시작하세요.</p>
      </div>
      <AuthForm mode="signup" />
    </main>
  );
}
