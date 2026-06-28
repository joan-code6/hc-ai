import type { User } from "../types";
import { Layout } from "./layout";

export type BannedViolation = {
  id: string;
  category: string;
  type: string;
  content: string | null;
  createdAt: Date | string | null;
};

type BannedViewProps = {
  user: User;
  violations: BannedViolation[];
};

export const BannedView = ({ user, violations }: BannedViewProps) => {
  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "sexual":
      case "sexual/minors":
        return "bg-pink-100 text-pink-800";
      case "violence":
        return "bg-red-100 text-red-800";
      case "harassment":
      case "hate":
        return "bg-orange-100 text-orange-800";
      case "self-harm":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout title="Banned - Hack Club AI">
      <div class="min-h-screen flex items-center justify-center px-4 py-12">
        <div class="w-full max-w-2xl">
          <div class="text-center mb-8">
            <div class="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                class="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <title>Warning</title>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 class="text-4xl font-bold text-brand-heading mb-4">
              You have been banned
            </h1>
            <p class="text-xl text-brand-text/90 mb-4">
              Hi, {user.name || user.slackId}
            </p>
            <p class="text-lg text-brand-text/80 mb-2">
              Your account has been banned from using Hack Club AI due to
              content policy violations.
            </p>
          </div>

          <div class="bg-brand-surface border-2 border-brand-border p-6 rounded-2xl mb-6">
            <h2 class="text-xl font-semibold mb-4 text-brand-heading">
              Recent Violations
            </h2>
            {violations.length === 0 ? (
              <p class="text-brand-text">No violation records found.</p>
            ) : (
              <div class="space-y-3">
                {violations.map((violation) => (
                  <div
                    key={violation.id}
                    class="bg-brand-bg p-4 rounded-xl flex items-center justify-between"
                  >
                    <div class="flex items-center gap-4">
                      <div
                        class={`w-2 h-2 rounded-full ${violation.category === "sexual" || violation.category === "sexual/minors" ? "bg-pink-500" : violation.category === "violence" ? "bg-red-500" : "bg-orange-500"}`}
                      />
                      <div>
                        <div class="flex items-center gap-2">
                          <span
                            class={`text-xs px-2 py-0.5 rounded-full capitalize ${getCategoryBadgeColor(violation.category)}`}
                          >
                            {violation.category}
                          </span>
                          <span class="text-xs text-brand-text capitalize">
                            {violation.type}
                          </span>
                        </div>
                        <div class="text-xs text-brand-text mt-1">
                          {violation.createdAt
                            ? new Date(violation.createdAt).toLocaleString()
                            : "Unknown date"}
                        </div>
                        {violation.content && (
                          <div class="mt-2 text-xs text-brand-text/70 bg-brand-surface/50 rounded p-2 max-h-32 overflow-y-auto break-words font-mono">
                            {violation.content}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div class="bg-brand-surface border-2 border-brand-border p-6 rounded-2xl text-center">
            <h2 class="text-xl font-semibold mb-3 text-brand-heading">
              Think this is a mistake?
            </h2>
            <p class="text-brand-text mb-4">
              You can appeal your ban by contacting Mahad on the Hack Club
              Slack. Please explain why you were banned and include your
              username ({user.name || user.slackId}).
            </p>
            <a
              href="https://slack.hackclub.com/"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-primary-hover transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <title>Slack</title>
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
              </svg>
              Write @mahad on Slack
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};
