import type { User } from "@prisma/client";

import { jsonError } from "@/src/lib/api-error";
import { getCurrentUser } from "@/src/lib/auth/current-user";

export async function requireUser(): Promise<User | Response> {
  const user = await getCurrentUser();
  if (!user) {
    return jsonError(401, "UNAUTHORIZED", "로그인이 필요합니다.");
  }

  return user;
}
