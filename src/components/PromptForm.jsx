"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Upload } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { categories, difficulties, tools } from "@/lib/constants";
import { MarkdownEditor } from "./MarkdownEditor";

export function PromptForm({ prompt, redirectTo = "/dashboard/my-prompts" }) {
  const router = useRouter();
  const [content, setContent] = useState(prompt?.content ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(prompt?.thumbnailUrl ?? "");
  const [uploading, setUploading] = useState(false);

  async function uploadImage(file) {
    if (!file) return;
    const form = new FormData();
    form.append("image", file);
    setUploading(true);
    try {
      const result = await apiFetch("/api/uploads", { method: "POST", body: form });
      setThumbnailUrl(result.url);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error?.message ?? "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = {
      title: String(data.get("title")),
      description: String(data.get("description")),
      content,
      category: String(data.get("category")),
      aiTool: String(data.get("aiTool")),
      tags: String(data.get("tags"))
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      difficulty: String(data.get("difficulty")),
      visibility: String(data.get("visibility")),
      thumbnailUrl
    };

    try {
      await apiFetch(prompt ? `/api/prompts/${prompt._id}` : "/api/prompts", {
        method: prompt ? "PATCH" : "POST",
        body: JSON.stringify(body)
      });
      toast.success(prompt ? "Prompt updated and sent for review" : "Prompt submitted to the admin review queue");
      router.push(redirectTo);
    } catch (error) {
      toast.error(error?.message ?? "Prompt could not be saved");
    }
  }

  return (
    <form className="form-panel" onSubmit={submit}>
      <div className="form-grid">
        <label>
          Prompt Title
          <input name="title" defaultValue={prompt?.title} required minLength={4} />
        </label>
        <label>
          Category
          <select name="category" defaultValue={prompt?.category ?? categories[0]}>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          AI Tool
          <select name="aiTool" defaultValue={prompt?.aiTool ?? tools[0]}>
            {tools.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Difficulty Level
          <select name="difficulty" defaultValue={prompt?.difficulty ?? "Beginner"}>
            {difficulties.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Visibility
          <select name="visibility" defaultValue={prompt?.visibility ?? "public"}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </label>
        <label>
          Tags
          <input name="tags" defaultValue={prompt?.tags?.join(", ")} placeholder="automation, research, launch" />
        </label>
      </div>
      <label>
        Prompt Description
        <textarea name="description" defaultValue={prompt?.description} rows={3} required minLength={10} />
      </label>
      <label>
        Thumbnail Image
        <span className="upload-row">
          <input type="file" accept="image/*" onChange={(event) => uploadImage(event.target.files?.[0])} />
          <Upload size={18} />
          {uploading ? "Uploading..." : thumbnailUrl || "Choose image"}
        </span>
      </label>
      <label>
        Prompt Content
        <MarkdownEditor value={content} onChange={setContent} />
      </label>
      <div className="submission-note">
        New and updated prompts are saved as <strong>pending</strong> until an admin approves them for the marketplace.
      </div>
      <button className="button" type="submit">
        {prompt ? "Update Prompt" : "Submit Prompt"}
      </button>
    </form>
  );
}
