import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-12">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">BookLog</h1>
        <p className="mt-2 text-sm text-zinc-700">이메일/비밀번호 인증 흐름을 테스트할 수 있습니다.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/signup" className="rounded-md bg-black px-4 py-2 text-sm text-white">
            회원가입
          </Link>
          <Link href="/login" className="rounded-md border border-zinc-300 px-4 py-2 text-sm">
            로그인
          </Link>
          <Link href="/library" className="rounded-md border border-zinc-300 px-4 py-2 text-sm">
            보호 경로 이동
          </Link>
        </div>
      </div>
    </main>
  );
}
