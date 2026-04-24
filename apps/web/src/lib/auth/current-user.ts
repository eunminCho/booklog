import type { User } from "@prisma/client";
import { cookies } from "next/headers";
import { cache } from "react";

import { db } from "@/src/lib/db";
import { SESSION_COOKIE_NAME, verifySession } from "@/src/lib/auth/session";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await verifySession(sessionToken);
  if (!session) {
    return null;
  }

  return db.user.findUnique({
    where: {
      id: session.userId,
    },
  });
});
