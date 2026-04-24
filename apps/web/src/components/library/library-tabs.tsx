"use client";

import { useRouter } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LibraryTabsProps = {
  currentTab: "all" | "reading" | "done" | "wishlist";
};

const tabs = [
  { value: "all", label: "전체" },
  { value: "reading", label: "읽는중" },
  { value: "done", label: "완독" },
  { value: "wishlist", label: "위시리스트" },
] as const;

export function LibraryTabs({ currentTab }: LibraryTabsProps) {
  const router = useRouter();

  return (
    <Tabs
      value={currentTab}
      onValueChange={(nextTab) => {
        router.push(`/library?tab=${nextTab}&page=1`);
      }}
    >
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
