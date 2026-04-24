import { z } from "zod";

import { externalApiErrorToResponse, jsonError } from "@/src/lib/api-error";
import { getBookByIsbn } from "@/src/lib/google-books";

const isbnSchema = z.object({
  isbn: z.string().trim().min(10).max(20),
});

type RouteParams = {
  params: Promise<{
    isbn: string;
  }>;
};

export async function GET(_request: Request, context: RouteParams): Promise<Response> {
  const { isbn } = await context.params;
  const parsed = isbnSchema.safeParse({ isbn });
  if (!parsed.success) {
    return jsonError(400, "INVALID_INPUT", "ISBN 형식을 확인해 주세요.");
  }

  try {
    const book = await getBookByIsbn(parsed.data.isbn);
    if (!book) {
      return jsonError(404, "EXTERNAL_NOT_FOUND", "해당 ISBN의 책을 찾지 못했습니다.");
    }

    return Response.json({ ok: true, book });
  } catch (error) {
    return externalApiErrorToResponse(error);
  }
}
