"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Flag,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Sparkles,
  Star,
  User,
  Users,
  X
} from "lucide-react";
import { authClient, clearStoredAuthTokens } from "@/lib/auth-client";
import { absoluteUploadUrl } from "@/lib/api";
import { cn } from "@/lib/format";
import { BrandMark } from "./BrandMark";
import { ThemeToggle } from "./ThemeToggle";

const navConfig = {
  user: [
    {
      label: "Workspace",
      items: [
        { href: "/dashboard", label: "Overview", icon: Home },
        { href: "/dashboard/add-prompt", label: "Add Prompt", icon: Plus },
        { href: "/dashboard/my-prompts", label: "My Prompts", icon: FileText },
        { href: "/dashboard/saved-prompts", label: "Saved", icon: Bookmark },
        { href: "/dashboard/my-reviews", label: "Reviews", icon: Star },
        { href: "/dashboard/profile", label: "Profile", icon: User }
      ]
    }
  ],
  creator: [
    {
      label: "Creator Tools",
      items: [
        { href: "/creator", label: "Analytics", icon: BarChart3 },
        { href: "/creator/add-prompt", label: "Publish Prompt", icon: Plus },
        { href: "/creator/my-prompts", label: "Prompt Library", icon: FileText }
      ]
    },
    {
      label: "Account",
      items: [{ href: "/dashboard/profile", label: "Profile", icon: User }]
    }
  ],
  admin: [
    {
      label: "Admin",
      items: [
        { href: "/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/prompts", label: "Prompts", icon: FileText },
        { href: "/admin/payments", label: "Payments", icon: CreditCard },
        { href: "/admin/reports", label: "Reports", icon: Flag },
        { href: "/admin/analytics", label: "Analytics", icon: BarChart3 }
      ]
    },
    {
      label: "Account",
      items: [{ href: "/dashboard/profile", label: "Profile", icon: User }]
    }
  ]
};

const roleMeta = {
  user: { label: "User", tone: "from-cyan-400 to-violet-500" },
  creator: { label: "Creator", tone: "from-violet-400 to-fuchsia-500" },
  admin: { label: "Admin", tone: "from-amber-400 to-violet-500" }
};

function normalizeRole(role) {
  return roleMeta[role] ? role : "user";
}

function initials(name = "PH") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function Avatar({ user, className = "" }) {
  const premium = user.subscription === "premium";
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(user.image) && !imageFailed;
  const imageSrc = absoluteUploadUrl(user.image);
  if (premium) {
    return (
      <span className={cn("premium-avatar-frame", className)} title="Premium member">
        {showImage ? (
          <img src={imageSrc} alt="" className="h-full w-full rounded-full object-cover" onError={() => setImageFailed(true)} />
        ) : (
          <span className="grid h-full w-full place-items-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-black text-white shadow-lg shadow-violet-500/20">
            {initials(user.name)}
          </span>
        )}
      </span>
    );
  }

  if (showImage) {
    return <img src={imageSrc} alt="" className={cn("h-10 w-10 rounded-full object-cover ring-1 ring-white/10", className)} onError={() => setImageFailed(true)} />;
  }

  return (
    <span className={cn("grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-black text-white shadow-lg shadow-violet-500/20 ring-1 ring-white/10", className)}>
      {initials(user.name)}
    </span>
  );
}

function isActive(pathname, href) {
  if (href === "/dashboard" || href === "/creator" || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNav({ groups, pathname, collapsed, mode, onNavigate }) {
  return (
    <nav className="dashboard-sidebar-nav">
      {groups.map((group) => (
        <section key={group.label} className="dashboard-sidebar-section">
          {!collapsed && (
            <p className="dashboard-sidebar-label">{group.label}</p>
          )}
          <div className="grid gap-1.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "dashboard-sidebar-link",
                    collapsed && "justify-center px-0",
                    active && "active"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId={`dashboard-active-${mode}`}
                      className="dashboard-sidebar-active-bg"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="dashboard-sidebar-icon">
                    <Icon className={cn("relative z-10 h-[18px] w-[18px] shrink-0 transition")} />
                  </span>
                  {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}

function MobileTabs({ groups, pathname, mode }) {
  const primaryItems = groups.flatMap((group) => group.items).slice(0, 5);
  return (
    <div className="fixed inset-x-3 bottom-3 z-50 rounded-[1.35rem] border border-white/[0.08] bg-[#15131F]/85 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link key={item.href} href={item.href} aria-label={item.label} className="relative grid min-h-12 place-items-center rounded-2xl text-white/50">
              {active && <motion.span layoutId={`mobile-active-${mode}`} className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/90 to-cyan-400/80" />}
              <Icon className={cn("relative z-10 h-5 w-5", active && "text-white")} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardShell({ user, mode, children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const accountRole = normalizeRole(user.role);
  const requestedMode = normalizeRole(mode);
  const shellMode = pathname === "/dashboard/profile" ? accountRole : requestedMode;
  const groups = navConfig[shellMode] ?? navConfig.user;
  const items = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const activeItem = [...items].sort((a, b) => b.href.length - a.href.length).find((item) => isActive(pathname, item.href));
  const meta = roleMeta[shellMode] ?? roleMeta.user;
  const accountMeta = roleMeta[accountRole] ?? roleMeta.user;
  const breadcrumb = activeItem?.label ?? "Dashboard";
  const roleCopy = {
    user: "Browse, save, review, and submit prompts for admin approval.",
    creator: "Publish premium-ready workflows and track creator analytics.",
    admin: "Review pending prompts, users, payments, reports, and analytics."
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  async function signOut() {
    clearStoredAuthTokens();
    await authClient.signOut();
    window.location.href = "/";
  }

  return (
    <div className="dashboard-shell min-h-screen bg-[#0A0A0F] text-white">
      <div className="dashboard-shell-bg pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_18%_10%,color-mix(in srgb, var(--primary), transparent 82%),transparent_30%),radial-gradient(circle_at_82%_14%,color-mix(in srgb, var(--cyan), transparent 88%),transparent_26%),linear-gradient(180deg,#0D0B14,#0A0A0F)]" />
      <aside
        className={cn(
          "dashboard-shell-sidebar fixed left-4 top-4 z-40 hidden h-[calc(100vh-2rem)] flex-col rounded-[1.25rem] border border-white/[0.08] bg-[#15131F]/70 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl transition-all duration-300 md:flex",
          collapsed ? "is-collapsed w-[72px]" : "w-[240px]"
        )}
      >
        <div className={cn("dashboard-sidebar-head", collapsed && "collapsed")}>
          <div className={cn("dashboard-sidebar-brand", collapsed && "collapsed")}>
            <Link href="/" className="dashboard-sidebar-logo" title="Back to PromptHive home">
              <BrandMark />
            </Link>
            {!collapsed && (
              <div className="min-w-0">
                <strong>PromptHive</strong>
                <span>Neural Marketplace</span>
              </div>
            )}
          </div>
          <button
            className="dashboard-sidebar-collapse"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {!collapsed && (
          <div className="dashboard-sidebar-status-card">
            <span className={`bg-gradient-to-r ${meta.tone}`}>{meta.label} Workspace</span>
            <p>{roleCopy[shellMode] ?? roleCopy.user}</p>
          </div>
        )}

        <SidebarNav groups={groups} pathname={pathname} collapsed={collapsed} mode={shellMode} />

        <div className="mt-auto grid gap-3">
          <div className={cn("dashboard-sidebar-profile", collapsed && "grid place-items-center p-2")}>
            <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
              <Avatar user={user} className="h-9 w-9" />
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-sm text-white/90">{user.name}</strong>
                  <span className={`stamp-badge stamp-badge--${accountRole} mt-1`}>
                    {accountMeta.label}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="dashboard-mobile-drawer md:hidden">
          <button
            type="button"
            className="dashboard-mobile-backdrop"
            aria-label="Close dashboard menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <motion.aside
            className="dashboard-mobile-panel"
            initial={{ x: "-105%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 330, damping: 34 }}
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard navigation"
          >
            <div className="dashboard-sidebar-head">
              <div className="dashboard-sidebar-brand">
                <Link href="/" className="dashboard-sidebar-logo" title="Back to PromptHive home" onClick={() => setMobileMenuOpen(false)}>
                  <BrandMark />
                </Link>
                <div className="min-w-0">
                  <strong>PromptHive</strong>
                  <span>{meta.label} Workspace</span>
                </div>
              </div>
              <button
                type="button"
                className="dashboard-sidebar-collapse"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close dashboard menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="dashboard-sidebar-status-card">
              <span className={`bg-gradient-to-r ${meta.tone}`}>{meta.label} Menu</span>
              <p>{roleCopy[shellMode] ?? roleCopy.user}</p>
            </div>

            <SidebarNav
              groups={groups}
              pathname={pathname}
              collapsed={false}
              mode={`${shellMode}-mobile`}
              onNavigate={() => setMobileMenuOpen(false)}
            />

            <div className="mt-auto grid gap-3">
              <div className="dashboard-sidebar-profile">
                <div className="flex items-center gap-3">
                  <Avatar user={user} className="h-10 w-10" />
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-sm text-white/90">{user.name}</strong>
                    <span className={`stamp-badge stamp-badge--${accountRole} mt-1`}>
                      {accountMeta.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      )}

      <div className={cn("relative z-10 min-h-screen transition-all duration-300 md:pl-[104px]", !collapsed && "md:pl-[272px]")}>
        <header className="dashboard-shell-topbar sticky top-0 z-30 border-b border-white/[0.06] bg-[#0D0B14]/72 px-4 py-3 backdrop-blur-xl md:px-8">
          <div className="mx-auto flex max-w-[1480px] items-center gap-3">
            <button
              type="button"
              className="dashboard-mobile-menu-button grid h-10 w-10 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-white/70 md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open dashboard menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                <span>Dashboard</span>
                <span>/</span>
                <span className="truncate text-white/60">{breadcrumb}</span>
              </div>
              <h1 className="mt-1 truncate text-xl font-bold tracking-[-0.02em] text-white/90">{breadcrumb}</h1>
            </div>
            <Link href="/" className="dashboard-toplink hidden min-h-10 items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm font-bold text-white/70 transition hover:text-white sm:inline-flex">
              <Home size={16} /> Home
            </Link>
            <Link href="/prompts" className="dashboard-toplink hidden min-h-10 items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm font-bold text-white/70 transition hover:text-white lg:inline-flex">
              <Sparkles size={16} /> Marketplace
            </Link>
            <ThemeToggle />
            <div className="dashboard-user-pill hidden items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-1.5 pr-3 md:flex">
              <Avatar user={user} className="h-8 w-8" />
              <span className="dashboard-user-name max-w-28 truncate text-sm font-semibold text-white/70">{user.name}</span>
            </div>
            <button className="grid h-11 w-11 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-white/60 transition hover:text-white" onClick={signOut} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="mx-auto grid max-w-[1480px] gap-6 px-4 py-6 pb-28 md:px-8 md:py-8"
        >
          {children}
        </motion.main>
      </div>

      <MobileTabs groups={groups} pathname={pathname} mode={shellMode} />
    </div>
  );
}
