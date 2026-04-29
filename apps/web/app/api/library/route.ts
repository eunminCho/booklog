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
