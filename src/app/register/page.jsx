"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Crown, PenTool, ShieldCheck, Sparkles, Star } from "lucide-react";
import { authClient, clearStoredAuthTokens, clientCallbackURL } from "@/lib/auth-client";
import { roleHomePath } from "@/lib/role-home";

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) router.replace(roleHomePath(session.user?.role));
  }, [isPending, router, session]);

  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      clearStoredAuthTokens();
      const result = await authClient.signUp.email({
        name: String(form.get("name")),
        email: String(form.get("email")),
        image: String(form.get("image")),
        password: String(form.get("password")),
        callbackURL: clientCallbackURL("/dashboard")
      });
      if (result?.error) return toast.error(result.error.message ?? "Registration failed");
      toast.success("Account created");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error?.message ?? "Registration failed");
    }
  }

  async function googleLogin() {
    try {
      clearStoredAuthTokens();
      await authClient.signIn.social({
        provider: "google",
        callbackURL: clientCallbackURL("/dashboard")
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
            <Sparkles size={15} /> Creator onboarding
          </span>
          <h2>Start your prompt marketplace profile</h2>
          <p>Create a workspace for publishing useful prompts, saving inspiration, collecting reviews, and growing into a trusted PromptHive creator.</p>
          <div className="auth-console">
            <div className="console-toolbar">
              <span className="console-dot" />
              <span className="console-dot cyan" />
              <span className="console-dot gold" />
            </div>
            <div className="prompt-line bright">Publish prompts for real AI workflows</div>
            <div className="prompt-line">Bookmark favorites and review community prompts</div>
            <div className="prompt-line glow">Upgrade later to access private premium content</div>
          </div>
          <div className="auth-feature-grid">
            <span><PenTool size={16} /> Creator profile</span>
            <span><Crown size={16} /> Premium vault</span>
            <span><Star size={16} /> Reviews</span>
          </div>
        </div>
      </motion.div>
      <motion.form className="form-panel auth-card" onSubmit={submit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <p className="eyebrow">Register</p>
        <h1>Create your prompt creator account</h1>
        <p className="auth-subcopy">Create a free account to explore the marketplace, save prompts, and publish up to three public prompts.</p>
        <label>
          Name
          <input name="name" required placeholder="Your name" />
        </label>
        <label>
          Email
          <input type="email" name="email" required placeholder="you@example.com" />
        </label>
        <label>
          Profile photo URL <span className="auth-optional">Optional</span>
          <input name="image" placeholder="https://..." />
        </label>
        <label>
          Password
          <input type="password" name="password" required minLength={8} placeholder="Minimum 8 characters" />
        </label>
        <button className="button" type="submit">
          Register
        </button>
        <div className="auth-divider"><span>or</span></div>
        <button className="button secondary google-auth-button" type="button" onClick={googleLogin}>
          <span className="google-mark" aria-hidden="true">G</span>
          Continue with Google
        </button>
        <div className="auth-trust-note">
          <ShieldCheck size={16} /> Google sign-up can use your Google profile photo automatically.
        </div>
        <p>
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </motion.form>
    </section>
  );
}
