"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SearchLoadingCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontSize: "1.125rem" }}>검색 결과 준비 중</CardTitle>
        <CardDescription>외부 API 응답을 기다리고 있습니다.</CardDescription>
      </CardHeader>
      <CardContent style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton style={{ height: 16, width: "50%" }} />
        <Skeleton style={{ height: 16, width: "66%" }} />
        <Skeleton style={{ height: 36, width: 112 }} />
      </CardContent>
    </Card>
  );
}
