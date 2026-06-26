"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Check, FileText, ShieldCheck, Star, Trash2, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Spinner } from "@/components/Spinner";
import { EmptyState } from "@/components/dashboard/NeuralWidgets";

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [busyId, setBusyId] = useState("");

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

  async function moderate(id, status) {
    const rejectionFeedback = status === "rejected" ? prompt("Rejection feedback") : "";
    if (status === "rejected" && !rejectionFeedback) return;
    try {
      setBusyId(`${id}-${status}`);
      await apiFetch(`/api/prompts/${id}/moderation`, {
        method: "PATCH",
        body: JSON.stringify({ status, rejectionFeedback })
      });
      toast.success(`Prompt ${status}`);
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
      load();
    } catch (requestError) {
      toast.error(requestError?.message ?? "Could not change featured status.");
    } finally {
      setBusyId("");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this prompt?")) return;
    try {
      setBusyId(`${id}-delete`);
      await apiFetch(`/api/prompts/${id}`, { method: "DELETE" });
      toast.success("Prompt deleted");
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
    ["pending", "Pending Review", counts.pending],
    ["approved", "Approved", counts.approved],
    ["rejected", "Rejected", counts.rejected],
    ["all", "All Prompts", counts.all]
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
        {tabs.map(([value, label, count]) => (
          <button className={statusFilter === value ? "active" : ""} key={value} type="button" onClick={() => setStatusFilter(value)}>
            <span>{label}</span>
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
                <tr key={prompt._id}>
                  <td>
                    <Link className="admin-prompt-title" href={`/prompts/${prompt._id}`}>
                      <FileText size={16} />
                      <span>{prompt.title}</span>
                    </Link>
                  </td>
                  <td>{prompt.creator?.name || prompt.creator?.email || "Unknown creator"}</td>
                  <td><span className={`stamp-badge stamp-badge--${prompt.status}`}>{prompt.status}</span></td>
                  <td>{prompt.visibility}</td>
                  <td className="admin-action-row">
                    <button className="admin-action-btn approve" disabled={Boolean(busyId)} title="Approve" onClick={() => moderate(prompt._id, "approved")}><Check size={16} /> Approve</button>
                    <button className="admin-action-btn reject" disabled={Boolean(busyId)} title="Reject" onClick={() => moderate(prompt._id, "rejected")}><X size={16} /> Reject</button>
                    <button className="admin-action-btn feature" disabled={Boolean(busyId)} title="Feature" onClick={() => feature(prompt._id)}><Star size={16} /> Feature</button>
                    <button className="admin-action-btn delete" disabled={Boolean(busyId)} title="Delete" onClick={() => remove(prompt._id)}><Trash2 size={16} /> Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState title="No prompts in this queue" text="Submitted prompts will appear here automatically with pending status. Try All Prompts if you want to audit every item." />
        )}
      </div>
    </>
  );
}
