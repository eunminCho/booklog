import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/src/lib/auth/current-user";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">홈</h1>
        <p className="mt-2 text-sm text-zinc-700">{user.email} 계정으로 로그인되어 있습니다.</p>
        <div className="mt-6 flex gap-3">
          <Button asChild>
            <Link href="/library">서재로 이동</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/logout">로그아웃</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
