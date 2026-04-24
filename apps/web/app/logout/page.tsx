import { LogoutButton } from "@/src/components/auth/logout-button";

export default function LogoutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-12">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">로그아웃</h1>
        <p className="text-sm text-zinc-600">현재 세션을 종료합니다.</p>
      </div>
      <LogoutButton />
    </main>
  );
}
