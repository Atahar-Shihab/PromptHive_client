"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Bookmark, Copy, FileText, GitPullRequestArrow, Rocket, ShieldCheck, Sparkles, Star } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Spinner } from "@/components/Spinner";
import { ChartCard, EmptyState, GlassTable, NeuralAreaChart, StatCard, StatusPill, fadeUp, pageStagger } from "@/components/dashboard/NeuralWidgets";

export default function CreatorDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [creatorAnalytics, mine] = await Promise.all([
          apiFetch("/api/analytics/creator"),
          apiFetch("/api/prompts/mine/list?limit=50")
        ]);
        if (!alive) return;
        setAnalytics(creatorAnalytics);
        setPrompts(mine.data ?? []);
      } catch (requestError) {
        if (!alive) return;
        const message = requestError?.message ?? "Could not load creator dashboard.";
        setError(message);
        toast.error(message);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  const state = useMemo(() => {
    const approved = prompts.filter((prompt) => prompt.status === "approved").length;
    const pending = prompts.filter((prompt) => prompt.status === "pending").length;
    const privatePrompts = prompts.filter((prompt) => prompt.visibility === "private").length;
    return { approved, pending, privatePrompts };
  }, [prompts]);

  if (error) return <EmptyState title="Creator dashboard unavailable" text={error} actionHref="/creator" actionLabel="Try Again" />;
  if (!analytics) return <Spinner />;

  const summary = analytics.summary;
  const growth = analytics.growth?.length
    ? analytics.growth.map((item) => ({ label: item.date, primary: item.copies, secondary: item.prompts }))
    : [
        { label: "Draft", primary: 1, secondary: 1 },
        { label: "Review", primary: state.pending, secondary: 2 },
        { label: "Live", primary: summary.totalCopies, secondary: state.approved }
      ];

  const promptRows = prompts.slice(0, 8).map((prompt) => ({
    id: prompt._id,
    title: prompt.title,
    href: `/prompts/${prompt._id}`,
    category: prompt.category,
    tool: prompt.aiTool,
    visibility: prompt.visibility,
    status: prompt.status,
    copies: prompt.copyCount ?? 0
  }));

  return (
    <motion.section variants={pageStagger} initial="hidden" animate="visible" className="grid gap-6">
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#15131F]/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,color-mix(in srgb, var(--primary), transparent 70%),transparent_36%),radial-gradient(circle_at_90%_20%,color-mix(in srgb, var(--cyan), transparent 84%),transparent_30%)]" />
        <div className="relative z-10">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">Creator Tools</p>
          <h2 className="mt-3 max-w-4xl text-4xl font-black tracking-[-0.04em] text-white/90 md:text-6xl">Prompt performance studio</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/55">
            Track prompt growth, copies, bookmarks, review status, and premium/private publishing performance.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="neural-chip"><ShieldCheck size={15} /> {state.approved} approved</span>
            <span className="neural-chip"><GitPullRequestArrow size={15} /> {state.pending} pending</span>
            <span className="neural-chip premium"><Rocket size={15} /> {state.privatePrompts} private</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={pageStagger} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileText} label="Total Prompts" value={summary.totalPrompts} trend="creator" />
        <StatCard icon={Copy} label="Total Copies" value={summary.totalCopies} trend="copy signal" />
        <StatCard icon={Bookmark} label="Bookmarks" value={summary.totalBookmarks} trend="saved" />
        <StatCard icon={Star} label="Private Prompts" value={state.privatePrompts} trendType="neutral" trend="premium" />
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <ChartCard title="Prompt Growth" meta="Copies and prompt count over time">
          <NeuralAreaChart data={growth} />
        </ChartCard>
        <motion.article variants={fadeUp} className="rounded-2xl border border-white/[0.08] bg-[#15131F]/70 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Publishing State</p>
          <div className="mt-4 grid gap-3">
            {[
              { label: "Approved", value: state.approved, icon: ShieldCheck, status: "approved" },
              { label: "Pending", value: state.pending, icon: GitPullRequestArrow, status: "pending" },
              { label: "Private", value: state.privatePrompts, icon: Rocket, status: "private" }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                  <div className="flex items-center gap-3">
                    <Icon size={18} className="text-cyan-300" />
                    <span className="font-bold text-white/75">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <strong className="text-white/90">{item.value}</strong>
                    <StatusPill value={item.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.article>
      </div>

      <GlassTable
        title="Creator Prompt Library"
        rows={promptRows}
        emptyTitle="No creator prompts yet"
        emptyText="Publish prompts to start tracking growth and copies."
        columns={[
          {
            key: "title",
            label: "Prompt",
            render: (row) => (
              <Link className="dashboard-table-link" href={row.href}>
                {row.title}
              </Link>
            )
          },
          { key: "tool", label: "Tool" },
          { key: "visibility", label: "Visibility", render: (row) => <StatusPill value={row.visibility} /> },
          { key: "status", label: "Status", render: (row) => <StatusPill value={row.status} /> },
          { key: "copies", label: "Copies" }
        ]}
      />
    </motion.section>
  );
}
