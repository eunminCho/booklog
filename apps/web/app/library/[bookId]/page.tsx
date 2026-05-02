import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Container, Inline, Page, Stack, Surface } from "@/components/ui/layout";
import { Heading, Text } from "@/components/ui/text";
import { BookStatusSelect } from "@/src/components/library/book-status-select";
import { NoteForm } from "@/src/components/library/note-form";
import { NoteInfiniteList } from "@/src/components/library/note-infinite-list";
import { FixedBackIconHeader } from "@/src/components/navigation/fixed-back-icon-header";
import { getCurrentUser } from "@/src/lib/auth/current-user";
import { db } from "@/src/lib/db";

const PAGE_SIZE = 10;

type LibraryDetailPageProps = {
  params: Promise<{
    bookId: string;
  }>;
};

export default async function LibraryDetailPage({ params }: LibraryDetailPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { bookId } = await params;

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
    take: PAGE_SIZE + 1,
  });
  const initialHasMore = notes.length > PAGE_SIZE;
  const initialNotes = (initialHasMore ? notes.slice(0, PAGE_SIZE) : notes).map((note) => ({
    id: note.id,
    content: note.content,
    createdAt: note.createdAt.toISOString(),
  }));

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
            <NoteInfiniteList
              bookId={book.id}
              initialNotes={initialNotes}
              initialHasMore={initialHasMore}
              pageSize={PAGE_SIZE}
            />
          </Stack>
        </Stack>
      </Container>
    </Page>
  );
}
