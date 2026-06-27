"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Camera, Crown, Mail, Save, ShieldCheck, Sparkles, Upload, UserRound } from "lucide-react";
import { absoluteUploadUrl, apiFetch } from "@/lib/api";
import { Spinner } from "@/components/Spinner";
import { EmptyState } from "@/components/dashboard/NeuralWidgets";

function initials(name = "PromptHive") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    apiFetch("/api/users/me")
      .then((user) => {
        if (!alive) return;
        setProfile(user);
        setName(user.name ?? "");
        setImage(user.image ?? "");
        setImageFailed(false);
      })
      .catch((requestError) => {
        if (!alive) return;
        const message = requestError?.message ?? "Could not load profile.";
        setError(message);
        toast.error(message);
      });
    return () => {
      alive = false;
    };
  }, []);

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await apiFetch("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({ name, image: image || undefined })
      });
      setProfile(updated);
      setName(updated.name ?? "");
      setImage(updated.image ?? "");
      setImageFailed(false);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append("image", file);
    setUploading(true);
    try {
      const uploaded = await apiFetch("/api/uploads", {
        method: "POST",
        body: data
      });
      const updated = await apiFetch("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({ image: uploaded.url, name })
      });
      setProfile(updated);
      setImage(uploaded.url);
      setImageFailed(false);
      toast.success("Photo uploaded");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  if (error) return <EmptyState title="Profile unavailable" text={error} actionHref="/dashboard" actionLabel="Back to Dashboard" />;
  if (!profile) return <Spinner />;

  const imageSrc = absoluteUploadUrl(image);
  const hasPhoto = Boolean(imageSrc) && !imageFailed;
  const isPremium = profile.subscription === "premium";

  return (
    <div className="profile-dashboard-card">
      <div className="profile-hero">
        <div className={profile.subscription === "premium" ? "profile-avatar-large premium-avatar-glow" : "profile-avatar-large"}>
          {hasPhoto ? <img src={imageSrc} alt="" onError={() => setImageFailed(true)} /> : <span>{initials(profile.name)}</span>}
          <label className="profile-upload-button" title="Upload profile photo">
            <Camera size={18} />
            <input type="file" accept="image/*" onChange={uploadPhoto} disabled={uploading} />
          </label>
        </div>
        <div className="profile-hero-copy">
          <span className="eyebrow">
            <Sparkles size={15} /> PromptHive identity
          </span>
          <h1>{profile.name}</h1>
          <p>
            Your Google profile photo is used automatically when available. Email accounts can add an optional local
            profile photo for dashboards, reviews, and creator cards.
          </p>
          <div className="workspace-status">
            <span><ShieldCheck size={14} /> {profile.role}</span>
            <span className={`stamp-badge stamp-badge--${profile.subscription}`}><Crown size={14} /> {profile.subscription}</span>
            <span><Mail size={14} /> {profile.email}</span>
          </div>
        </div>
      </div>

      <form className="profile-edit-panel" onSubmit={saveProfile}>
        <div className="profile-form-grid">
          <label>
            Display name
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
          </label>
          <div className="profile-photo-summary">
            <Camera size={18} />
            <div>
              <strong>Profile photo</strong>
              <span>{hasPhoto ? "Using your current Google or uploaded image." : "Upload an optional photo from your computer."}</span>
            </div>
          </div>
        </div>
        <div className="profile-upload-row">
          <label className="button secondary">
            <Upload size={17} /> {uploading ? "Uploading..." : "Upload from computer"}
            <input type="file" accept="image/*" onChange={uploadPhoto} disabled={uploading} />
          </label>
          <button className="button" type="submit" disabled={saving}>
            <Save size={17} /> {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>

      <div className="stats-grid" style={{ width: "100%", marginTop: 22 }}>
        <div className="stat-card"><UserRound size={24} color="var(--primary)" /><strong>{profile.role}</strong><span>Account Role</span></div>
        <div className="stat-card"><Sparkles size={24} color="var(--cyan)" /><strong>{profile.totalPrompts}</strong><span>Total Prompts</span></div>
        <div className="stat-card"><Crown size={24} color="var(--gold)" /><strong className={`stamp-badge stamp-badge--${profile.subscription}`}>{profile.subscription}</strong><span>Subscription</span></div>
      </div>

      {!isPremium && (
        <Link href="/payment?from=/dashboard/profile" className="button profile-premium-cta">
          <Crown size={18} /> Upgrade to Premium
        </Link>
      )}
    </div>
  );
}
