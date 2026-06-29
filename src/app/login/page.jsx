"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Bookmark, Crown, LayoutDashboard, ShieldCheck, Sparkles } from "lucide-react";
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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      clearStoredAuthTokens();
      const result = await authClient.signIn.email({
        email: String(form.get("email")),
        password: String(form.get("password")),
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

      toast.success("Welcome back");
      window.location.assign(roleAwareRedirect(result?.data?.url ?? redirect, role));
    } catch (error) {
      toast.error(error?.message ?? "Login failed");
    } finally {
      setSubmitting(false);
    }
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
        <label>
          Email
          <input type="email" name="email" required placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input type="password" name="password" required placeholder="Minimum 8 characters" />
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
