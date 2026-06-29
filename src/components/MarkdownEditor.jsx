"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Eye, PencilLine, Sparkles } from "lucide-react";

export function MarkdownEditor({ value, onChange }) {
  const [mode, setMode] = useState("write");

  return (
    <div className="markdown-editor-shell">
      <div className="editor-mode-tabs" role="tablist" aria-label="Prompt editor mode">
        <button type="button" className={mode === "write" ? "active" : ""} onClick={() => setMode("write")}>
          <PencilLine size={16} /> Write
        </button>
        <button type="button" className={mode === "preview" ? "active" : ""} onClick={() => setMode("preview")}>
          <Eye size={16} /> Preview
        </button>
      </div>
      <div className="editor-grid">
        <div className={mode === "write" ? "editor-pane active" : "editor-pane"}>
          <div className="prompt-editor-guide">
            <Sparkles size={16} />
            <span>Write the final prompt exactly how someone should use it.</span>
          </div>
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={14}
            required
            placeholder="Example: Act as a senior product strategist. Review the following SaaS landing page copy, identify the strongest conversion angle, rewrite the headline, and provide three alternative CTAs with reasoning."
          />
        </div>
        <div className={mode === "preview" ? "markdown-preview active" : "markdown-preview"}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || "Your prompt preview will appear here."}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
