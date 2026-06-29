"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Crown, ImagePlus, PenTool, Rocket, ShieldCheck, Sparkles, Star, UserRound } from "lucide-react";
import { authClient, clearStoredAuthTokens, clientCallbackURL } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import { roleHomePath } from "@/lib/role-home";

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [accountRole, setAccountRole] = useState("user");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isPending && session) router.replace(roleHomePath(session.user?.role));
  }, [isPending, router, session]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [photoFile]);

  function choosePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be 2MB or smaller.");
      event.target.value = "";
      return;
    }

    setPhotoFile(file);
  }

  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name")).trim();
    const requestedRole = form.get("role") === "creator" ? "creator" : "user";
    try {
      setSubmitting(true);
      clearStoredAuthTokens();
      const result = await authClient.signUp.email({
        name,
        email: String(form.get("email")),
        password: String(form.get("password")),
        callbackURL: clientCallbackURL("/dashboard")
      });
      if (result?.error) return toast.error(result.error.message ?? "Registration failed");

      let uploadedImage = "";
      if (photoFile) {
        try {
          const uploadData = new FormData();
          uploadData.append("image", photoFile);
          const uploaded = await apiFetch("/api/uploads", {
            method: "POST",
            body: uploadData
          });
          uploadedImage = uploaded.url;
        } catch {
          toast.warn("Account created, but photo upload failed. You can upload it later from Profile.");
        }
      }

      await apiFetch("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          name,
          role: requestedRole,
          ...(uploadedImage ? { image: uploadedImage } : {})
        })
      });

      toast.success(requestedRole === "creator" ? "Creator workspace created" : "User workspace created");
      router.push(roleHomePath(requestedRole));
    } catch (error) {
      toast.error(error?.message ?? "Registration failed");
    } finally {
      setSubmitting(false);
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
        <div className="auth-role-chooser" role="radiogroup" aria-label="Choose account type">
          {[
            {
              value: "user",
              title: "Join as User",
              text: "Browse, bookmark, review, and unlock premium prompts.",
              icon: UserRound
            },
            {
              value: "creator",
              title: "Join as Creator",
              text: "Publish prompt workflows and track creator activity.",
              icon: Rocket
            }
          ].map((option) => {
            const Icon = option.icon;
            return (
              <label className={`auth-role-card${accountRole === option.value ? " selected" : ""}`} key={option.value}>
                <input
                  checked={accountRole === option.value}
                  name="role"
                  type="radio"
                  value={option.value}
                  onChange={() => setAccountRole(option.value)}
                />
                <span className="auth-role-icon">
                  <Icon size={18} />
                </span>
                <span>
                  <strong>{option.title}</strong>
                  <small>{option.text}</small>
                </span>
              </label>
            );
          })}
        </div>
        <label>
          Name
          <input name="name" required placeholder="Your name" />
        </label>
        <label>
          Email
          <input type="email" name="email" required placeholder="you@example.com" />
        </label>
        <label className="auth-photo-picker">
          <span className="auth-photo-frame">
            {photoPreview ? <img src={photoPreview} alt="Selected profile preview" /> : <ImagePlus size={26} />}
          </span>
          <span className="auth-photo-copy">
            <strong>Upload profile photo</strong>
            <small>Optional JPG, PNG, or WEBP up to 2MB.</small>
          </span>
          <span className="auth-photo-action">{photoFile ? "Change image" : "Choose image"}</span>
          <input type="file" accept="image/*" onChange={choosePhoto} />
        </label>
        <label>
          Password
          <input type="password" name="password" required minLength={8} placeholder="Minimum 8 characters" />
        </label>
        <button className="button" type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Register"}
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
