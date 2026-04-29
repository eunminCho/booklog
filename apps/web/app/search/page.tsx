import { redirect } from "next/navigation";

import { FixedBackIconHeader } from "@/src/components/navigation/fixed-back-icon-header";
import { SearchPageClient } from "@/src/components/search/search-page-client";
import { getCurrentUser } from "@/src/lib/auth/current-user";

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
    <main className="min-h-screen bg-zinc-50 px-6 pb-10 pt-20">
      <FixedBackIconHeader href="/library" ariaLabel="서재로 돌아가기" />
      <SearchPageClient initialQuery={initialQuery} initialMock={initialMock} />
    </main>
  );
}
