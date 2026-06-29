"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDown, ArrowUp, Box, Eye, Pencil, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/format";

export const pageStagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

export const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } }
};

function AnimatedNumber({ value }) {
  const numeric = Number(value ?? 0);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 80, damping: 18 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    motionValue.set(numeric);
  }, [motionValue, numeric]);

  useEffect(() => {
    return spring.on("change", (latest) => setDisplay(Math.round(latest)));
  }, [spring]);

  return <>{Number.isFinite(numeric) ? display : value}</>;
}

const trendColor = {
  up: "text-emerald-300",
  down: "text-red-300",
  neutral: "text-white/40"
};

export function StatCard({ icon: Icon = Sparkles, label, value, trend = "12% this week", trendType = "up", data = [] }) {
  const chart = data.length ? data : [
    { value: 2 },
    { value: 4 },
    { value: 3 },
    { value: 7 },
    { value: Number(value || 4) }
  ];
  const TrendIcon = trendType === "down" ? ArrowDown : ArrowUp;

  return (
    <motion.article variants={fadeUp} className="group relative min-h-[154px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#15131F]/70 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-lg shadow-violet-500/20">
          <Icon size={20} />
        </div>
        <span className={cn("inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2.5 py-1 text-xs font-bold", trendColor[trendType])}>
          <TrendIcon size={12} /> {trend}
        </span>
      </div>
      <div className="relative z-10 mt-5">
        <p className="text-sm font-medium text-white/45">{label}</p>
        <strong className="mt-1 block text-4xl font-black tracking-[-0.04em] text-white/90">
          <AnimatedNumber value={value} />
        </strong>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 opacity-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chart}>
            <Area dataKey="value" type="monotone" stroke="var(--cyan)" strokeWidth={2} fill="var(--primary)" fillOpacity={0.18} isAnimationActive animationDuration={800} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.article>
  );
}

export function ChartCard({ title, meta, data, children }) {
  return (
    <motion.article variants={fadeUp} className="rounded-2xl border border-white/[0.08] bg-[#15131F]/70 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{title}</p>
          {meta && <p className="mt-1 text-sm text-white/45">{meta}</p>}
        </div>
      </div>
      {children}
    </motion.article>
  );
}

export function NeuralAreaChart({ data, firstKey = "primary", secondKey = "secondary", xKey = "label", height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id={`${firstKey}-gradient`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--cyan)" stopOpacity={0.32} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <XAxis dataKey={xKey} tick={{ fill: "var(--chart-muted, rgba(255,255,255,0.64))", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "var(--chart-muted, rgba(255,255,255,0.64))", fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: "var(--chart-tooltip-bg, rgba(21,19,31,0.94))", border: "1px solid var(--chart-tooltip-border, rgba(255,255,255,0.12))", borderRadius: 14, color: "var(--chart-text, rgba(255,255,255,0.94))", backdropFilter: "blur(16px)" }} />
        <Area dataKey={firstKey} type="monotone" stroke="var(--cyan)" strokeWidth={3} fill={`url(#${firstKey}-gradient)`} isAnimationActive animationDuration={800} />
        <Area dataKey={secondKey} type="monotone" stroke="var(--primary)" strokeWidth={2} fill="transparent" isAnimationActive animationDuration={800} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const statusMap = {
  approved: "bg-emerald-400/10 text-emerald-300",
  pending: "bg-amber-400/10 text-amber-300",
  rejected: "bg-red-400/10 text-red-300",
  premium: "bg-amber-400/10 text-amber-300",
  private: "bg-amber-400/10 text-amber-300",
  public: "bg-cyan-400/10 text-cyan-300",
  free: "bg-white/[0.04] text-white/50",
  user: "bg-cyan-400/10 text-cyan-300",
  creator: "bg-violet-400/10 text-violet-300",
  admin: "bg-amber-400/10 text-amber-300"
};

export function StatusPill({ value }) {
  const key = String(value ?? "pending").toLowerCase();
  return (
    <span className={cn("stamp-badge", `stamp-badge--${key}`, statusMap[key] ? "" : "stamp-badge--neutral")}>
      {value}
    </span>
  );
}

export function EmptyState({ title, text, actionHref, actionLabel }) {
  return (
    <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] p-6 text-center">
      <div>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/25 to-cyan-400/20 text-cyan-200">
          <Box size={26} />
        </div>
        <h3 className="mt-4 text-lg font-bold text-white/85">{title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/45">{text}</p>
        {actionHref && (
          <Link href={actionHref} className="mt-4 inline-flex min-h-10 items-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-4 text-sm font-bold text-white">
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

export function GlassTable({ title, columns, rows, emptyTitle = "No data yet", emptyText = "New records will appear here." }) {
  return (
    <motion.article variants={fadeUp} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#15131F]/70 shadow-xl shadow-black/20 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] p-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{title}</p>
      </div>
      {!rows.length ? (
        <div className="p-5">
          <EmptyState title={emptyTitle} text={emptyText} />
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <table className="neural-table w-full min-w-0 border-collapse">
              <thead className="sticky top-0 bg-[#15131F]/95">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className="border-b border-white/[0.06] px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.16em] text-white/35">
                      {column.label}
                    </th>
                  ))}
                  <th className="border-b border-white/[0.06] px-5 py-3 text-right text-xs font-bold uppercase tracking-[0.16em] text-white/35">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id ?? index} className="transition duration-200 hover:scale-[1.005] hover:bg-violet-500/[0.06] hover:shadow-[0_0_28px_color-mix(in srgb, var(--primary), transparent 88%)]">
                    {columns.map((column) => (
                      <td key={column.key} className="border-b border-white/[0.045] px-5 py-4 text-sm text-white/65">
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                    <td className="border-b border-white/[0.045] px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {row.href && (
                          <Link href={row.href} className="grid h-8 w-8 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/45 transition hover:border-cyan-300/40 hover:text-white" title="View details">
                            <Eye size={15} />
                          </Link>
                        )}
                        {row.editHref && (
                          <Link href={row.editHref} className="grid h-8 w-8 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/45 transition hover:border-violet-300/40 hover:text-white" title="Edit">
                            <Pencil size={15} />
                          </Link>
                        )}
                        {row.onDelete && (
                          <button type="button" onClick={row.onDelete} className="grid h-8 w-8 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/45 transition hover:border-red-300/40 hover:text-white" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        )}
                        {!row.href && !row.editHref && !row.onDelete && <span className="text-sm text-white/30">-</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 p-4 md:hidden">
            {rows.map((row, index) => (
              <div key={row.id ?? index} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                {columns.map((column) => (
                  <div key={column.key} className="mb-2">
                    <span className="text-xs uppercase tracking-wide text-white/35">{column.label}</span>
                    <div className="text-sm text-white/75">{column.render ? column.render(row) : row[column.key]}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </motion.article>
  );
}
