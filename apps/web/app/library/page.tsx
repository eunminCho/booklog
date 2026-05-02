import { BookStatus } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container, Inline, Page, Stack, Surface } from "@/components/ui/layout";
import { Heading, Text } from "@/components/ui/text";
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
    <Page>
      <Container>
        <Stack gap={24}>
          <Surface as="header">
            <Heading level={1}>내 서재</Heading>
            <Text size="sm" tone="secondary" style={{ marginTop: 6 }}>
              로그인된 계정: {user.email}
            </Text>
            <div style={{ marginTop: 16 }}>
              <LibraryTabs currentTab={tab} />
            </div>
            <LibraryHeaderActions />
          </Surface>

          <Stack gap={12}>
            {books.length === 0 ? (
              <Surface style={{ textAlign: "center", padding: 32 }}>
                <Text size="sm" tone="secondary">조건에 맞는 책이 없습니다.</Text>
              </Surface>
            ) : (
              books.map((book) => (
                <Link
                  key={book.id}
                  href={`/library/${book.id}`}
                  style={{ display: "block" }}
                >
                  <Card>
                    <CardContent style={{ padding: 16 }}>
                      <Inline gap={16} align="flex-start" justify="space-between">
                        <div>
                          <Text as="p" size="lg" weight={700}>{book.title}</Text>
                          <Text as="p" size="sm" tone="secondary" style={{ marginTop: 6 }}>
                            {book.authors.length > 0 ? book.authors.join(", ") : "저자 정보 없음"}
                          </Text>
                          <Text as="p" size="xs" tone="muted" style={{ marginTop: 8 }}>
                            노트 {book._count.notes}개
                          </Text>
                        </div>
                        <Badge variant="secondary">{book.status}</Badge>
                      </Inline>
                    </CardContent>
                  </Card>
                </Link>
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
                  <ButtonLink href={`/library?tab=${tab}&page=${page - 1}`} variant="outline" size="sm">
                    이전
                  </ButtonLink>
                ) : (
                  <span style={disabledNavStyle}>이전</span>
                )}
                {hasNext ? (
                  <ButtonLink href={`/library?tab=${tab}&page=${page + 1}`} variant="outline" size="sm">
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
      <MobileLibrarySearchFab />
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
