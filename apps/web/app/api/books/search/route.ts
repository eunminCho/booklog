import { z } from "zod";

import { externalApiErrorToResponse, jsonError } from "@/src/lib/api-error";
import { searchBooks } from "@/src/lib/google-books";

const searchSchema = z.object({
  q: z.string().trim().min(1).max(200),
});

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const parsed = searchSchema.safeParse({
    q: url.searchParams.get("q") ?? "",
  });

  if (!parsed.success) {
    return jsonError(400, "INVALID_INPUT", "검색어를 확인해 주세요.");
  }

  try {
    const books = await searchBooks(parsed.data.q);
    return Response.json({ ok: true, books });
  } catch (error) {
    return externalApiErrorToResponse(error);
  }
}
