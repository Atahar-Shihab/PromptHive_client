"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { apiFetch } from "@/lib/api";
import { PromptForm } from "@/components/PromptForm";
import { Spinner } from "@/components/Spinner";

export default function EditPromptPage() {
  const { id } = useParams();
  const [prompt, setPrompt] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setError("");
    apiFetch(`/api/prompts/${id}`)
      .then((result) => {
        if (alive) setPrompt(result);
      })
      .catch((requestError) => {
        if (!alive) return;
        const message = requestError?.message ?? "Could not load this prompt.";
        setError(message);
        toast.error(message);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  if (error) {
    return (
      <section className="details-layout">
        <article className="details-panel empty-state-panel">
          <AlertTriangle size={34} />
          <h1>Prompt unavailable</h1>
          <p>{error}</p>
          <div className="action-row">
            <button className="button" onClick={() => window.location.reload()}>Try Again</button>
            <Link className="button secondary" href="/dashboard/my-prompts">Back to My Prompts</Link>
          </div>
        </article>
      </section>
    );
  }

  if (!prompt) return <Spinner label="Loading prompt" />;

  return (
    <>
      <div className="page-heading" style={{ width: "100%", margin: 0 }}>
        <p className="eyebrow">Update prompt</p>
        <h1>{prompt.title}</h1>
      </div>
      <PromptForm prompt={prompt} />
    </>
  );
}
