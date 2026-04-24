import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/src/lib/auth/current-user";

export default async function LibraryPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-12">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">내 서재</h1>
        <p className="mt-2 text-sm text-zinc-700">
          로그인된 계정: <strong>{user.email}</strong>
        </p>
        <div className="mt-6">
          <Link href="/logout" className="text-sm underline">
            로그아웃 페이지로 이동
          </Link>
        </div>
      </div>
    </main>
  );
}
