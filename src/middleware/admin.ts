import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { env } from "../env";
import { HTTPException } from "hono/http-exception";

export async function requireAdmin(c: Context, next: Next) {
  const token = getCookie(c, "admin_session");

  if (!token) {
    return c.redirect("/admin/login");
  }

  // simple session check: cookie must equal '1' (set on successful login)
  if (token !== "1") {
    throw new HTTPException(401, { message: "Admin authentication required" });
  }

  // expose admin username for views if needed
  c.set("admin_username", env.ADMIN_USERNAME);

  await next();
}

export function checkAdminCredentials(username: string, password: string) {
  return (
    username === (env.ADMIN_USERNAME ?? "admin") &&
    password === (env.ADMIN_PASSWORD ?? "test")
  );
}
