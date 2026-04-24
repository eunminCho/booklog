import { z } from "zod";

import { jsonError } from "@/src/lib/api-error";
import { requireUser } from "@/src/lib/auth/require-user";
import { db } from "@/src/lib/db";

const createNoteSchema = z.object({
  content: z.string().trim().min(1).max(5000),
});

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteParams): Promise<Response> {
  const user = await requireUser();
  if (user instanceof Response) {
    return user;
  }

  const { id: bookId } = await context.params;

  try {
    const body = await request.json();
    const parsed = createNoteSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "INVALID_INPUT", "노트 내용을 확인해 주세요.");
    }

    const book = await db.book.findFirst({
      where: {
        id: bookId,
        userId: user.id,
      },
      select: { id: true },
    });

    if (!book) {
      return jsonError(404, "BOOK_NOT_FOUND", "서재에서 책을 찾지 못했습니다.");
    }

    const note = await db.note.create({
      data: {
        userId: user.id,
        bookId: book.id,
        content: parsed.data.content,
      },
    });

    return Response.json({ ok: true, note }, { status: 201 });
  } catch (error) {
    console.error("[notes/create] unexpected error", error);
    return jsonError(500, "INTERNAL_SERVER_ERROR", "서버 오류가 발생했습니다.");
  }
}
