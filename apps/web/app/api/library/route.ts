import { BookStatus } from "@prisma/client";
import { z } from "zod";

import { jsonError } from "@/src/lib/api-error";
import { requireUser } from "@/src/lib/auth/require-user";
import { db } from "@/src/lib/db";

const createLibraryBookSchema = z.object({
  isbn: z.string().trim().min(10).max(20).nullable().optional(),
  title: z.string().trim().min(1).max(300),
  authors: z.array(z.string().trim().min(1).max(120)).max(20),
  thumbnail: z.string().trim().url().nullable().optional(),
  status: z.nativeEnum(BookStatus).default(BookStatus.WISHLIST),
});

const listLibraryBooksSchema = z.object({
  tab: z.enum(["all", "reading", "done", "wishlist"]).default("all"),
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

function resolveStatus(tab: "all" | "reading" | "done" | "wishlist"): BookStatus | undefined {
  if (tab === "reading") {
    return BookStatus.READING;
  }
  if (tab === "done") {
    return BookStatus.DONE;
  }
  if (tab === "wishlist") {
    return BookStatus.WISHLIST;
  }

  return undefined;
}

export async function GET(request: Request): Promise<Response> {
  const user = await requireUser();
  if (user instanceof Response) {
    return user;
  }

  const url = new URL(request.url);
  const parsed = listLibraryBooksSchema.safeParse({
    tab: url.searchParams.get("tab") ?? "all",
    offset: url.searchParams.get("offset") ?? "0",
    limit: url.searchParams.get("limit") ?? "10",
  });

  if (!parsed.success) {
    return jsonError(400, "INVALID_INPUT", "목록 조회 조건을 확인해 주세요.");
  }

  const status = resolveStatus(parsed.data.tab);
  const where = {
    userId: user.id,
    ...(status ? { status } : {}),
  };

  try {
    const books = await db.book.findMany({
      where,
      orderBy: { addedAt: "desc" },
      skip: parsed.data.offset,
      take: parsed.data.limit + 1,
      include: {
        _count: {
          select: {
            notes: true,
          },
        },
      },
    });

    const hasMore = books.length > parsed.data.limit;
    const items = hasMore ? books.slice(0, parsed.data.limit) : books;

    return Response.json({
      ok: true,
      hasMore,
      nextOffset: parsed.data.offset + items.length,
      books: items,
    });
  } catch (error) {
    console.error("[library/list] unexpected error", error);
    return jsonError(500, "INTERNAL_SERVER_ERROR", "서버 오류가 발생했습니다.");
  }
}

export async function POST(request: Request): Promise<Response> {
  const user = await requireUser();
  if (user instanceof Response) {
    return user;
  }

  try {
    const body = await request.json();
    const parsed = createLibraryBookSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(400, "INVALID_INPUT", "책 정보 형식을 확인해 주세요.");
    }

    const { isbn, title, authors, thumbnail, status } = parsed.data;

    if (isbn) {
      const exists = await db.book.findFirst({
        where: {
          userId: user.id,
          isbn,
        },
        select: { id: true },
      });

      if (exists) {
        return Response.json(
          {
            error: {
              code: "FORBIDDEN",
              message: "이미 서재에 추가된 책입니다.",
            },
            bookId: exists.id,
          },
          { status: 409 },
        );
      }
    }

    const book = await db.book.create({
      data: {
        userId: user.id,
        isbn: isbn ?? null,
        title,
        authors,
        thumbnail: thumbnail ?? null,
        status,
      },
    });

    return Response.json({ ok: true, book }, { status: 201 });
  } catch (error) {
    console.error("[library/create] unexpected error", error);
    return jsonError(500, "INTERNAL_SERVER_ERROR", "서버 오류가 발생했습니다.");
  }
}
