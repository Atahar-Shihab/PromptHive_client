"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { AlertCircle, AlertTriangle, Bookmark, BookmarkCheck, CheckCircle2, Copy, Download, Flag, Gauge, GitFork, ListChecks, Lock, Send, Share2, Sparkles, Star } from "lucide-react";
import { toast } from "react-toastify";
import { absoluteUploadUrl, apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { cn, formatDate } from "@/lib/format";
import { ReportModal } from "@/components/ReportModal";
import { Spinner } from "@/components/Spinner";

function initials(name = "Creator") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function CreatorAvatar({ creator }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = absoluteUploadUrl(creator?.image);
  if (imageSrc && !imageFailed) {
    return <img src={imageSrc} alt="" onError={() => setImageFailed(true)} />;
  }
  return <span className="avatar-initials creator-initials">{initials(creator?.name)}</span>;
}

function RatingStars({ value = 0, size = 16, interactive = false, onChange }) {
  const rounded = Math.round(Number(value) || 0);
  return (
    <span className={cn("rating-stars", interactive && "rating-stars-input")} aria-label={`${rounded} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((item) => {
        const active = item <= rounded;
        if (!interactive) {
          return <Star key={item} size={size} className={active ? "active" : ""} fill={active ? "currentColor" : "none"} />;
        }
        return (
          <button
            aria-label={`Rate ${item} out of 5 stars`}
            aria-pressed={active}
            className={active ? "active" : ""}
            key={item}
            type="button"
            onClick={() => onChange?.(item)}
          >
            <Star size={size} fill={active ? "currentColor" : "none"} />
          </button>
        );
      })}
    </span>
  );
}

function RatingBadge({ value = 0, reviews = 0 }) {
  const number = Number(value) || 0;
  return (
    <div className="rating-badge">
      <RatingStars value={number} size={17} />
      <strong>{number ? number.toFixed(1) : "New"}</strong>
      <span>{reviews} {reviews === 1 ? "review" : "reviews"}</span>
    </div>
  );
}

function localPromptReport(content, reason = "PromptHive local test engine completed the analysis.") {
  const placeholders = content.match(/\{\{.*?\}\}|\{.*?\}/g) ?? [];
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const hasRole = /\b(act as|you are|role:|expert|assistant)\b/i.test(content);
  const hasOutput = /\b(output|return|format|deliver|include)\b/i.test(content);
  const hasContext = /\b(context|audience|goal|topic|product|brand|workflow|notes)\b/i.test(content);
  const hasConstraints = /\b(constraints|avoid|must|tone|style|length|criteria|rubric|requirements)\b/i.test(content);
  const score = Math.min(100, 42 + (hasRole ? 15 : 0) + (hasOutput ? 16 : 0) + (hasContext ? 14 : 0) + (hasConstraints ? 11 : 0) - Math.min(8, placeholders.length * 2));
  return {
    reason,
    score,
    quality: score >= 82 ? "Excellent" : score >= 68 ? "Good" : "Needs refinement",
    metrics: {
      wordCount,
      variableCount: placeholders.length,
      roleClarity: hasRole,
      contextClarity: hasContext,
      outputFormat: hasOutput,
      constraints: hasConstraints
    },
    strengths: [
      hasRole && "Defines a role or expertise frame.",
      hasContext && "Includes useful context.",
      hasOutput && "Mentions an expected output format.",
      hasConstraints && "Provides constraints or success criteria."
    ].filter(Boolean),
    issues: [
      !hasRole && "Add a clear role or expertise frame.",
      !hasContext && "Add audience, product, source text, or goal context.",
      !hasOutput && "Specify the expected output format.",
      !hasConstraints && "Add constraints, tone, length, exclusions, or success criteria."
    ].filter(Boolean),
    recommendations: [
      "Ask for assumptions when information is missing.",
      "Add a compact rubric or checklist for evaluating the response.",
      "Test the prompt with one normal input and one edge case."
    ],
    sampleInput: placeholders.length
      ? ["Rewrite this prompt with concrete project details instead of placeholder variables."]
      : ["Test it with a real campaign, support workflow, product launch, or research task."]
  };
}

function PromptTestReport({ report, output }) {
  if (!report && !output) return null;
  if (!report) return <div className="prompt-content test-output-raw">{output}</div>;
  const metrics = [
    ["Words", report.metrics?.wordCount ?? 0],
    ["Concrete", report.metrics?.variableCount ? "Needs edit" : "Ready"],
    ["Role", report.metrics?.roleClarity ? "Present" : "Missing"],
    ["Output", report.metrics?.outputFormat ? "Present" : "Missing"]
  ];

  return (
    <div className="prompt-test-report">
      <div className="test-score-card">
        <Gauge size={22} />
        <strong>{Math.round(report.score)}</strong>
        <span>{report.quality}</span>
      </div>
      <div className="test-report-body">
        <p>{report.reason}</p>
        <div className="test-metrics">
          {metrics.map(([label, value]) => (
            <span key={label}>
              <small>{label}</small>
              <b>{value}</b>
            </span>
          ))}
        </div>
        <div className="test-report-grid">
          <div>
            <h3><CheckCircle2 size={16} /> Strengths</h3>
            {(report.strengths?.length ? report.strengths : ["Good starting structure."]).map((item) => <p key={item}>{item}</p>)}
          </div>
          <div>
            <h3><AlertCircle size={16} /> Fix next</h3>
            {(report.issues?.length ? report.issues : ["No major gaps detected."]).map((item) => <p key={item}>{item}</p>)}
          </div>
          <div>
            <h3><ListChecks size={16} /> Recommendations</h3>
            {(report.recommendations ?? []).slice(0, 3).map((item) => <p key={item}>{item}</p>)}
          </div>
          <div>
            <h3><Sparkles size={16} /> Sample test input</h3>
            {(report.sampleInput ?? []).slice(0, 3).map((item) => <p key={item}>{item}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PromptDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState(false);
  const [testOutput, setTestOutput] = useState("");
  const [testReport, setTestReport] = useState(null);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.replace(`/login?redirect=${encodeURIComponent(`/prompts/${id}`)}`);
      return;
    }
    setError("");
    setCopied(false);
    apiFetch(`/api/prompts/${id}`)
      .then(setPrompt)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id, isPending, router, session]);

  async function refresh() {
    try {
      setPrompt(await apiFetch(`/api/prompts/${id}`));
    } catch (requestError) {
      toast.error(requestError.message);
    }
  }

  async function bookmark() {
    try {
      const result = await apiFetch(`/api/bookmarks/${id}`, { method: "POST" });
      toast.success(result.message);
      setPrompt((current) => ({ ...current, isBookmarked: result.bookmarked }));
    } catch (requestError) {
      toast.error(requestError.message);
    }
  }

  async function copyPrompt() {
    if (prompt.locked) return router.push(`/payment?from=/prompts/${id}`);
    try {
      await navigator.clipboard.writeText(prompt.content);
      const result = await apiFetch(`/api/prompts/${id}/copy`, { method: "PATCH" });
      toast.success("Prompt copied");
      setCopied(true);
      setPrompt((current) => ({ ...current, copyCount: result.copyCount }));
    } catch (requestError) {
      toast.error(requestError.message || "Could not copy prompt");
    }
  }

  async function review(event) {
    event.preventDefault();
    if (prompt.locked) return router.push(`/payment?from=/prompts/${id}`);
    const reviewForm = event.currentTarget;
    const form = new FormData(reviewForm);
    try {
      await apiFetch(`/api/prompts/${id}/reviews`, {
        method: "POST",
        body: JSON.stringify({
          rating: reviewRating,
          comment: String(form.get("comment"))
        })
      });
      toast.success("Review saved");
      reviewForm.reset();
      setReviewRating(5);
      refresh();
    } catch (requestError) {
      toast.error(requestError.message);
    }
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: prompt.title, text: prompt.description, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied");
    } catch (requestError) {
      if (requestError.name !== "AbortError") toast.error("Could not share this prompt");
    }
  }

  async function forkPrompt() {
    if (prompt.locked) return router.push(`/payment?from=/prompts/${id}`);
    try {
      await apiFetch(`/api/prompts/${id}/fork`, { method: "POST", body: JSON.stringify({}) });
      toast.success("Fork created and sent for review");
      router.push(`/dashboard/my-prompts`);
    } catch (requestError) {
      toast.error(requestError.message || "Could not fork this prompt");
    }
  }

  async function downloadPdf() {
    if (prompt.locked) return router.push(`/payment?from=/prompts/${id}`);
    try {
      const pdf = await PDFDocument.create();
      let page = pdf.addPage([595, 842]);
      const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
      const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
      const margin = 48;
      let y = 790;

      page.drawText(prompt.title.slice(0, 70), { x: margin, y, size: 18, font: titleFont, color: rgb(0.05, 0.35, 0.32) });
      y -= 28;
      page.drawText(`Tool: ${prompt.aiTool} | Category: ${prompt.category} | Difficulty: ${prompt.difficulty}`, {
        x: margin,
        y,
        size: 10,
        font: bodyFont,
        color: rgb(0.35, 0.35, 0.35)
      });
      y -= 26;

      const words = prompt.content.replace(/\n/g, " ").split(" ");
      let line = "";
      for (const word of words) {
        const next = `${line} ${word}`.trim();
        if (bodyFont.widthOfTextAtSize(next, 11) > 500) {
          page.drawText(line, { x: margin, y, size: 11, font: bodyFont });
          y -= 16;
          line = word;
        } else {
          line = next;
        }
        if (y < 50) {
          page = pdf.addPage([595, 842]);
          y = 790;
        }
      }
      if (line) page.drawText(line, { x: margin, y, size: 11, font: bodyFont });
      const bytes = await pdf.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${prompt.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not generate PDF");
    }
  }

  async function testPrompt() {
    if (prompt.locked) return router.push(`/payment?from=/prompts/${id}`);
    setTesting(true);
    setTestOutput("");
    setTestReport(null);
    try {
      const result = await apiFetch("/api/ai/test-prompt", {
        method: "POST",
        body: JSON.stringify({ prompt: prompt.content, provider: "openai" })
      });
      setTestReport(result.report ?? null);
      setTestOutput(result.report ? "" : result.output);
      if (result.fallback) {
        toast.info("Live AI unavailable, showing PromptHive QA report.");
      }
    } catch (error) {
      setTestReport(localPromptReport(prompt.content, "PromptHive generated an instant browser quality scan for this prompt."));
      toast.info("Prompt quality scan generated.");
    } finally {
      setTesting(false);
    }
  }

  if (error) {
    return (
      <section className="details-layout">
        <article className="details-panel empty-state-panel">
          <AlertTriangle size={34} />
          <h1>Prompt unavailable</h1>
          <p>{error}</p>
          <div className="action-row">
            <button className="button" onClick={() => window.location.reload()}>Try Again</button>
            <Link className="button secondary" href="/prompts">Back to Prompts</Link>
          </div>
        </article>
      </section>
    );
  }
  if (isPending || loading || !prompt) return <Spinner label="Loading prompt" />;
  const locked = prompt.locked;

  return (
    <section className="details-layout prompt-detail-stage">
      <article className="details-panel prompt-detail-main ring-1 ring-white/10">
        <div className="detail-title-row">
          <div>
            <div className="card-meta">
              <span>{prompt.category}</span>
              <span>{prompt.aiTool}</span>
              <span>{prompt.difficulty}</span>
              <span className={`stamp-badge stamp-badge--${prompt.visibility === "private" ? "premium" : "approved"}`}>{prompt.visibility}</span>
            </div>
            <h1>{prompt.title}</h1>
          </div>
          <div className="detail-score">
            <RatingStars value={prompt.avgRating} size={18} />
            <span>{prompt.copyCount} copies</span>
          </div>
        </div>
        <p>{prompt.description}</p>
        <div className="detail-trust-strip">
          <span><CheckCircle2 size={15} /> Marketplace verified</span>
          <span className={`stamp-badge stamp-badge--${prompt.visibility === "private" ? "premium" : "approved"}`}><Sparkles size={15} /> {prompt.visibility === "private" ? "Premium vault" : "Public prompt"}</span>
          <span><RatingStars value={prompt.avgRating} size={14} /> Community rated</span>
          <span><Copy size={15} /> {prompt.copyCount} copies</span>
        </div>
        <div className="tag-row">
          {prompt.tags?.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>

        <div className={locked ? "prompt-content locked-content prompt-reader" : "prompt-content prompt-reader"}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{prompt.content}</ReactMarkdown>
        </div>

        {locked && (
          <div className="payment-panel premium-lock-panel">
            <h2>
              <Lock size={20} /> Premium prompt locked
            </h2>
            <p>Subscribe to Premium to view the full content, copy it, review it, fork it, test it, and download it as PDF.</p>
            <Link className="button" href={`/payment?from=/prompts/${id}`}>
              Subscribe to Premium
            </Link>
          </div>
        )}

        <div className="usage-card">
          <h2>Usage Instructions</h2>
          <p>Use this prompt directly in {prompt.aiTool}. Add your real project notes above or below it if needed, then review the output and ask for a tighter second version with clearer constraints.</p>
        </div>

        <div className="review-section-head">
          <div>
            <span className="eyebrow">Community feedback</span>
            <h2>Reviews & Ratings</h2>
          </div>
          <RatingBadge value={prompt.avgRating} reviews={prompt.reviews?.length ?? 0} />
        </div>
        {locked ? (
          <div className="form-panel premium-lock-panel">
            <h3>Premium review access</h3>
            <p>Reviews are available after unlocking this private prompt.</p>
            <Link className="button" href={`/payment?from=/prompts/${id}`}>Unlock Review Access</Link>
          </div>
        ) : (
          <form className="form-panel review-composer" onSubmit={review}>
            <div className="review-rating-row">
              <div>
                <span className="eyebrow">Your rating</span>
                <strong>Tap a star to rate this prompt</strong>
              </div>
              <RatingStars value={reviewRating} size={24} interactive onChange={setReviewRating} />
            </div>
            <label>
              Comment
              <textarea name="comment" rows={4} required minLength={4} placeholder="Share what worked, where it helped, or how it could improve." />
            </label>
            <button className="button" type="submit">
              <Send size={18} /> Submit Review
            </button>
          </form>
        )}
        <div className="review-list">
          {prompt.reviews?.map((review) => (
            <article className="review-card" key={review._id}>
              <div className="card-bottom">
                <strong>{review.user?.name}</strong>
                <span>{review.user?.email}</span>
                <RatingStars value={review.rating} size={14} />
                <span>{formatDate(review.createdAt)}</span>
              </div>
              <p>{review.comment}</p>
            </article>
          ))}
        </div>
      </article>

      <aside className="details-panel detail-side-panel ring-1 ring-white/10">
        <h2>Creator Information</h2>
        <div className="profile-mini">
          <CreatorAvatar creator={prompt.creator} />
          <div>
            <strong>{prompt.creator?.name}</strong>
            <span>{prompt.creator?.email}</span>
          </div>
        </div>

        <div className="creator-metric-grid">
          <div className="stat-card">
            <strong>{prompt.copyCount}</strong>
            <span>Copies</span>
          </div>
          <RatingBadge value={prompt.avgRating} reviews={prompt.reviews?.length ?? 0} />
        </div>

        <div className="action-row">
          <button className={cn("button secondary bookmark-action", prompt.isBookmarked && "saved")} onClick={bookmark}>
            {prompt.isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />} {prompt.isBookmarked ? "Bookmarked" : "Bookmark"}
          </button>
          <button className={cn("button secondary copy-action", copied && "copied")} onClick={copyPrompt}>
            {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />} {locked ? "Unlock Copy" : copied ? "Copied" : "Copy"}
          </button>
          <button className="button secondary" onClick={share}>
            <Share2 size={18} /> Share
          </button>
          <button className="button secondary" onClick={forkPrompt}>
            <GitFork size={18} /> {locked ? "Unlock Fork" : "Fork"}
          </button>
          <button className="button secondary" onClick={downloadPdf}>
            <Download size={18} /> {locked ? "Unlock PDF" : "PDF"}
          </button>
          <button className="button danger" onClick={() => setReporting(true)}>
            <Flag size={18} /> Report
          </button>
        </div>

        <div className="payment-panel" style={{ marginTop: 18 }}>
          <h2>
            <Sparkles size={20} /> Prompt Quality Scan
          </h2>
          <p>{locked ? "Unlock this private prompt to scan its structure, clarity, and output readiness." : "Scan structure, context, output format, and missing constraints before you use the prompt."}</p>
          <button className="button qa-scan-button" onClick={testPrompt} disabled={testing}>
            {testing ? "Scanning..." : locked ? "Unlock Scan" : "Run Quality Scan"}
          </button>
          <PromptTestReport report={testReport} output={testOutput} />
        </div>
      </aside>
      {reporting && <ReportModal promptId={id} onClose={() => setReporting(false)} />}
    </section>
  );
}
