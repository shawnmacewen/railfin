import type { ReactNode } from "react";

import packageJson from "../../../package.json";

import { AppShell } from "../../ui/app-shell";

function resolveBuildSha(): string {
  const rawSha =
    process.env.NEXT_PUBLIC_APP_BUILD_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_GIT_COMMIT_SHA ||
    process.env.GIT_COMMIT_SHA ||
    process.env.COMMIT_SHA ||
    "sha-unknown";

  const normalized = rawSha.trim();
  if (!normalized) {
    return "sha-unknown";
  }

  return /^[0-9a-f]{7,40}$/i.test(normalized) ? normalized.slice(0, 7).toLowerCase() : normalized;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell buildSha={resolveBuildSha()} appVersion={packageJson.version}>{children}</AppShell>;
}
