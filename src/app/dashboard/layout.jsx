"use client";

import { DashboardShell } from "@/components/DashboardShell";
import { Protected } from "@/components/Protected";

export default function DashboardLayout({ children }) {
  return <Protected>{(user) => <DashboardShell user={user} mode="user">{children}</DashboardShell>}</Protected>;
}
