import { z } from "zod";

import { externalApiErrorToResponse, jsonError } from "@/src/lib/api-error";
import { requireUser } from "@/src/lib/auth/require-user";
import { db } from "@/src/lib/db";
import { searchBooks } from "@/src/lib/google-books";

const searchSchema = z.object({
  q: z.string().trim().min(1).max(200),
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export async function GET(request: Request): Promise<Response> {
  const user = await requireUser();
  if (user instanceof Response) {
    return user;
  }

  const url = new URL(request.url);
  const parsed = searchSchema.safeParse({
    q: url.searchParams.get("q") ?? "",
    offset: url.searchParams.get("offset") ?? "0",
    limit: url.searchParams.get("limit") ?? "10",
  });

  if (!parsed.success) {
    return jsonError(400, "INVALID_INPUT", "검색어를 확인해 주세요.");
  }

  try {
    const { books, hasMore, nextOffset } = await searchBooks(parsed.data.q, {
      offset: parsed.data.offset,
      limit: parsed.data.limit,
    });
    const isbns = books
      .map((book) => book.isbn)
      .filter((isbn): isbn is string => Boolean(isbn));

    const existingBooks =
      isbns.length > 0
        ? await db.book.findMany({
            where: {
              userId: user.id,
              isbn: { in: isbns },
            },
            select: {
              id: true,
              isbn: true,
            },
          })
        : [];

    const isbnToLibraryBookId = new Map(
      existingBooks
        .filter((book) => Boolean(book.isbn))
        .map((book) => [book.isbn as string, book.id]),
    );

    return Response.json({
      ok: true,
      hasMore,
      nextOffset,
      books: books.map((book) => ({
        ...book,
        libraryBookId: book.isbn ? (isbnToLibraryBookId.get(book.isbn) ?? null) : null,
      })),
    });
  } catch (error) {
    return externalApiErrorToResponse(error);
  }
}
