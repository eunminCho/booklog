import { BookStatus } from "@prisma/client";
import { redirect } from "next/navigation";

import { Container, Page, Stack, Surface } from "@/components/ui/layout";
import { Heading, Text } from "@/components/ui/text";
import { LibraryHeaderActions } from "@/src/components/library/library-header-actions";
import { LibraryInfiniteList } from "@/src/components/library/library-infinite-list";
import { MobileLibrarySearchFab } from "@/src/components/library/mobile-library-search-fab";
import { LibraryTabs } from "@/src/components/library/library-tabs";
import { getCurrentUser } from "@/src/lib/auth/current-user";
import { db } from "@/src/lib/db";

const PAGE_SIZE = 10;

type TabKey = "all" | "reading" | "done" | "wishlist";

type LibraryPageProps = {
  searchParams: Promise<{
    tab?: string;
  }>;
};

function parseTab(input: string | undefined): TabKey {
  if (input === "reading" || input === "done" || input === "wishlist" || input === "all") {
    return input;
  }

  return "all";
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const tab = parseTab(params.tab);
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

  const books = await db.book.findMany({
    where,
    orderBy: { addedAt: "desc" },
    take: PAGE_SIZE + 1,
    include: {
      _count: {
        select: {
          notes: true,
        },
      },
    },
  });
  const initialHasMore = books.length > PAGE_SIZE;
  const initialBooks = initialHasMore ? books.slice(0, PAGE_SIZE) : books;

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

          <LibraryInfiniteList
            tab={tab}
            initialBooks={initialBooks}
            initialHasMore={initialHasMore}
            pageSize={PAGE_SIZE}
          />
        </Stack>
      </Container>
      <MobileLibrarySearchFab />
    </Page>
  );
}
