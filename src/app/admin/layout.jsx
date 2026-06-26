"use client";

import { DashboardShell } from "@/components/DashboardShell";
import { Protected } from "@/components/Protected";

export default function AdminLayout({ children }) {
  return (
    <Protected roles={["admin"]}>
      {(user) => <DashboardShell user={user} mode="admin">{children}</DashboardShell>}
    </Protected>
  );
}
