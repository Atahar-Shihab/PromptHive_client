"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, Copy, CreditCard, FileText, Flag, MessageSquare, ShieldCheck, Users } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Spinner } from "@/components/Spinner";
import { ChartCard, EmptyState, StatCard, StatusPill, fadeUp, pageStagger } from "@/components/dashboard/NeuralWidgets";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    apiFetch("/api/analytics/admin")
      .then((result) => {
        if (alive) setData(result);
      })
      .catch((requestError) => {
        if (!alive) return;
        const message = requestError?.message ?? "Could not load admin analytics.";
        setError(message);
        toast.error(message);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (error) return <EmptyState title="Admin dashboard unavailable" text={error} actionHref="/admin" actionLabel="Try Again" />;
  if (!data) return <Spinner />;

  const chart = [
    { label: "Users", value: data.totalUsers },
    { label: "Prompts", value: data.totalPrompts },
    { label: "Reviews", value: data.totalReviews },
    { label: "Copies", value: data.totalCopies },
    { label: "Payments", value: data.totalPayments },
    { label: "Reports", value: data.totalReports }
  ];

  const adminRows = [
    {
      id: "reports",
      area: "Reported Prompts",
      count: data.totalReports,
      status: data.totalReports ? "pending" : "approved",
      href: "/admin/reports",
      icon: Flag,
      cta: "Review reports",
      description: "Remove reported prompts, warn creators, or dismiss resolved reports."
    },
    {
      id: "payments",
      area: "Premium Payments",
      count: data.totalPayments,
      status: "approved",
      href: "/admin/payments",
      icon: CreditCard,
      cta: "View payments",
      description: "Audit premium unlocks, payment records, and buyer history."
    },
    {
      id: "users",
      area: "Role Management",
      count: data.totalUsers,
      status: "admin",
      href: "/admin/users",
      icon: Users,
      cta: "Manage users",
      description: "Change user roles, review subscriptions, and remove bad accounts."
    },
    {
      id: "prompts",
      area: "Prompt Moderation",
      count: data.totalPrompts,
      status: "pending",
      href: "/admin/prompts",
      icon: FileText,
      cta: "Open queue",
      description: "Approve, reject with feedback, feature, or delete submitted prompts."
    }
  ];

  return (
    <motion.section variants={pageStagger} initial="hidden" animate="visible" className="grid gap-6">
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#15131F]/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,color-mix(in srgb, var(--gold), transparent 82%),transparent_30%),radial-gradient(circle_at_90%_12%,color-mix(in srgb, var(--cyan), transparent 83%),transparent_30%)]" />
        <div className="relative z-10">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-300">Admin Command</p>
          <h2 className="mt-3 max-w-4xl text-4xl font-black tracking-[-0.04em] text-white/90 md:text-6xl">Platform intelligence and moderation</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/55">
            Monitor users, prompts, reports, payments, reviews, and copy activity with admin-grade visibility.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="neural-chip"><Users size={15} /> {data.totalUsers} users</span>
            <span className="neural-chip"><FileText size={15} /> {data.totalPrompts} prompts</span>
            <span className="neural-chip premium"><Flag size={15} /> {data.totalReports} reports</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={pageStagger} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard icon={Users} label="Users" value={data.totalUsers} trend="platform" />
        <StatCard icon={FileText} label="Prompts" value={data.totalPrompts} trend="content" />
        <StatCard icon={MessageSquare} label="Reviews" value={data.totalReviews} trend="trust" />
        <StatCard icon={Copy} label="Copies" value={data.totalCopies} trend="usage" />
        <StatCard icon={CreditCard} label="Payments" value={data.totalPayments} trend="premium" />
        <StatCard icon={Flag} label="Reports" value={data.totalReports} trendType={data.totalReports ? "down" : "up"} trend="moderate" />
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <ChartCard title="Platform Distribution" meta="Live admin totals">
          <ResponsiveContainer width="100%" height={310}>
            <BarChart data={chart} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.42)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.42)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "rgba(21,19,31,0.92)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, color: "rgba(255,255,255,0.9)" }} />
              <Bar dataKey="value" fill="url(#adminBar)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="adminBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--cyan)" />
                  <stop offset="100%" stopColor="var(--primary)" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <motion.article variants={fadeUp} className="rounded-2xl border border-white/[0.08] bg-[#15131F]/70 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Admin Actions</p>
          <div className="mt-4 grid gap-3">
            {adminRows.map((row) => (
              <Link key={row.id} href={row.href} className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 transition hover:scale-[1.01] hover:bg-violet-500/[0.08]">
                <div>
                  <strong className="block text-white/85">{row.area}</strong>
                  <span className="text-sm text-white/45">{row.count} records</span>
                </div>
                <StatusPill value={row.status} />
              </Link>
            ))}
          </div>
        </motion.article>
      </div>

      <motion.article variants={fadeUp} className="admin-workflow-queue">
        <div className="admin-workflow-head">
          <div>
            <p className="eyebrow">Admin queue</p>
            <h3>Operational workflows</h3>
          </div>
          <span>{adminRows.reduce((sum, row) => sum + Number(row.count ?? 0), 0)} records tracked</span>
        </div>
        <div className="admin-workflow-grid">
          {adminRows.map((row) => {
            const Icon = row.icon;
            return (
              <Link href={row.href} key={row.id} className="admin-workflow-card">
                <span className="admin-workflow-icon">
                  <Icon size={20} />
                </span>
                <div className="admin-workflow-copy">
                  <div className="admin-workflow-title">
                    <strong>{row.area}</strong>
                    <StatusPill value={row.status} />
                  </div>
                  <p>{row.description}</p>
                  <small>{row.count} records</small>
                </div>
                <span className="admin-workflow-cta">
                  {row.cta} <ArrowRight size={16} />
                </span>
              </Link>
            );
          })}
        </div>
      </motion.article>
    </motion.section>
  );
}
