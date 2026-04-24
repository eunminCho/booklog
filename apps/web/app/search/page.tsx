import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
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
    <main className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="mx-auto mb-4 flex w-full max-w-4xl items-center justify-between">
        <Button asChild variant="outline" size="sm">
          <Link href="/library">서재로 이동</Link>
        </Button>
      </div>
      <SearchPageClient initialQuery={initialQuery} initialMock={initialMock} />
    </main>
  );
}
