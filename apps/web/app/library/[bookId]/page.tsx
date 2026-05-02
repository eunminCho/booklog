import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container, Inline, Page, Stack, Surface } from "@/components/ui/layout";
import { Heading, Text } from "@/components/ui/text";
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
    <Page style={{ paddingTop: 80, paddingBottom: 40 }}>
      <FixedBackIconHeader href="/library" ariaLabel="서재로 돌아가기" />
      <Container>
        <Stack gap={24}>
          <Surface>
            <Heading level={1}>{book.title}</Heading>
            <Text size="sm" tone="secondary" style={{ marginTop: 6 }}>
            {book.authors.length > 0 ? book.authors.join(", ") : "저자 정보 없음"}
            </Text>
            <Inline gap={12} align="flex-end" wrap style={{ marginTop: 12 }}>
              <BookStatusSelect bookId={book.id} initialStatus={book.status} />
              {book.isbn ? <Badge variant="secondary">ISBN {book.isbn}</Badge> : null}
            </Inline>
          </Surface>

          <NoteForm bookId={book.id} />

          <Stack gap={12}>
            <Heading level={2}>노트</Heading>
            {notes.length === 0 ? (
              <Surface style={{ padding: 24 }}>
                <Text size="sm" tone="secondary">아직 작성된 노트가 없습니다.</Text>
              </Surface>
            ) : (
              notes.map((note) => (
                <Card key={note.id}>
                  <CardContent style={{ padding: 16 }}>
                    <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>{note.content}</Text>
                    <Text size="xs" tone="muted" style={{ marginTop: 8 }}>
                      {note.createdAt.toLocaleString()}
                    </Text>
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>

          <Surface as="footer" style={{ padding: 16 }}>
            <Inline justify="space-between">
              <Text as="span" size="sm">
                {page} / {totalPages} 페이지
              </Text>
              <Inline gap={8}>
                {hasPrev ? (
                  <ButtonLink href={`/library/${book.id}?page=${page - 1}`} variant="outline" size="sm">
                    이전
                  </ButtonLink>
                ) : (
                  <span style={disabledNavStyle}>이전</span>
                )}
                {hasNext ? (
                  <ButtonLink href={`/library/${book.id}?page=${page + 1}`} variant="outline" size="sm">
                    다음
                  </ButtonLink>
                ) : (
                  <span style={disabledNavStyle}>다음</span>
                )}
              </Inline>
            </Inline>
          </Surface>
        </Stack>
      </Container>
    </Page>
  );
}

const disabledNavStyle = {
  borderRadius: 8,
  border: "1px solid #d4d4d8",
  color: "#6b7280",
  padding: "6px 12px",
  fontSize: "0.875rem",
};
