import { clearSessionCookie } from "@/src/lib/auth/cookie";

export async function POST(): Promise<Response> {
  await clearSessionCookie();
  return Response.json({ ok: true });
}
