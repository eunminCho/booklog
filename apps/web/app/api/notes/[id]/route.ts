import { z } from "zod";

import { jsonError } from "@/src/lib/api-error";
import { requireUser } from "@/src/lib/auth/require-user";
import { db } from "@/src/lib/db";

const updateNoteSchema = z.object({
  content: z.string().trim().min(1).max(5000),
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
    const parsed = updateNoteSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "INVALID_INPUT", "노트 내용을 확인해 주세요.");
    }

    const note = await db.note.findFirst({
      where: {
        id,
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!note) {
      return jsonError(404, "NOTE_NOT_FOUND", "노트를 찾지 못했습니다.");
    }

    const updatedNote = await db.note.update({
      where: { id },
      data: {
        content: parsed.data.content,
      },
    });

    return Response.json({ ok: true, note: updatedNote });
  } catch (error) {
    console.error("[notes/update] unexpected error", error);
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
    const note = await db.note.findFirst({
      where: {
        id,
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!note) {
      return jsonError(404, "NOTE_NOT_FOUND", "노트를 찾지 못했습니다.");
    }

    await db.note.delete({
      where: { id },
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("[notes/delete] unexpected error", error);
    return jsonError(500, "INTERNAL_SERVER_ERROR", "서버 오류가 발생했습니다.");
  }
}
