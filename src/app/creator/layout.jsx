"use client";

import { DashboardShell } from "@/components/DashboardShell";
import { Protected } from "@/components/Protected";

export default function CreatorLayout({ children }) {
  return (
    <Protected roles={["creator", "admin"]}>
      {(user) => <DashboardShell user={user} mode="creator">{children}</DashboardShell>}
    </Protected>
  );
}
