import { BookStatus } from "@prisma/client";
import { z } from "zod";

import { jsonError } from "@/src/lib/api-error";
import { requireUser } from "@/src/lib/auth/require-user";
import { db } from "@/src/lib/db";

const updateBookSchema = z
  .object({
    status: z.nativeEnum(BookStatus).optional(),
    rating: z.number().int().min(1).max(5).nullable().optional(),
  })
  .refine((value) => value.status !== undefined || value.rating !== undefined, {
    message: "status 또는 rating 중 하나는 필요합니다.",
  });

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteParams): Promise<Response> {
  const user = await requireUser();
  if (user instanceof Response) {
    return user;
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = updateBookSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "INVALID_INPUT", "변경할 값 형식을 확인해 주세요.");
    }

    const existing = await db.book.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });
    if (!existing) {
      return jsonError(404, "BOOK_NOT_FOUND", "서재에서 책을 찾지 못했습니다.");
    }

    const book = await db.book.update({
      where: { id },
      data: {
        status: parsed.data.status,
        rating: parsed.data.rating,
      },
    });

    return Response.json({ ok: true, book });
  } catch (error) {
    console.error("[library/update] unexpected error", error);
    return jsonError(500, "INTERNAL_SERVER_ERROR", "서버 오류가 발생했습니다.");
  }
}

export async function DELETE(_request: Request, context: RouteParams): Promise<Response> {
  const user = await requireUser();
  if (user instanceof Response) {
    return user;
  }

  const { id } = await context.params;

  try {
    const existing = await db.book.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });
    if (!existing) {
      return jsonError(404, "BOOK_NOT_FOUND", "서재에서 책을 찾지 못했습니다.");
    }

    await db.book.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[library/delete] unexpected error", error);
    return jsonError(500, "INTERNAL_SERVER_ERROR", "서버 오류가 발생했습니다.");
  }
}
