import { BookStatus } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LibraryHeaderActions } from "@/src/components/library/library-header-actions";
import { MobileLibrarySearchFab } from "@/src/components/library/mobile-library-search-fab";
import { LibraryTabs } from "@/src/components/library/library-tabs";
import { getCurrentUser } from "@/src/lib/auth/current-user";
import { db } from "@/src/lib/db";

const PAGE_SIZE = 25;

type TabKey = "all" | "reading" | "done" | "wishlist";

type LibraryPageProps = {
  searchParams: Promise<{
    tab?: string;
    page?: string;
  }>;
};

function parseTab(input: string | undefined): TabKey {
  if (input === "reading" || input === "done" || input === "wishlist" || input === "all") {
    return input;
  }

  return "all";
}

function parsePage(input: string | undefined): number {
  const page = Number.parseInt(input ?? "1", 10);
  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return page;
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const tab = parseTab(params.tab);
  const page = parsePage(params.page);
  const skip = (page - 1) * PAGE_SIZE;
  const status =
    tab === "reading"
      ? BookStatus.READING
      : tab === "done"
        ? BookStatus.DONE
        : tab === "wishlist"
          ? BookStatus.WISHLIST
          : undefined;

  const where = {
    userId: user.id,
    ...(status ? { status } : {}),
  };

  const [totalCount, books] = await Promise.all([
    db.book.count({ where }),
    db.book.findMany({
      where,
      orderBy: { addedAt: "desc" },
      take: PAGE_SIZE,
      skip,
      include: {
        _count: {
          select: {
            notes: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">내 서재</h1>
          <p className="mt-1 text-sm text-zinc-700">로그인된 계정: {user.email}</p>
          <div className="mt-4">
            <LibraryTabs currentTab={tab} />
          </div>
          <LibraryHeaderActions />
        </header>

        <section className="space-y-3">
          {books.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-600 shadow-sm">
              조건에 맞는 책이 없습니다.
            </div>
          ) : (
            books.map((book) => (
              <Link
                key={book.id}
                href={`/library/${book.id}`}
                className="block"
              >
                <Card className="transition hover:border-zinc-300">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold">{book.title}</p>
                        <p className="mt-1 text-sm text-zinc-600">
                          {book.authors.length > 0 ? book.authors.join(", ") : "저자 정보 없음"}
                        </p>
                        <p className="mt-2 text-xs text-zinc-500">노트 {book._count.notes}개</p>
                      </div>
                      <Badge variant="secondary">{book.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </section>

        <footer className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 text-sm shadow-sm">
          <span>
            {page} / {totalPages} 페이지
          </span>
          <div className="flex gap-2">
            {hasPrev ? (
              <Link
                href={`/library?tab=${tab}&page=${page - 1}`}
                className="rounded-md border border-zinc-300 px-3 py-1.5"
              >
                이전
              </Link>
            ) : (
              <span className="rounded-md border border-zinc-200 px-3 py-1.5 text-zinc-400">이전</span>
            )}
            {hasNext ? (
              <Link
                href={`/library?tab=${tab}&page=${page + 1}`}
                className="rounded-md border border-zinc-300 px-3 py-1.5"
              >
                다음
              </Link>
            ) : (
              <span className="rounded-md border border-zinc-200 px-3 py-1.5 text-zinc-400">다음</span>
            )}
          </div>
        </footer>
      </div>
      <MobileLibrarySearchFab />
    </main>
  );
}
