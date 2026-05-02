import { redirect } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container, Page, Stack } from "@/components/ui/layout";
import { Text } from "@/components/ui/text";
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
    <Page>
      <Container>
        <Stack gap={24}>
          <div>
            <ButtonLink href="/search" variant="outline" size="sm">
              검색으로 돌아가기
            </ButtonLink>
          </div>
        {isbn && book ? (
          <Card>
            <CardHeader>
              <CardTitle>이 책을 내 서재에 추가할까요?</CardTitle>
              <Text size="sm" tone="secondary">
                {book.title} {book.authors.length > 0 ? `· ${book.authors.join(", ")}` : ""}
              </Text>
            </CardHeader>
            <CardContent style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Text size="sm" tone="secondary">ISBN {isbn}</Text>
              <AddToLibraryButton book={book} label="내 서재에 추가" />
            </CardContent>
          </Card>
        ) : null}
        {isbn && !book ? (
          <Stack gap={12}>
            <ExternalApiError state={state ?? "notFound"} retryAfterSec={retryAfterSec} />
            <ButtonLink href="/search" variant="outline" size="sm">
              제목으로 검색
            </ButtonLink>
          </Stack>
        ) : null}
        {!isbn ? (
          <Card>
            <CardHeader>
              <CardTitle style={{ fontSize: "1.25rem" }}>ISBN이 필요합니다</CardTitle>
            </CardHeader>
            <CardContent>
              <Text size="sm" tone="secondary">`/books/add?isbn=...` 형식으로 접근해 주세요.</Text>
            </CardContent>
          </Card>
        ) : null}
        </Stack>
      </Container>
    </Page>
  );
}
