"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { BarChart3, Pencil, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Spinner } from "@/components/Spinner";
import { EmptyState } from "@/components/dashboard/NeuralWidgets";

export default function MyPromptsPage() {
  const [prompts, setPrompts] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      const result = await apiFetch("/api/prompts/mine/list?limit=30");
      setPrompts(result.data);
    } catch (requestError) {
      const message = requestError?.message ?? "Could not load your prompts.";
      setError(message);
      toast.error(message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    if (!confirm("Delete this prompt?")) return;
    try {
      await apiFetch(`/api/prompts/${id}`, { method: "DELETE" });
      toast.success("Prompt deleted");
      load();
    } catch (requestError) {
      toast.error(requestError?.message ?? "Could not delete prompt.");
    }
  }

  if (error) return <EmptyState title="Prompts unavailable" text={error} actionHref="/dashboard" actionLabel="Back to Dashboard" />;
  if (!prompts) return <Spinner />;

  return (
    <>
      <div className="page-heading" style={{ width: "100%", margin: 0 }}>
        <p className="eyebrow">My prompts</p>
        <h1>Manage your submissions</h1>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Prompt</th>
              <th>Tool</th>
              <th>Status</th>
              <th>Copies</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {prompts.map((prompt) => (
              <tr key={prompt._id}>
                <td>{prompt.title}</td>
                <td>{prompt.aiTool}</td>
                <td><span className={`stamp-badge stamp-badge--${prompt.status}`}>{prompt.status}</span></td>
                <td>{prompt.copyCount}</td>
                <td>{formatDate(prompt.createdAt)}</td>
                <td className="action-row">
                  <Link className="icon-button" href={`/dashboard/edit-prompt/${prompt._id}`} title="Update">
                    <Pencil size={16} />
                  </Link>
                  <Link className="icon-button" href={`/prompts/${prompt._id}`} title="View analytics">
                    <BarChart3 size={16} />
                  </Link>
                  <button className="icon-button" onClick={() => remove(prompt._id)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
