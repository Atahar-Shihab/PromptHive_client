"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GitFork, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "react-toastify";
import { apiFetch } from "@/lib/api";

const CATEGORIES = ["Marketing", "Writing", "Design", "Engineering", "Productivity", "Lifestyle", "Sales", "Other"];
const AI_TOOLS = ["ChatGPT-4o", "Claude 3.5 Sonnet", "Gemini 2.5 Flash", "Midjourney v6", "DALL-E 3", "DeepSeek", "Other LLM"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

export function PromptRemixModal({ prompt, isOpen, onClose }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: prompt?.title ? `${prompt.title} (Remix)` : "Remixed Prompt",
    description: prompt?.description || "",
    content: prompt?.content || "",
    category: prompt?.category || "Marketing",
    aiTool: prompt?.aiTool || "ChatGPT-4o",
    difficulty: prompt?.difficulty || "Intermediate",
    tags: (prompt?.tags || []).join(", ")
  });

  if (!isOpen || !prompt) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim().replace(/^#/, "").toLowerCase())
        .filter(Boolean);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: formData.content.trim(),
        category: formData.category,
        aiTool: formData.aiTool,
        difficulty: formData.difficulty,
        tags: tagsArray
      };

      const res = await apiFetch(`/api/prompts/${prompt._id}/fork`, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      toast.success("Prompt remixed and submitted for community review!");
      onClose();
      router.push(`/dashboard/my-prompts`);
    } catch (err) {
      toast.error(err.message || "Failed to create prompt remix.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="remix-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="remix-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="remix-modal-header">
          <div className="remix-header-titles">
            <span className="eyebrow flex items-center gap-1.5">
              <GitFork size={14} className="text-cyan-400" /> Prompt Remix Studio
            </span>
            <h2>Create Your Customized Remix</h2>
            <p className="remix-source-hint">
              Forking from <strong>{prompt.title}</strong> by {prompt.creator?.name || "Original Creator"}
            </p>
          </div>
          <button type="button" className="remix-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="remix-form">
          <div className="form-grid-2">
            <label className="remix-field">
              <span className="remix-field-label">Remix Title</span>
              <input
                type="text"
                required
                maxLength={120}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="remix-input"
                placeholder="Give your remix a distinct name..."
              />
            </label>

            <label className="remix-field">
              <span className="remix-field-label">Target Model</span>
              <select
                value={formData.aiTool}
                onChange={(e) => setFormData({ ...formData, aiTool: e.target.value })}
                className="remix-select"
              >
                {AI_TOOLS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-grid-2">
            <label className="remix-field">
              <span className="remix-field-label">Workflow Category</span>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="remix-select"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <label className="remix-field">
              <span className="remix-field-label">Skill Difficulty</span>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="remix-select"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="remix-field">
            <span className="remix-field-label">What Did You Improve? (Description)</span>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="remix-input"
              placeholder="Explain how your remix enhances the workflow or adds constraints..."
            />
          </label>

          <label className="remix-field">
            <span className="remix-field-label">Tags (comma separated)</span>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="remix-input"
              placeholder="saas, marketing, b2b, automation..."
            />
          </label>

          <label className="remix-field">
            <span className="remix-field-label">Remixed Prompt Architecture</span>
            <textarea
              required
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="remix-textarea"
              placeholder="Edit your prompt instructions, variables, and output schema..."
            />
          </label>

          <div className="remix-modal-footer">
            <button type="button" className="button secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="button" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Publishing Remix...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Publish Remix to Dashboard
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
