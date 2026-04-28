import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalApiError, type ExternalApiState } from "@/src/components/errors/ExternalApiError";
import { AddToLibraryButton } from "@/src/components/library/add-to-library-button";
import { getCurrentUser } from "@/src/lib/auth/current-user";
import { NetworkError, RateLimitError, UpstreamError, getBookByIsbn } from "@/src/lib/google-books";

type BooksAddPageProps = {
  searchParams: Promise<{
    isbn?: string;
  }>;
};

export default async function BooksAddPage({ searchParams }: BooksAddPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const isbn = params.isbn?.trim();
  let state: ExternalApiState | null = null;
  let retryAfterSec: number | undefined;
  let book:
    | {
        isbn: string | null;
        title: string;
        authors: string[];
        thumbnail: string | null;
      }
    | null = null;

  if (isbn) {
    if (!/^\d{13}$/.test(isbn)) {
      state = "notFound";
    } else {
      try {
        book = await getBookByIsbn(isbn);
        if (!book) {
          state = "notFound";
        }
      } catch (error) {
        if (error instanceof RateLimitError) {
          state = "rateLimit";
          retryAfterSec = error.retryAfterSec;
        } else if (error instanceof NetworkError) {
          state = "offline";
        } else if (error instanceof UpstreamError) {
          state = "upstream";
        } else {
          state = "upstream";
        }
      }
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div>
          <Button asChild variant="outline" size="sm">
            <Link href="/search">검색으로 돌아가기</Link>
          </Button>
        </div>
        {isbn && book ? (
          <Card>
            <CardHeader>
              <CardTitle>이 책을 내 서재에 추가할까요?</CardTitle>
              <p className="text-sm text-zinc-700">
                {book.title} {book.authors.length > 0 ? `· ${book.authors.join(", ")}` : ""}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-zinc-600">ISBN {isbn}</p>
              <AddToLibraryButton book={book} label="내 서재에 추가" />
            </CardContent>
          </Card>
        ) : null}
        {isbn && !book ? (
          <div className="space-y-3">
            <ExternalApiError state={state ?? "notFound"} retryAfterSec={retryAfterSec} />
            <Button asChild variant="outline" size="sm">
              <Link href="/search">제목으로 검색</Link>
            </Button>
          </div>
        ) : null}
        {!isbn ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">ISBN이 필요합니다</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600">`/books/add?isbn=...` 형식으로 접근해 주세요.</CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
