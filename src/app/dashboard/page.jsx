"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArrowRight, BookmarkCheck, Crown, FileText, GitPullRequestArrow, Sparkles, Star } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { roleHomePath } from "@/lib/role-home";
import { Spinner } from "@/components/Spinner";
import { EmptyState, GlassTable, StatusPill, fadeUp, pageStagger } from "@/components/dashboard/NeuralWidgets";

function sourcePrompt(item) {
  return item.promptId ?? item;
}

function MiniStat({ icon: Icon, label, value, helper }) {
  return (
    <motion.article variants={fadeUp} className="dashboard-mini-stat">
      <span>
        <Icon size={20} />
      </span>
      <div>
        <strong>{value}</strong>
        <p>{label}</p>
        <small>{helper}</small>
      </div>
    </motion.article>
  );
}

export default function DashboardHome() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const user = await apiFetch("/api/users/me");
        if (!alive) return;
        if (user.role !== "user") {
          router.replace(roleHomePath(user.role));
          return;
        }

        const [saved, mine, myReviews] = await Promise.all([
          apiFetch("/api/bookmarks"),
          apiFetch("/api/prompts/mine/list?limit=50"),
          apiFetch("/api/reviews/me")
        ]);
        if (!alive) return;
        setProfile(user);
        setBookmarks(saved ?? []);
        setPrompts(mine.data ?? []);
        setReviews(myReviews ?? []);
      } catch (requestError) {
        if (!alive) return;
        const message = requestError?.message ?? "Could not load dashboard.";
        setError(message);
        toast.error(message);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [router]);

  const summary = useMemo(() => {
    const approved = prompts.filter((prompt) => prompt.status === "approved").length;
    const pending = prompts.filter((prompt) => prompt.status === "pending").length;
    const copies = prompts.reduce((sum, prompt) => sum + Number(prompt.copyCount ?? 0), 0);
    return { approved, pending, copies };
  }, [prompts]);

  if (error) {
    return <EmptyState title="Dashboard unavailable" text={error} actionHref="/dashboard" actionLabel="Try Again" />;
  }

  if (!profile) return <Spinner />;

  const promptRows = prompts.slice(0, 5).map((prompt) => ({
    id: prompt._id,
    title: prompt.title,
    tool: prompt.aiTool,
    status: prompt.status,
    visibility: prompt.visibility,
    copies: prompt.copyCount ?? 0
  }));
  const savedRows = bookmarks.slice(0, 5).map((item) => {
    const prompt = sourcePrompt(item);
    return {
      id: prompt._id,
      title: prompt.title ?? "Saved prompt",
      tool: prompt.aiTool ?? "AI",
      status: prompt.visibility ?? "public",
      copies: prompt.copyCount ?? 0
    };
  });

  return (
    <motion.section variants={pageStagger} initial="hidden" animate="visible" className="dashboard-simple grid gap-5">
      <motion.div variants={fadeUp} className="dashboard-welcome-card">
        <div className="dashboard-welcome-main">
          <div>
            <p className="dashboard-kicker">Dashboard</p>
            <h2>Welcome back, {profile.name}</h2>
            <p>Manage your prompts, saved library, reviews, and premium access from one clean workspace.</p>
          </div>
          <div className="dashboard-home-links">
            <Link href="/">Home</Link>
            <Link href="/prompts">Marketplace</Link>
          </div>
        </div>

        <div className={profile.subscription === "premium" ? "premium-access-card is-premium dashboard-access-compact" : "premium-access-card dashboard-access-compact"}>
            <span className="premium-access-orbit" aria-hidden="true" />
            <Crown className="text-amber-300" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-white/35">Access Layer</p>
            <strong className="mt-2 block text-2xl font-black capitalize text-white/90">{profile.subscription}</strong>
            <p className="mt-2 text-sm leading-6 text-white/45">{profile.subscription === "premium" ? "Premium prompts are unlocked." : "Upgrade once to unlock private prompts."}</p>
            <div className="premium-access-meter" aria-hidden="true">
              <span />
            </div>
            <Link className="premium-access-cta" href={profile.subscription === "premium" ? "/prompts" : "/payment?from=/dashboard"}>
              {profile.subscription === "premium" ? "Browse Premium Prompts" : "Upgrade to Premium"}
              <ArrowRight size={16} />
            </Link>
        </div>
      </motion.div>

      <motion.div variants={pageStagger} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat icon={FileText} label="My Prompts" value={profile.totalPrompts} helper={`${summary.copies} total copies`} />
        <MiniStat icon={BookmarkCheck} label="Saved" value={bookmarks.length} helper="Bookmarked prompts" />
        <MiniStat icon={Star} label="Reviews" value={reviews.length} helper="Reviews written" />
        <MiniStat icon={GitPullRequestArrow} label="Pending" value={summary.pending} helper={`${summary.approved} approved`} />
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassTable
          title="My Prompts"
          rows={promptRows}
          emptyTitle="No prompts published yet"
          emptyText="Create your first prompt and send it for admin review."
          columns={[
            { key: "title", label: "Prompt" },
            { key: "tool", label: "Tool" },
            { key: "status", label: "Status", render: (row) => <StatusPill value={row.status} /> },
            { key: "copies", label: "Copies" }
          ]}
        />
        <GlassTable
          title="Saved Prompts"
          rows={savedRows}
          emptyTitle="Saved library is empty"
          emptyText="Bookmark prompts from the marketplace to build your library."
          columns={[
            { key: "title", label: "Prompt" },
            { key: "tool", label: "Tool" },
            { key: "status", label: "Visibility", render: (row) => <StatusPill value={row.status} /> },
            { key: "copies", label: "Copies" }
          ]}
        />
      </div>

      <motion.article variants={fadeUp} className="dashboard-next-panel">
        <Sparkles size={18} />
        <div>
          <strong>Next best move</strong>
          <p>{profile.totalPrompts ? "Review your latest prompt status or explore the marketplace for ideas." : "Publish your first realistic AI prompt from the sidebar when you are ready."}</p>
        </div>
      </motion.article>
    </motion.section>
  );
}
