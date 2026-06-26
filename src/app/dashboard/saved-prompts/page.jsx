"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { BookmarkX } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Spinner } from "@/components/Spinner";
import { EmptyState } from "@/components/dashboard/NeuralWidgets";

export default function SavedPromptsPage() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      setItems(await apiFetch("/api/bookmarks"));
    } catch (requestError) {
      const message = requestError?.message ?? "Could not load saved prompts.";
      setError(message);
      toast.error(message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    try {
      await apiFetch(`/api/bookmarks/${id}`, { method: "DELETE" });
      toast.success("Bookmark removed");
      load();
    } catch (requestError) {
      toast.error(requestError?.message ?? "Could not remove bookmark.");
    }
  }

  if (error) return <EmptyState title="Saved prompts unavailable" text={error} actionHref="/dashboard" actionLabel="Back to Dashboard" />;
  if (!items) return <Spinner />;

  return (
    <>
      <div className="page-heading" style={{ width: "100%", margin: 0 }}>
        <p className="eyebrow">Saved prompts</p>
        <h1>Your bookmarked prompts</h1>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Prompt</th>
              <th>Category</th>
              <th>Tool</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const prompt = item.promptId;
              return (
                <tr key={item._id}>
                  <td>{prompt?.title}</td>
                  <td>{prompt?.category}</td>
                  <td>{prompt?.aiTool}</td>
                  <td className="action-row">
                    <Link className="button small secondary" href={`/prompts/${prompt?._id}`}>View Details</Link>
                    <button className="icon-button" onClick={() => remove(prompt?._id)} title="Remove bookmark">
                      <BookmarkX size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
