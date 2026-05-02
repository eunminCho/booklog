import { z } from "zod";

import { setSessionCookie } from "@/src/lib/auth/cookie";
import { verifyPassword } from "@/src/lib/auth/password";
import { loginLimiter } from "@/src/lib/auth/rate-limit";
import { createSession } from "@/src/lib/auth/session";
import { db } from "@/src/lib/db";

const loginSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8).max(72),
});

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function errorResponse(
  status: number,
  code: string,
  message: string,
  headers?: HeadersInit,
): Response {
  return Response.json(
    {
      error: {
        code,
        message,
      },
    },
    { status, headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(400, "INVALID_INPUT", "이메일 또는 비밀번호 형식이 올바르지 않습니다.");
    }

    const { email, password } = parsed.data;
    const ip = getClientIp(request);
    const limitResult = await loginLimiter({ email, ip });

    if (!limitResult.success) {
      return errorResponse(
        429,
        "RATE_LIMITED",
        "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
        { "Retry-After": String(limitResult.retryAfter) },
      );
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return errorResponse(401, "INVALID_CREDENTIALS", "이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return errorResponse(401, "INVALID_CREDENTIALS", "이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return Response.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("[auth/login] unexpected error", error);
    return errorResponse(500, "INTERNAL_SERVER_ERROR", "서버 오류가 발생했습니다.");
  }
}
