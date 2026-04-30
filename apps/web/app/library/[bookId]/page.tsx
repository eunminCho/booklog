import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookStatusSelect } from "@/src/components/library/book-status-select";
import { NoteForm } from "@/src/components/library/note-form";
import { FixedBackIconHeader } from "@/src/components/navigation/fixed-back-icon-header";
import { getCurrentUser } from "@/src/lib/auth/current-user";
import { db } from "@/src/lib/db";

const PAGE_SIZE = 25;

type LibraryDetailPageProps = {
  params: Promise<{
    bookId: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};

function parsePage(input: string | undefined): number {
  const page = Number.parseInt(input ?? "1", 10);
  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return page;
}

export default async function LibraryDetailPage({ params, searchParams }: LibraryDetailPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { bookId } = await params;
  const query = await searchParams;
  const page = parsePage(query.page);
  const skip = (page - 1) * PAGE_SIZE;

  const book = await db.book.findFirst({
    where: {
      id: bookId,
      userId: user.id,
    },
    include: {
      _count: {
        select: {
          notes: true,
        },
      },
    },
  });

  if (!book) {
    notFound();
  }

  const notes = await db.note.findMany({
    where: {
      userId: user.id,
      bookId: book.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: PAGE_SIZE,
    skip,
  });

  const totalPages = Math.max(1, Math.ceil(book._count.notes / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <main className="min-h-screen bg-zinc-50 px-6 pb-10 pt-20">
      <FixedBackIconHeader href="/library" ariaLabel="서재로 돌아가기" />
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">{book.title}</h1>
          <p className="mt-1 text-sm text-zinc-700">
            {book.authors.length > 0 ? book.authors.join(", ") : "저자 정보 없음"}
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-3 text-xs">
            <BookStatusSelect bookId={book.id} initialStatus={book.status} />
            {book.isbn ? <Badge variant="secondary">ISBN {book.isbn}</Badge> : null}
          </div>
        </section>

        <NoteForm bookId={book.id} />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">노트</h2>
          {notes.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
              아직 작성된 노트가 없습니다.
            </div>
          ) : (
            notes.map((note) => (
              <Card key={note.id}>
                <CardContent className="p-4">
                  <p className="whitespace-pre-wrap text-sm text-zinc-800">{note.content}</p>
                  <p className="mt-2 text-xs text-zinc-500">{note.createdAt.toLocaleString()}</p>
                </CardContent>
              </Card>
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
                href={`/library/${book.id}?page=${page - 1}`}
                className="rounded-md border border-zinc-300 px-3 py-1.5"
              >
                이전
              </Link>
            ) : (
              <span className="rounded-md border border-zinc-200 px-3 py-1.5 text-zinc-400">이전</span>
            )}
            {hasNext ? (
              <Link
                href={`/library/${book.id}?page=${page + 1}`}
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
    </main>
  );
}
