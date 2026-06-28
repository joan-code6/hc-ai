import type { Stats } from "../types";
import { Header } from "./components/Header";
import { StatCard } from "./components/StatCard";
import { Layout } from "./layout";

type AdminBannedUser = {
  id: string;
  email: string | null;
  name: string | null;
  reviewStatus: string;
  violationCountWeek: number;
  violationCountMonth: number;
};

type AdminUserSummary = {
  id: string;
  email: string | null;
  name: string | null;
  reviewStatus: string;
};

type AdminViolation = {
  id: string;
  category: string;
  type: string;
  content: string | null;
  createdAt: Date | string;
  dismissed: boolean;
};

type AdminViolationWithUser = {
  violation: AdminViolation;
  user: AdminUserSummary | null;
};

type AdminViolationWithLog = {
  violation: AdminViolation;
  requestLog: unknown;
};

type AdminUserSearchResult = {
  id: string;
  email: string | null;
  name: string | null;
  reviewStatus: string;
  violationCountWeek: number;
  violationCountMonth: number;
};

type AdminUserDetail = {
  id: string;
  email: string | null;
  name: string | null;
  slackId: string | null;
  createdAt: Date | string;
  reviewStatus: string;
};

type AdminUserStats = {
  reviewStatus: string;
  violationsThisWeek: number;
  violationsThisMonth: number;
  totalViolations?: number;
};

type ModerationStats = {
  totalViolations: number;
  activeViolations: number;
  bannedUsers: number;
  flaggedUsers: number;
  totalUsers: number;
};

export const AdminLoginView = ({ error }: { error: string | null }) => {
  return (
    <Layout title="Admin Login">
      <div class="w-full min-h-screen flex items-center justify-center px-4 py-12">
        <div class="w-full max-w-md">
          <div class="text-center mb-8">
            <div class="w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 transform -rotate-3">
              h
            </div>
            <h1 class="text-3xl font-bold text-brand-heading">Admin</h1>
            <p class="text-brand-text text-sm mt-2">Access the admin panel</p>
          </div>

          <div class="bg-brand-surface border-2 border-brand-border rounded-2xl p-8">
            {error && (
              <div class="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400 font-medium">
                {error}
              </div>
            )}
            <form method="post" action="/admin/login" class="space-y-4">
              <div>
                <label
                  for="admin-username"
                  class="block text-sm font-bold text-brand-heading mb-2"
                >
                  Username
                </label>
                <input
                  id="admin-username"
                  name="username"
                  autofocus
                  class="w-full px-4 py-3 rounded-xl bg-brand-bg border-2 border-brand-border text-brand-text focus:border-brand-primary outline-none transition-colors"
                />
              </div>
              <div>
                <label
                  for="admin-password"
                  class="block text-sm font-bold text-brand-heading mb-2"
                >
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  name="password"
                  class="w-full px-4 py-3 rounded-xl bg-brand-bg border-2 border-brand-border text-brand-text focus:border-brand-primary outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                class="w-full px-4 py-3 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-primary-hover transition-all mt-6"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, { bg: string; text: string; label: string }> = {
    normal: { bg: "bg-green-500/10", text: "text-green-400", label: "Normal" },
    flagged: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-400",
      label: "Flagged",
    },
    strict: {
      bg: "bg-orange-500/10",
      text: "text-orange-400",
      label: "Strict",
    },
    banned: { bg: "bg-red-500/10", text: "text-red-400", label: "Banned" },
  };
  const color = colors[status] || colors.normal;
  return (
    <span
      class={`text-xs px-2 py-1 rounded-lg font-medium ${color.bg} ${color.text}`}
    >
      {color.label}
    </span>
  );
};

const AdminTabs = ({
  active,
}: {
  active: "dashboard" | "violations" | "users";
}) => {
  const tabs = [
    { href: "/admin", label: "Dashboard", key: "dashboard" },
    { href: "/admin/violations", label: "Violations", key: "violations" },
    { href: "/admin/users", label: "Users", key: "users" },
  ];

  return (
    <div class="flex gap-2 mb-8 pb-2 border-b-2 border-brand-border overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <a
            href={tab.href}
            class={`px-4 py-3 whitespace-nowrap ${
              isActive
                ? "font-bold text-brand-heading border-b-2 border-brand-primary -mb-[2px]"
                : "font-medium text-brand-text hover:text-brand-heading transition-colors"
            }`}
            {...(isActive ? { "aria-current": "page" } : {})}
          >
            {tab.label}
          </a>
        );
      })}
    </div>
  );
};

export const AdminView = ({
  stats,
  moderationStats,
  bannedUsers,
}: {
  stats: Stats;
  moderationStats: ModerationStats;
  bannedUsers: AdminBannedUser[];
}) => {
  return (
    <Layout title="Admin Dashboard">
      <Header title="Admin" user={null} isAdmin />
      <div class="w-full max-w-7xl mx-auto px-4 py-8">
        <AdminTabs active="dashboard" />

        {/* Quick Actions */}
        <div class="flex flex-wrap gap-3 mb-8">
          <a
            href="/admin/violations"
            class="px-5 py-3 rounded-xl bg-brand-primary text-white font-bold text-sm hover:bg-brand-primary-hover transition-all inline-flex items-center gap-2"
          >
            <span>Browse Violations</span>
            {moderationStats.activeViolations > 0 && (
              <span class="bg-white/20 px-2 py-0.5 rounded-lg text-xs">
                {moderationStats.activeViolations} active
              </span>
            )}
          </a>
          <a
            href="/admin/users"
            class="px-5 py-3 rounded-xl bg-brand-surface border-2 border-brand-border text-brand-heading font-bold text-sm hover:border-brand-primary transition-all inline-flex items-center gap-2"
          >
            <span>Search Users</span>
          </a>
        </div>

        {/* Moderation Stats */}
        <h2 class="text-lg font-bold text-brand-heading mb-4">
          Moderation Overview
        </h2>
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 mb-12">
          <StatCard
            value={moderationStats.totalViolations.toLocaleString()}
            label="Total Violations"
          />
          <StatCard
            value={moderationStats.activeViolations.toLocaleString()}
            label="Active Violations"
          />
          <StatCard
            value={moderationStats.bannedUsers.toLocaleString()}
            label="Banned Users"
          />
          <StatCard
            value={moderationStats.flaggedUsers.toLocaleString()}
            label="Flagged / Strict"
          />
          <StatCard
            value={moderationStats.totalUsers.toLocaleString()}
            label="Total Users"
          />
        </div>

        {/* Global Stats */}
        <h2 class="text-lg font-bold text-brand-heading mb-4">
          Global Statistics
        </h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-12">
          <StatCard
            value={stats.totalRequests?.toLocaleString() || 0}
            label="Total Requests"
          />
          <StatCard
            value={stats.totalTokens?.toLocaleString() || 0}
            label="Total Tokens"
          />
          <StatCard
            value={stats.totalPromptTokens?.toLocaleString() || 0}
            label="Prompt Tokens"
          />
          <StatCard
            value={stats.totalCompletionTokens?.toLocaleString() || 0}
            label="Completion Tokens"
          />
        </div>

        {/* Recently Banned */}
        <div class="bg-brand-surface border-2 border-brand-border rounded-2xl p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-bold text-brand-heading">
              Recently Banned Users ({bannedUsers.length})
            </h2>
            {bannedUsers.length > 10 && (
              <a
                href="/admin/users?q="
                class="text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors"
              >
                View all
              </a>
            )}
          </div>
          {bannedUsers.length === 0 ? (
            <p class="text-brand-text text-sm py-8 text-center">
              No banned users
            </p>
          ) : (
            <div class="space-y-3">
              {bannedUsers.slice(0, 10).map((u) => (
                <div
                  class="flex justify-between items-center p-3 bg-brand-bg border border-brand-border rounded-xl hover:border-brand-primary/30 transition-all"
                  key={u.id}
                >
                  <div class="flex-1 min-w-0">
                    <a
                      href={`/admin/users/${u.id}`}
                      class="font-medium text-brand-heading text-sm hover:text-brand-primary transition-colors"
                    >
                      {u.name || u.email || "Unknown"}
                    </a>
                    <div class="text-xs text-brand-text mt-1">{u.email}</div>
                    <div class="flex gap-2 mt-2">
                      <span class="text-xs px-2 py-1 rounded-lg bg-red-500/10 text-red-400 font-medium">
                        Week: {u.violationCountWeek}
                      </span>
                      <span class="text-xs px-2 py-1 rounded-lg bg-orange-500/10 text-orange-400 font-medium">
                        Month: {u.violationCountMonth}
                      </span>
                    </div>
                  </div>
                  <div class="flex gap-2 ml-4 flex-shrink-0">
                    <a
                      class="px-3 py-2 text-xs font-medium rounded-lg bg-brand-border hover:bg-brand-border/150 transition-colors text-brand-text"
                      href={`/admin/users/${u.id}`}
                    >
                      Details
                    </a>
                    <form
                      method="post"
                      action={`/admin/users/${u.id}/unban`}
                      class="inline"
                    >
                      <button
                        type="submit"
                        class="px-3 py-2 text-xs font-medium rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors border border-green-500/30"
                      >
                        Unban
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export const AdminViolationsView = ({
  violations,
  status,
}: {
  violations: AdminViolationWithUser[];
  status: string;
}) => {
  const filterTabs = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "dismissed", label: "Dismissed" },
  ];

  return (
    <Layout title="Violations" includeHtmx>
      <Header title="Admin" user={null} isAdmin />
      <div class="w-full max-w-7xl mx-auto px-4 py-8">
        <AdminTabs active="violations" />

        <div class="bg-brand-surface border-2 border-brand-border rounded-2xl p-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 class="text-lg font-bold text-brand-heading">
              Violations ({violations.length})
            </h2>
            <div class="flex gap-1 bg-brand-bg rounded-xl p-1 border border-brand-border">
              {filterTabs.map((tab) => {
                const isActive = tab.key === status;
                return (
                  <a
                    href={`/admin/violations?status=${tab.key}`}
                    class={`px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                      isActive
                        ? "bg-brand-primary text-white"
                        : "text-brand-text hover:text-brand-heading"
                    }`}
                  >
                    {tab.label}
                  </a>
                );
              })}
            </div>
          </div>
          {violations.length === 0 ? (
            <p class="text-brand-text text-center py-12">
              {status === "active"
                ? "No active violations"
                : status === "dismissed"
                  ? "No dismissed violations"
                  : "No violations found"}
            </p>
          ) : (
            <div class="space-y-3">
              {violations.map((item) => (
                <div
                  class="p-4 bg-brand-bg border border-brand-border rounded-xl hover:border-brand-primary/30 transition-all"
                  key={item.violation.id}
                >
                  <div class="flex justify-between items-start gap-4">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-2 flex-wrap">
                        <span class="text-xs px-2 py-1 rounded-lg bg-brand-primary/20 text-brand-primary font-bold uppercase">
                          {item.violation.category}
                        </span>
                        <span class="text-xs px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-medium">
                          {item.violation.type}
                        </span>
                        {item.user && (
                          <a
                            href={`/admin/users/${item.user.id}`}
                            class="text-xs px-2 py-1 rounded-lg bg-brand-border hover:bg-brand-border/150 transition-colors text-brand-text font-medium"
                          >
                            {item.user.name || item.user.email || "Unknown"}
                          </a>
                        )}
                        <StatusBadge
                          status={item.user?.reviewStatus || "normal"}
                        />
                      </div>
                      <p class="text-sm text-brand-text line-clamp-2 mb-2">
                        {item.violation.content || "No content"}
                      </p>
                      <div class="text-xs text-brand-text/70">
                        {new Date(item.violation.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div class="flex items-start gap-2 ml-2 flex-shrink-0">
                      {item.user && (
                        <a
                          href={`/admin/users/${item.user.id}`}
                          class="px-3 py-2 text-xs font-bold rounded-lg bg-brand-border hover:bg-brand-border/150 transition-colors text-brand-text"
                        >
                          View User
                        </a>
                      )}
                      {item.violation.dismissed ? (
                        <span class="text-xs px-3 py-2 rounded-lg bg-green-500/10 text-green-400 font-medium border border-green-500/30">
                          Dismissed
                        </span>
                      ) : (
                        <form
                          method="post"
                          action={`/admin/violations/${item.violation.id}/dismiss`}
                        >
                          <button
                            type="submit"
                            class="px-3 py-2 text-xs font-medium rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors border border-yellow-500/30 cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export const AdminUsersView = ({
  query,
  status,
  results,
}: {
  query: string;
  status: string;
  results: AdminUserSearchResult[];
}) => {
  const statusTabs = [
    { key: "all", label: "All" },
    { key: "flagged", label: "Flagged" },
    { key: "strict", label: "Strict" },
    { key: "banned", label: "Banned" },
  ];

  const showDefault = !query && status === "all";

  return (
    <Layout title="Users" includeHtmx>
      <Header title="Admin" user={null} isAdmin />
      <div class="w-full max-w-7xl mx-auto px-4 py-8">
        <AdminTabs active="users" />

        <div class="bg-brand-surface border-2 border-brand-border rounded-2xl p-6">
          <h2 class="text-lg font-bold text-brand-heading mb-6">
            {query ? `Search: "${query}"` : "Users"}
          </h2>

          <form method="get" action="/admin/users" class="mb-4">
            <div class="flex gap-2">
              <input
                name="q"
                defaultValue={query}
                placeholder="Search by email, name, or Slack ID..."
                class="flex-1 px-4 py-3 rounded-xl bg-brand-bg border-2 border-brand-border text-brand-text focus:border-brand-primary outline-none transition-colors"
              />
              <button
                class="px-6 py-3 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-primary-hover transition-all"
                type="submit"
              >
                Search
              </button>
            </div>
          </form>

          {/* Status Filters */}
          <div class="flex gap-1 mb-6 bg-brand-bg rounded-xl p-1 border border-brand-border w-fit">
            {statusTabs.map((tab) => {
              const isActive = tab.key === status;
              return (
                <a
                  href={`/admin/users?status=${tab.key}`}
                  class={`px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                    isActive
                      ? "bg-brand-primary text-white"
                      : "text-brand-text hover:text-brand-heading"
                  }`}
                >
                  {tab.label}
                </a>
              );
            })}
          </div>

          {showDefault && (
            <p class="text-brand-text text-sm mb-4">
              Showing users with recent activity or non-normal status. Use the
              filters above or search to find specific users.
            </p>
          )}

          {query && results.length === 0 ? (
            <p class="text-brand-text text-center py-12">
              No users found matching "{query}"
            </p>
          ) : results.length === 0 ? (
            <p class="text-brand-text text-center py-12 text-sm">
              No users found with the selected filter.
            </p>
          ) : (
            <div class="space-y-2">
              {results.map((u) => (
                <div
                  class="flex justify-between items-center p-4 bg-brand-bg border border-brand-border rounded-xl hover:border-brand-primary/30 transition-all group"
                  key={u.id}
                >
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <a
                        href={`/admin/users/${u.id}`}
                        class="font-bold text-brand-heading text-sm hover:text-brand-primary transition-colors"
                      >
                        {u.name || u.email || "Unknown"}
                      </a>
                      <StatusBadge status={u.reviewStatus} />
                    </div>
                    <div class="text-xs text-brand-text">{u.email}</div>
                    {(u.violationCountWeek > 0 ||
                      u.violationCountMonth > 0) && (
                      <div class="flex gap-2 mt-2">
                        <span class="text-xs px-2 py-1 rounded-lg bg-red-500/10 text-red-400 font-medium">
                          Week: {u.violationCountWeek}
                        </span>
                        <span class="text-xs px-2 py-1 rounded-lg bg-orange-500/10 text-orange-400 font-medium">
                          Month: {u.violationCountMonth}
                        </span>
                      </div>
                    )}
                  </div>
                  <a
                    class="px-4 py-2 text-xs font-bold rounded-lg bg-brand-border hover:bg-brand-border/150 transition-colors text-brand-text"
                    href={`/admin/users/${u.id}`}
                  >
                    View Profile
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export const AdminUserView = ({
  user,
  violations,
  stats,
}: {
  user: AdminUserDetail;
  violations: AdminViolationWithLog[];
  stats: AdminUserStats;
}) => {
  return (
    <Layout
      title={`User: ${user.name || user.email}`}
      includeHtmx
      includeAlpine
    >
      <Header title="Admin" user={null} isAdmin />
      <div class="w-full max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div class="flex items-center gap-2 text-sm text-brand-text mb-6">
          <a href="/admin" class="hover:text-brand-primary transition-colors">
            Dashboard
          </a>
          <span class="text-brand-border">/</span>
          <a
            href="/admin/users"
            class="hover:text-brand-primary transition-colors"
          >
            Users
          </a>
          <span class="text-brand-border">/</span>
          <span class="text-brand-heading font-medium">
            {user.name || user.email || "User"}
          </span>
        </div>

        {/* User Header */}
        <div class="bg-brand-surface border-2 border-brand-border rounded-2xl p-6 mb-8">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h1 class="text-2xl font-bold text-brand-heading">
                {user.name || user.email}
              </h1>
              <p class="text-brand-text text-sm mt-1">{user.email}</p>
              {user.slackId && (
                <p class="text-brand-text text-sm">Slack: {user.slackId}</p>
              )}
            </div>
            {user.reviewStatus === "banned" ? (
              <form
                method="post"
                action={`/admin/users/${user.id}/unban`}
                class="inline"
                onsubmit="return confirm('Are you sure you want to unban this user?')"
              >
                <button
                  type="submit"
                  class="px-6 py-3 text-sm font-bold rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors border border-green-500/30 hover:border-green-500/50 cursor-pointer"
                >
                  Unban User
                </button>
              </form>
            ) : (
              <form
                method="post"
                action={`/admin/users/${user.id}/ban`}
                class="inline"
                onsubmit="return confirm('Are you sure you want to ban this user? This will prevent them from using the service.')"
              >
                <button
                  type="submit"
                  class="px-6 py-3 text-sm font-bold rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/30 hover:border-red-500/50 cursor-pointer"
                >
                  Ban User
                </button>
              </form>
            )}
          </div>
          <div class="flex flex-wrap gap-3 mt-4">
            <StatusBadge status={user.reviewStatus} />
            <span class="text-xs px-2.5 py-1.5 rounded-lg bg-brand-border text-brand-text font-medium">
              Joined: {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <h2 class="text-lg font-bold text-brand-heading mb-4">
          Violation Statistics
        </h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
          <StatCard
            value={stats.totalViolations ?? violations.length}
            label="Total Violations"
          />
          <StatCard value={stats.violationsThisWeek} label="This Week" />
          <StatCard value={stats.violationsThisMonth} label="This Month" />
          <div class="border-2 border-brand-border bg-brand-surface p-6 rounded-2xl shadow-sm">
            <div class="text-2xl sm:text-3xl font-bold mb-2 text-brand-heading">
              <StatusBadge status={stats.reviewStatus} />
            </div>
            <div class="text-xs sm:text-sm font-medium text-brand-text uppercase tracking-wide">
              Current Status
            </div>
          </div>
        </div>

        {/* Violations List */}
        <div class="bg-brand-surface border-2 border-brand-border rounded-2xl p-6">
          <h2 class="text-lg font-bold text-brand-heading mb-6">
            Violation History ({violations.length})
          </h2>
          {violations.length === 0 ? (
            <p class="text-brand-text text-center py-12">
              No violations on record
            </p>
          ) : (
            <div class="space-y-3">
              {violations.map((item, idx: number) => (
                <div
                  x-data={`{ open${idx}: false }`}
                  key={item.violation.id}
                  class="bg-brand-bg border border-brand-border rounded-xl overflow-hidden"
                >
                  <button
                    type="button"
                    x-on:click={`open${idx} = !open${idx}`}
                    class="w-full px-4 py-3 flex justify-between items-center hover:bg-brand-bg/80 transition-colors text-left"
                  >
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-xs px-2 py-1 rounded-lg font-semibold bg-brand-primary/20 text-brand-primary uppercase">
                          {item.violation.category}
                        </span>
                        <span class="text-xs px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-medium">
                          {item.violation.type}
                        </span>
                      </div>
                      <p class="text-xs text-brand-text line-clamp-1">
                        {item.violation.content || "No content"}
                      </p>
                      <p class="text-xs text-brand-text/70 mt-1">
                        {new Date(item.violation.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      x-text={`open${idx} ? '▼' : '▶'`}
                      class="text-brand-text ml-2"
                    ></span>
                  </button>

                  <div
                    x-show={`open${idx}`}
                    class="px-4 py-3 bg-brand-bg/50 border-t border-brand-border/50 space-y-2"
                  >
                    <div>
                      <p class="text-xs font-bold text-brand-text uppercase tracking-wide block mb-1">
                        Flagged Content
                      </p>
                      <p class="text-xs text-brand-text bg-brand-bg rounded px-3 py-2 break-words">
                        {item.violation.content || "(No content stored)"}
                      </p>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                      <div class="bg-brand-bg rounded px-3 py-2">
                        <span class="font-bold text-brand-text">Type:</span>
                        <p class="text-brand-text/70 mt-1">
                          {item.violation.type}
                        </p>
                      </div>
                      <div class="bg-brand-bg rounded px-3 py-2">
                        <span class="font-bold text-brand-text">Category:</span>
                        <p class="text-brand-text/70 mt-1">
                          {item.violation.category}
                        </p>
                      </div>
                      <div class="bg-brand-bg rounded px-3 py-2 col-span-2">
                        <span class="font-bold text-brand-text">
                          Timestamp:
                        </span>
                        <p class="text-brand-text/70 mt-1">
                          {new Date(item.violation.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div class="mt-2">
                      {item.violation.dismissed ? (
                        <span class="text-xs px-2 py-1 rounded-lg bg-green-500/10 text-green-400 font-medium">
                          Dismissed
                        </span>
                      ) : (
                        <form
                          method="post"
                          action={`/admin/violations/${item.violation.id}/dismiss`}
                        >
                          <button
                            type="submit"
                            class="px-3 py-2 text-xs font-medium rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors border border-yellow-500/30 cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminView;
