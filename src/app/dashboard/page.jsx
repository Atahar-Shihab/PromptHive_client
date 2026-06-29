"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArrowRight, BellRing, BookmarkCheck, CheckCircle2, Clock3, Crown, Eye, FileText, Flag, GitPullRequestArrow, ShieldAlert, Sparkles, Star, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
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

function statusMessage(prompt) {
  if (prompt.status === "approved") return "Approved and visible in the marketplace.";
  if (prompt.status === "rejected") return prompt.rejectionFeedback || "Rejected by admin. Update and resubmit when ready.";
  return "Waiting for admin approval.";
}

function StatusFeed({ notifications, prompts }) {
  const fallbackItems = prompts
    .slice(0, 5)
    .map((prompt) => ({
      _id: prompt._id,
      title: prompt.status === "approved" ? "Prompt approved" : prompt.status === "rejected" ? "Prompt needs revision" : "Prompt in review",
      message: `${prompt.title}: ${statusMessage(prompt)}`,
      type: prompt.status,
      createdAt: prompt.updatedAt || prompt.createdAt,
      href: `/prompts/${prompt._id}`
    }));
  const feedItems = [
    ...notifications.map((item) => ({ ...item, href: item.type === "prompt" ? "/dashboard/my-prompts" : item.type === "report" ? "/dashboard/my-prompts" : "/dashboard" })),
    ...fallbackItems
  ].slice(0, 6);

  const iconMap = {
    approved: CheckCircle2,
    rejected: XCircle,
    pending: Clock3,
    prompt: FileText,
    report: ShieldAlert,
    payment: Crown,
    system: BellRing
  };

  return (
    <motion.article variants={fadeUp} className="dashboard-status-feed">
      <div className="dashboard-section-head">
        <div>
          <p className="dashboard-kicker">Status signals</p>
          <h3>Approval, report, and warning updates</h3>
        </div>
        <BellRing size={19} />
      </div>
      {!feedItems.length ? (
        <EmptyState title="No updates yet" text="Approvals, report notices, and admin warnings will appear here." />
      ) : (
        <div className="dashboard-feed-list">
          {feedItems.map((item, index) => {
            const Icon = iconMap[item.type] ?? Flag;
            return (
              <Link href={item.href} key={item._id ?? `${item.title}-${index}`} className={`dashboard-feed-item dashboard-feed-item--${item.type}`}>
                <span className="dashboard-feed-icon">
                  <Icon size={17} />
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.message}</small>
                  <em>{formatDate(item.createdAt)}</em>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </motion.article>
  );
}

function SavedPromptCards({ bookmarks }) {
  const items = bookmarks.slice(0, 4).map(sourcePrompt).filter(Boolean);
  return (
    <motion.article variants={fadeUp} className="dashboard-saved-panel">
      <div className="dashboard-section-head">
        <div>
          <p className="dashboard-kicker">Saved library</p>
          <h3>Bookmarked prompts you can return to</h3>
        </div>
        <Link href="/dashboard/saved-prompts" className="dashboard-mini-link">
          View all <ArrowRight size={15} />
        </Link>
      </div>
      {!items.length ? (
        <EmptyState title="No bookmarks yet" text="Bookmark prompts from the marketplace and they will appear in your dashboard." actionHref="/prompts" actionLabel="Explore Prompts" />
      ) : (
        <div className="dashboard-saved-grid">
          {items.map((prompt) => (
            <article key={prompt._id} className="dashboard-saved-card">
              <div>
                <span className="dashboard-saved-chip">{prompt.visibility === "private" ? "Premium vault" : "Public prompt"}</span>
                <h4>{prompt.title}</h4>
                <p>{prompt.description}</p>
              </div>
              <div className="dashboard-saved-meta">
                <span>{prompt.aiTool}</span>
                <span>{prompt.category}</span>
                <span>{prompt.copyCount ?? 0} copies</span>
              </div>
              <Link href={`/prompts/${prompt._id}`} className="dashboard-view-button">
                <Eye size={15} /> View Details
              </Link>
            </article>
          ))}
        </div>
      )}
    </motion.article>
  );
}

export default function DashboardHome() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
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

        const [saved, mine, myReviews, alerts] = await Promise.all([
          apiFetch("/api/bookmarks"),
          apiFetch("/api/prompts/mine/list?limit=50"),
          apiFetch("/api/reviews/me"),
          apiFetch("/api/notifications")
        ]);
        if (!alive) return;
        setProfile(user);
        setBookmarks(saved ?? []);
        setPrompts(mine.data ?? []);
        setReviews(myReviews ?? []);
        setNotifications(alerts ?? []);
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
    href: `/prompts/${prompt._id}`,
    tool: prompt.aiTool,
    status: prompt.status,
    visibility: prompt.visibility,
    copies: prompt.copyCount ?? 0
  }));

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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
        <GlassTable
          title="My Prompts"
          rows={promptRows}
          emptyTitle="No prompts published yet"
          emptyText="Create your first prompt and send it for admin review."
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
            { key: "status", label: "Status", render: (row) => <StatusPill value={row.status} /> },
            { key: "copies", label: "Copies" }
          ]}
        />
        <StatusFeed notifications={notifications} prompts={prompts} />
      </div>

      <SavedPromptCards bookmarks={bookmarks} />

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
