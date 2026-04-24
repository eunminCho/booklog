import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddByIsbnClient } from "@/src/components/books/add-by-isbn-client";
import { getCurrentUser } from "@/src/lib/auth/current-user";

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

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div>
          <Button asChild variant="outline" size="sm">
            <Link href="/search">검색으로 돌아가기</Link>
          </Button>
        </div>
        {isbn ? (
          <AddByIsbnClient isbn={isbn} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">ISBN이 필요합니다</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600">`/books/add?isbn=...` 형식으로 접근해 주세요.</CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
