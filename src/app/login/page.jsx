"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { ArrowRight, Bookmark, Check, Copy, Crown, LayoutDashboard, ShieldCheck, Sparkles, User, Zap } from "lucide-react";
import { authClient, clearStoredAuthTokens, clientCallbackURL } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import { roleHomePath } from "@/lib/role-home";

function safeLocalRedirect(path) {
  if (typeof window === "undefined") return "/dashboard";
  try {
    const url = new URL(path || "/dashboard", window.location.origin);
    if (url.origin !== window.location.origin) return "/dashboard";
    return `${url.pathname}${url.search}${url.hash}` || "/dashboard";
  } catch {
    return typeof path === "string" && path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard";
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function roleAwareRedirect(path, role) {
  const target = safeLocalRedirect(path);
  return target === "/dashboard" ? roleHomePath(role) : target;
}

async function waitForSession() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const response = await fetch("/api/auth/get-session", {
      credentials: "include",
      cache: "no-store"
    });
    const session = response.ok ? await response.json().catch(() => null) : null;
    if (session?.user && session?.session) return session;
    await delay(180);
  }
  return null;
}

const demoAccounts = [
  {
    role: "Creator",
    email: "creator@demo.com",
    password: "creator1234",
    icon: Sparkles,
    badgeColor: "rgba(139, 92, 246, 0.18)",
    textColor: "#a78bfa",
    desc: "Test prompt publishing, AI tester & creator analytics.",
    badge: "Studio"
  },
  {
    role: "Premium Buyer",
    email: "user@demo.com",
    password: "user1234",
    icon: Crown,
    badgeColor: "rgba(245, 158, 11, 0.18)",
    textColor: "#fde68a",
    desc: "Test private prompt vault, reviews, bookmarks & PDFs.",
    badge: "Pro Member"
  }
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeDemoRole, setActiveDemoRole] = useState(null);
  const [copiedRole, setCopiedRole] = useState(null);

  async function executeLogin(targetEmail, targetPassword, roleName = "") {
    if (submitting) return;
    setSubmitting(true);
    if (roleName) setActiveDemoRole(roleName);
    setEmail(targetEmail);
    setPassword(targetPassword);

    try {
      clearStoredAuthTokens();
      const result = await authClient.signIn.email({
        email: targetEmail,
        password: targetPassword,
        rememberMe: true,
        callbackURL: clientCallbackURL(redirect)
      });
      if (result?.error) {
        toast.error(result.error.message ?? "Login failed");
        return;
      }

      const session = await waitForSession();
      if (!session) {
        toast.error("Login succeeded, but the session was not restored. Please try again.");
        return;
      }

      let role = session.user?.role;
      try {
        const profile = await apiFetch("/api/users/me");
        role = profile.role;
      } catch {
        role = session.user?.role;
      }

      toast.success(roleName ? `Signed in as ${roleName}!` : "Welcome back");
      window.location.assign(roleAwareRedirect(result?.data?.url ?? redirect, role));
    } catch (error) {
      toast.error(error?.message ?? "Login failed");
    } finally {
      setSubmitting(false);
      setActiveDemoRole(null);
    }
  }

  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const formEmail = String(form.get("email") || email).trim();
    const formPassword = String(form.get("password") || password);
    await executeLogin(formEmail, formPassword);
  }

  function copyCreds(e, account) {
    e.stopPropagation();
    navigator.clipboard.writeText(`Email: ${account.email}\nPassword: ${account.password}`);
    setCopiedRole(account.role);
    toast.success(`${account.role} credentials copied!`);
    setTimeout(() => setCopiedRole(null), 2000);
  }

  async function googleLogin() {
    try {
      clearStoredAuthTokens();
      await authClient.signIn.social({
        provider: "google",
        callbackURL: clientCallbackURL(redirect)
      });
    } catch (error) {
      toast.error(error?.message ?? "Google login failed");
    }
  }

  return (
    <section className="auth-page">
      <motion.div className="auth-visual" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="auth-visual-inner">
          <span className="eyebrow">
            <Sparkles size={15} /> PromptHive marketplace
          </span>
          <h2>Welcome back to your AI prompt workspace</h2>
          <p>Continue discovering prompt collections, save useful workflows, review creators, and unlock premium vault prompts from one polished marketplace.</p>
          <div className="auth-console">
            <div className="console-toolbar">
              <span className="console-dot" />
              <span className="console-dot cyan" />
              <span className="console-dot gold" />
            </div>
            <div className="prompt-line bright">Saved prompt library ready</div>
            <div className="prompt-line">Marketplace, reviews, bookmarks, and creator tools</div>
            <div className="prompt-line glow">Premium vault workflows unlock after upgrade</div>
          </div>
          <div className="auth-feature-grid">
            <span><Bookmark size={16} /> Saved prompts</span>
            <span><Crown size={16} /> Premium vault</span>
            <span><LayoutDashboard size={16} /> Role dashboard</span>
          </div>
        </div>
      </motion.div>
      <motion.form className="form-panel auth-card" onSubmit={submit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <p className="eyebrow">Login</p>
        <h1>Continue to PromptHive</h1>
        <p className="auth-subcopy">Sign in to manage bookmarks, publish prompts, review workflows, and continue from your dashboard.</p>

        {/* 1-Click Demo Accounts Section */}
        <div className="demo-access-panel">
          <div className="demo-access-header">
            <div className="demo-access-title">
              <Zap size={15} style={{ color: "var(--cyan)" }} />
              <span>1-Click Demo Accounts</span>
            </div>
            <span className="demo-access-badge">Instant Access</span>
          </div>
          <p className="demo-access-subcopy">
            Evaluating PromptHive? Click a role below to explore the platform without typing credentials:
          </p>
          <div className="demo-roles-grid demo-roles-grid--two">
            {demoAccounts.map((account) => {
              const Icon = account.icon;
              const isSigningIn = submitting && activeDemoRole === account.role;
              return (
                <button
                  key={account.role}
                  type="button"
                  className="demo-role-card"
                  disabled={submitting}
                  onClick={() => executeLogin(account.email, account.password, account.role)}
                >
                  <div className="demo-role-top">
                    <span className="demo-role-tag">
                      <Icon size={15} style={{ color: account.textColor }} />
                      <span>{account.role}</span>
                    </span>
                    <span
                      className="demo-role-badge"
                      style={{ background: account.badgeColor, color: account.textColor }}
                    >
                      {account.badge}
                    </span>
                  </div>
                  <span className="demo-role-desc">{account.desc}</span>
                  <div className="demo-role-footer">
                    <span className="demo-role-creds">
                      {account.email}
                    </span>
                    <span className="demo-role-action">
                      {isSigningIn ? "Signing in..." : (
                        <>
                          <span>Sign in</span>
                          <ArrowRight size={13} />
                        </>
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="auth-divider"><span>or enter credentials</span></div>

        <label>
          Email
          <input
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
          />
        </label>
        <button className="button" type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Login"}
        </button>
        <div className="auth-divider"><span>or</span></div>
        <button className="button secondary google-auth-button" type="button" onClick={googleLogin}>
          <span className="google-mark" aria-hidden="true">G</span>
          Continue with Google
        </button>
        <div className="auth-trust-note">
          <ShieldCheck size={16} /> Your workspace keeps prompts, bookmarks, and premium access synced securely.
        </div>
        <p>
          New here? <Link href="/register">Create an account</Link>
        </p>
      </motion.form>
    </section>
  );
}
