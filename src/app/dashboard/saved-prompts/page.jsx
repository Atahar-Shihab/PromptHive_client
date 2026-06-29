"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { ArrowRight, BookmarkCheck, BookmarkX, Eye, Sparkles } from "lucide-react";
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
    <section className="saved-library-page">
      <div className="saved-library-hero">
        <div>
          <p className="dashboard-kicker">Saved prompts</p>
          <h1>Your bookmarked prompt library</h1>
          <p>Every saved prompt is kept here with a quick path back to its full details, copy tools, reviews, and premium state.</p>
        </div>
        <Link href="/prompts" className="saved-library-hero-action">
          <Sparkles size={18} /> Explore more <ArrowRight size={16} />
        </Link>
      </div>

      {!items.length ? (
        <EmptyState title="Saved library is empty" text="Bookmark prompts from the marketplace to build your personal collection." actionHref="/prompts" actionLabel="Browse Prompts" />
      ) : (
        <div className="saved-library-grid">
          {items.map((item) => {
            const prompt = item.promptId;
            if (!prompt?._id) return null;
            return (
              <article key={item._id} className="saved-prompt-card">
                <div className="saved-prompt-card-top">
                  <span className="saved-prompt-badge">
                    <BookmarkCheck size={14} /> Saved
                  </span>
                  <span className={prompt.visibility === "private" ? "saved-prompt-access premium" : "saved-prompt-access"}>
                    {prompt.visibility === "private" ? "Premium" : "Public"}
                  </span>
                </div>
                <h2>{prompt.title}</h2>
                <p>{prompt.description}</p>
                <div className="saved-prompt-meta">
                  <span>{prompt.category}</span>
                  <span>{prompt.aiTool}</span>
                  <span>{prompt.difficulty}</span>
                </div>
                <div className="saved-prompt-actions">
                  <Link href={`/prompts/${prompt._id}`} className="dashboard-view-button">
                    <Eye size={15} /> View Details
                  </Link>
                  <button className="dashboard-remove-button" onClick={() => remove(prompt._id)} type="button">
                    <BookmarkX size={15} /> Remove
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
