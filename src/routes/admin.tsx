import * as Sentry from "@sentry/bun";
import { count, desc, eq, gte, ilike, or } from "drizzle-orm";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { db } from "../db";
import { contentViolations, users } from "../db/schema";
import { env } from "../env";
import {
  clearUserReviewStatus,
  getAllViolations,
  getUserViolationStats,
  getUserViolationsWithLogs,
  recomputeUserCounts,
} from "../lib/review";
import { getGlobalStats } from "../lib/stats";
import { checkAdminCredentials, requireAdmin } from "../middleware/admin";
import {
  AdminLoginView,
  AdminUsersView,
  AdminUserView,
  AdminView,
  AdminViolationsView,
} from "../views/admin";

const admin = new Hono();

type AdminUserSearchResult = {
  id: string;
  email: string | null;
  name: string | null;
  reviewStatus: string;
  violationCountWeek: number;
  violationCountMonth: number;
};

admin.get("/login", async (c) => {
  return c.html(<AdminLoginView error={null} />);
});

admin.post("/login", async (c) => {
  const form = await c.req.formData();
  const username = String(form.get("username") || "");
  const password = String(form.get("password") || "");

  if (!checkAdminCredentials(username, password)) {
    return c.html(<AdminLoginView error={"Invalid credentials"} />);
  }

  setCookie(c, "admin_session", "1", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return c.redirect("/admin");
});

admin.post("/logout", async (c) => {
  setCookie(c, "admin_session", "", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 0,
  });
  return c.redirect("/admin/login");
});

admin.get("/", requireAdmin, async (c) => {
  const stats = await getGlobalStats();

  // fetch moderation stats
  const moderationStats = await Sentry.startSpan(
    { name: "db.select.moderationStats" },
    async () => {
      const [totalViolations] = await db
        .select({ count: count() })
        .from(contentViolations);
      const [activeViolations] = await db
        .select({ count: count() })
        .from(contentViolations)
        .where(eq(contentViolations.dismissed, false));
      const [bannedCount] = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.reviewStatus, "banned"));
      const [flaggedCount] = await db
        .select({ count: count() })
        .from(users)
        .where(
          or(
            eq(users.reviewStatus, "flagged"),
            eq(users.reviewStatus, "strict"),
          ),
        );
      const [totalUsers] = await db.select({ count: count() }).from(users);

      return {
        totalViolations: totalViolations.count,
        activeViolations: activeViolations.count,
        bannedUsers: bannedCount.count,
        flaggedUsers: flaggedCount.count,
        totalUsers: totalUsers.count,
      };
    },
  );

  // fetch banned users
  const banned = await Sentry.startSpan(
    { name: "db.select.bannedUsers" },
    async () =>
      db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          reviewStatus: users.reviewStatus,
          violationCountWeek: users.violationCountWeek,
          violationCountMonth: users.violationCountMonth,
          lastViolationAt: users.lastViolationAt,
        })
        .from(users)
        .where(eq(users.reviewStatus, "banned"))
        .orderBy(desc(users.lastViolationAt))
        .limit(200),
  );

  return c.html(
    <AdminView
      stats={stats}
      moderationStats={moderationStats}
      bannedUsers={banned}
    />,
  );
});

admin.get("/violations", requireAdmin, async (c) => {
  const status = c.req.query("status") || "all";
  let violations = await getAllViolations(500);

  if (status === "active") {
    violations = violations.filter((v) => !v.violation.dismissed);
  } else if (status === "dismissed") {
    violations = violations.filter((v) => v.violation.dismissed);
  }

  return c.html(
    <AdminViolationsView violations={violations} status={status} />,
  );
});

// Mark a violation as dismissed (false positive)
admin.post("/violations/:id/dismiss", requireAdmin, async (c) => {
  const id = c.req.param("id") as string;
  // fetch violation to get userId
  const [v] = await db
    .select()
    .from(contentViolations)
    .where(eq(contentViolations.id, id))
    .limit(1);
  if (!v) return c.text("Violation not found", 404);
  if (v.violationEventId) {
    await db
      .update(contentViolations)
      .set({ dismissed: true })
      .where(eq(contentViolations.violationEventId, v.violationEventId));
  } else {
    await db
      .update(contentViolations)
      .set({ dismissed: true })
      .where(eq(contentViolations.id, id));
  }

  // recompute user counts so dismissals affect review status
  if (v.userId) await recomputeUserCounts(String(v.userId));

  return c.redirect(c.req.header("Referer") || "/admin/violations");
});

admin.post("/users/:id/ban", requireAdmin, async (c) => {
  const id = c.req.param("id") as string;
  await db
    .update(users)
    .set({ isBanned: true, reviewStatus: "banned" })
    .where(eq(users.id, id));
  return c.redirect(c.req.header("Referer") || `/admin/users/${id}`);
});

admin.post("/users/:id/unban", requireAdmin, async (c) => {
  const id = c.req.param("id") as string;
  await clearUserReviewStatus(id);
  await db.update(users).set({ isBanned: false }).where(eq(users.id, id));
  return c.redirect(c.req.header("Referer") || "/admin/violations");
});

admin.get("/users", requireAdmin, async (c) => {
  const q = c.req.query("q") || "";
  const status = c.req.query("status") || "all";

  let results: AdminUserSearchResult[] = [];

  if (q) {
    const like = `%${q}%`;
    results = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        reviewStatus: users.reviewStatus,
        violationCountWeek: users.violationCountWeek,
        violationCountMonth: users.violationCountMonth,
      })
      .from(users)
      .where(
        or(
          ilike(users.email, like),
          ilike(users.name, like),
          ilike(users.slackId, like),
        ),
      )
      .orderBy(desc(users.createdAt))
      .limit(200);
  } else if (status !== "all") {
    results = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        reviewStatus: users.reviewStatus,
        violationCountWeek: users.violationCountWeek,
        violationCountMonth: users.violationCountMonth,
      })
      .from(users)
      .where(eq(users.reviewStatus, status))
      .orderBy(desc(users.lastViolationAt))
      .limit(200);
  } else {
    // Default: show users with recent violations or non-normal status
    results = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        reviewStatus: users.reviewStatus,
        violationCountWeek: users.violationCountWeek,
        violationCountMonth: users.violationCountMonth,
      })
      .from(users)
      .where(
        or(
          eq(users.reviewStatus, "flagged"),
          eq(users.reviewStatus, "strict"),
          eq(users.reviewStatus, "banned"),
          gte(users.violationCountWeek, 1),
        ),
      )
      .orderBy(desc(users.lastViolationAt))
      .limit(50);
  }

  return c.html(<AdminUsersView query={q} status={status} results={results} />);
});

admin.get("/users/:id", requireAdmin, async (c) => {
  const id = c.req.param("id") as string;
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) return c.text("User not found", 404);

  const violations = await getUserViolationsWithLogs(id, 200);
  const stats = await getUserViolationStats(id);

  return c.html(
    <AdminUserView user={user} violations={violations} stats={stats} />,
  );
});

export default admin;
