"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "react-toastify";
import { Check, CheckCircle2, Clock3, Copy, Eye, FileText, Layers3, Lock, ShieldCheck, Sparkles, Star, Trash2, UserRound, X, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Spinner } from "@/components/Spinner";
import { EmptyState } from "@/components/dashboard/NeuralWidgets";

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [busyId, setBusyId] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [decisionDialog, setDecisionDialog] = useState(null);
  const [rejectionFeedback, setRejectionFeedback] = useState("");

  async function load() {
    try {
      setError("");
      const params = new URLSearchParams({ admin: "true", limit: "100", sort: "latest" });
      const result = await apiFetch(`/api/prompts?${params.toString()}`);
      setPrompts(result.data);
    } catch (requestError) {
      const message = requestError?.message ?? "Could not load prompts.";
      setError(message);
      toast.error(message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openRejectDialog(prompt) {
    setRejectionFeedback(prompt.rejectionFeedback ?? "");
    setDecisionDialog({ type: "reject", prompt });
  }

  function openDeleteDialog(prompt) {
    setDecisionDialog({ type: "delete", prompt });
  }

  function closeDecisionDialog() {
    if (busyId) return;
    setDecisionDialog(null);
    setRejectionFeedback("");
  }

  async function moderate(id, status, feedback = "") {
    const feedbackText = feedback.trim();
    if (status === "rejected" && !feedbackText) {
      toast.error("Please add rejection feedback.");
      return;
    }
    try {
      setBusyId(`${id}-${status}`);
      await apiFetch(`/api/prompts/${id}/moderation`, {
        method: "PATCH",
        body: JSON.stringify({ status, rejectionFeedback: feedbackText })
      });
      toast.success(`Prompt ${status}`);
      setSelectedPrompt(null);
      closeDecisionDialog();
      load();
    } catch (requestError) {
      toast.error(requestError?.message ?? `Could not mark prompt as ${status}.`);
    } finally {
      setBusyId("");
    }
  }

  async function feature(id) {
    try {
      setBusyId(`${id}-feature`);
      await apiFetch(`/api/prompts/${id}/feature`, { method: "PATCH" });
      toast.success("Featured status changed");
      setSelectedPrompt((current) => (current?._id === id ? { ...current, featured: !current.featured } : current));
      load();
    } catch (requestError) {
      toast.error(requestError?.message ?? "Could not change featured status.");
    } finally {
      setBusyId("");
    }
  }

  async function remove(id) {
    try {
      setBusyId(`${id}-delete`);
      await apiFetch(`/api/prompts/${id}`, { method: "DELETE" });
      toast.success("Prompt deleted");
      setSelectedPrompt(null);
      closeDecisionDialog();
      load();
    } catch (requestError) {
      toast.error(requestError?.message ?? "Could not delete prompt.");
    } finally {
      setBusyId("");
    }
  }

  if (error) return <EmptyState title="Prompts unavailable" text={error} actionHref="/admin" actionLabel="Back to Admin" />;
  if (!prompts) return <Spinner />;

  const counts = prompts.reduce(
    (summary, item) => {
      summary.all += 1;
      summary[item.status] = (summary[item.status] ?? 0) + 1;
      return summary;
    },
    { all: 0, pending: 0, approved: 0, rejected: 0 }
  );
  const visiblePrompts = statusFilter === "all" ? prompts : prompts.filter((item) => item.status === statusFilter);
  const tabs = [
    { value: "pending", label: "Pending Review", hint: "Needs decision", count: counts.pending, icon: Clock3 },
    { value: "approved", label: "Approved", hint: "Live marketplace", count: counts.approved, icon: CheckCircle2 },
    { value: "rejected", label: "Rejected", hint: "Returned with feedback", count: counts.rejected, icon: XCircle },
    { value: "all", label: "All Prompts", hint: "Full archive", count: counts.all, icon: Layers3 }
  ];

  return (
    <>
      <div className="admin-queue-hero">
        <div>
          <p className="eyebrow">Admin moderation</p>
          <h1>Prompt review queue</h1>
          <p>Review pending creator submissions, approve polished prompts, reject weak entries with feedback, and feature the best marketplace content.</p>
        </div>
        <div className="admin-queue-summary">
          <span><ShieldCheck size={18} /> {counts.pending}</span>
          <strong>waiting for review</strong>
          <small>{counts.approved} approved / {counts.rejected} rejected</small>
        </div>
      </div>
      <div className="admin-review-tabs" aria-label="Prompt status filter">
        {tabs.map(({ value, label, hint, count, icon: Icon }) => (
          <button className={statusFilter === value ? `active ${value}` : value} key={value} type="button" onClick={() => setStatusFilter(value)}>
            <span className="admin-tab-icon"><Icon size={17} /></span>
            <span className="admin-tab-copy">
              <strong>{label}</strong>
              <small>{hint}</small>
            </span>
            <b>{count}</b>
          </button>
        ))}
      </div>
      <div className="table-wrap admin-moderation-table">
        {visiblePrompts.length ? (
          <table>
            <thead><tr><th>Prompt</th><th>Creator</th><th>Status</th><th>Visibility</th><th>Actions</th></tr></thead>
            <tbody>
              {visiblePrompts.map((prompt) => (
                <tr
                  key={prompt._id}
                  className="admin-review-row"
                  tabIndex={0}
                  onClick={() => setSelectedPrompt(prompt)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") setSelectedPrompt(prompt);
                  }}
                >
                  <td>
                    <button className="admin-prompt-title admin-prompt-title-button" type="button" onClick={(event) => {
                      event.stopPropagation();
                      setSelectedPrompt(prompt);
                    }}>
                      <span className="admin-prompt-doc-icon"><FileText size={16} /></span>
                      <span>{prompt.title}</span>
                    </button>
                  </td>
                  <td>{prompt.creator?.name || prompt.creator?.email || "Unknown creator"}</td>
                  <td><span className={`stamp-badge stamp-badge--${prompt.status}`}>{prompt.status}</span></td>
                  <td>{prompt.visibility}</td>
                  <td className="admin-action-row">
                    <button className="admin-action-btn approve" disabled={Boolean(busyId)} title="Approve" onClick={(event) => { event.stopPropagation(); moderate(prompt._id, "approved"); }}><Check size={16} /> Approve</button>
                    <button className="admin-action-btn reject" disabled={Boolean(busyId)} title="Reject" onClick={(event) => { event.stopPropagation(); openRejectDialog(prompt); }}><X size={16} /> Reject</button>
                    <button className="admin-action-btn feature" disabled={Boolean(busyId)} title="Feature" onClick={(event) => { event.stopPropagation(); feature(prompt._id); }}><Star size={16} /> Feature</button>
                    <button className="admin-action-btn delete" disabled={Boolean(busyId)} title="Delete" onClick={(event) => { event.stopPropagation(); openDeleteDialog(prompt); }}><Trash2 size={16} /> Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState title="No prompts in this queue" text="Submitted prompts will appear here automatically with pending status. Try All Prompts if you want to audit every item." />
        )}
      </div>
      {selectedPrompt && (
        <div className="admin-review-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-review-title" onClick={() => setSelectedPrompt(null)}>
          <article className="admin-review-panel" onClick={(event) => event.stopPropagation()}>
            <button className="icon-button admin-review-close" type="button" aria-label="Close review card" onClick={() => setSelectedPrompt(null)}>
              <X size={18} />
            </button>
            <div className="admin-review-cover">
              <img
                src={selectedPrompt.thumbnailUrl || "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80"}
                alt=""
              />
              <div className="admin-review-cover-scrim" />
              <div className="admin-review-cover-copy">
                <span className={`stamp-badge stamp-badge--${selectedPrompt.status}`}>{selectedPrompt.status}</span>
                {selectedPrompt.visibility === "private" && <span className="stamp-badge stamp-badge--premium"><Lock size={13} /> Premium</span>}
                <h2 id="admin-review-title">{selectedPrompt.title}</h2>
                <p>{selectedPrompt.description}</p>
              </div>
            </div>
            <div className="admin-review-body">
              <aside className="admin-review-meta-card">
                <p className="eyebrow">Submission Details</p>
                <div className="admin-review-meta-list">
                  <span><Sparkles size={15} /> {selectedPrompt.category}</span>
                  <span><FileText size={15} /> {selectedPrompt.aiTool}</span>
                  <span><ShieldCheck size={15} /> {selectedPrompt.difficulty}</span>
                  <span><Copy size={15} /> {selectedPrompt.copyCount ?? 0} copies</span>
                  <span><UserRound size={15} /> {selectedPrompt.creator?.name || "Unknown creator"}</span>
                </div>
                <div className="tag-row admin-review-tags">
                  {selectedPrompt.tags?.length ? selectedPrompt.tags.map((tag) => <span key={tag}>#{tag}</span>) : <span>No tags</span>}
                </div>
                <div className="admin-review-actions">
                  <button className="admin-action-btn approve" disabled={Boolean(busyId)} onClick={() => moderate(selectedPrompt._id, "approved")}><Check size={16} /> Approve</button>
                  <button className="admin-action-btn reject" disabled={Boolean(busyId)} onClick={() => openRejectDialog(selectedPrompt)}><X size={16} /> Reject</button>
                  <button className="admin-action-btn feature" disabled={Boolean(busyId)} onClick={() => feature(selectedPrompt._id)}><Star size={16} /> {selectedPrompt.featured ? "Unfeature" : "Feature"}</button>
                  <Link className="admin-action-btn" href={`/prompts/${selectedPrompt._id}`}><Eye size={16} /> Open Page</Link>
                </div>
              </aside>
              <section className="admin-review-content-card">
                <div className="admin-review-section-head">
                  <p className="eyebrow">Prompt Content</p>
                  <small>Review quality before approval</small>
                </div>
                <div className="admin-review-markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedPrompt.content}</ReactMarkdown>
                </div>
                {selectedPrompt.rejectionFeedback && (
                  <div className="admin-review-feedback">
                    <strong>Rejection feedback</strong>
                    <p>{selectedPrompt.rejectionFeedback}</p>
                  </div>
                )}
              </section>
            </div>
          </article>
        </div>
      )}
      {decisionDialog && (
        <div className="admin-decision-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-decision-title" onClick={closeDecisionDialog}>
          <article className="admin-decision-card" onClick={(event) => event.stopPropagation()}>
            <button className="icon-button admin-decision-close" type="button" aria-label="Close dialog" onClick={closeDecisionDialog}>
              <X size={18} />
            </button>
            <div className={decisionDialog.type === "delete" ? "admin-decision-icon danger" : "admin-decision-icon"}>
              {decisionDialog.type === "delete" ? <Trash2 size={22} /> : <XCircle size={22} />}
            </div>
            <p className="eyebrow">{decisionDialog.type === "delete" ? "Delete Prompt" : "Reject Submission"}</p>
            <h2 id="admin-decision-title">
              {decisionDialog.type === "delete" ? "Remove this prompt permanently?" : "Add clear rejection feedback"}
            </h2>
            <p className="admin-decision-copy">
              <strong>{decisionDialog.prompt.title}</strong>
              {decisionDialog.type === "delete"
                ? " will be deleted from the marketplace database. This action cannot be undone."
                : " will be returned to the creator with your feedback so they know what to improve."}
            </p>
            {decisionDialog.type === "reject" && (
              <label className="admin-decision-field">
                Feedback for creator
                <textarea
                  value={rejectionFeedback}
                  onChange={(event) => setRejectionFeedback(event.target.value)}
                  rows={5}
                  placeholder="Example: Please make the prompt more specific, add clearer usage instructions, and remove placeholder text."
                  autoFocus
                />
              </label>
            )}
            <div className="admin-decision-actions">
              <button className="button secondary" type="button" disabled={Boolean(busyId)} onClick={closeDecisionDialog}>
                Cancel
              </button>
              {decisionDialog.type === "delete" ? (
                <button className="button danger" type="button" disabled={Boolean(busyId)} onClick={() => remove(decisionDialog.prompt._id)}>
                  <Trash2 size={17} /> Delete Prompt
                </button>
              ) : (
                <button className="button danger" type="button" disabled={Boolean(busyId)} onClick={() => moderate(decisionDialog.prompt._id, "rejected", rejectionFeedback)}>
                  <X size={17} /> Reject Prompt
                </button>
              )}
            </div>
          </article>
        </div>
      )}
    </>
  );
}
