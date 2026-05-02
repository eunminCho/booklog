import { redirect } from "next/navigation";

import { FixedBackIconHeader } from "@/src/components/navigation/fixed-back-icon-header";
import { SearchPageClient } from "@/src/components/search/search-page-client";
import { getCurrentUser } from "@/src/lib/auth/current-user";
import { Page } from "@/components/ui/layout";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    mock?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const initialQuery = params.q?.trim() ?? "";
  const initialMock = params.mock?.trim();

  return (
    <Page style={{ paddingTop: 80, paddingBottom: 40 }}>
      <FixedBackIconHeader href="/library" ariaLabel="서재로 돌아가기" />
      <SearchPageClient initialQuery={initialQuery} initialMock={initialMock} />
    </Page>
  );
}
