"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bold, Code2, Eye, Heading2, Italic, List, PencilLine, Quote } from "lucide-react";

const tools = [
  { icon: Heading2, label: "Heading", type: "line", prefix: "## ", fallback: "Section title" },
  { icon: Bold, label: "Bold", prefix: "**", suffix: "**", fallback: "bold text" },
  { icon: Italic, label: "Italic", prefix: "_", suffix: "_", fallback: "italic text" },
  { icon: List, label: "List", type: "line", prefix: "- ", fallback: "List item" },
  { icon: Quote, label: "Quote", type: "line", prefix: "> ", fallback: "Quoted note" },
  { icon: Code2, label: "Code", prefix: "`", suffix: "`", fallback: "variable" }
];

export function MarkdownEditor({ value, onChange }) {
  const textareaRef = useRef(null);
  const [mode, setMode] = useState("write");

  function fallbackForPrefix(prefix) {
    if (prefix === "## ") return "Section title";
    if (prefix === "- ") return "List item";
    if (prefix === "> ") return "Quoted note";
    return "";
  }

  function formatLines(prefix, text) {
    return text
      .split("\n")
      .map((line) => {
        const cleanLine = line.replace(/^(#{1,6}\s+|[-*]\s+|>\s+)/, "").trimEnd();
        return `${prefix}${cleanLine || fallbackForPrefix(prefix)}`;
      })
      .join("\n");
  }

  function insert(tool) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    const selected = value.slice(start, end);
    const before = value.slice(0, start);
    const after = value.slice(end);
    const suffix = tool.suffix ?? "";
    const fallback = tool.fallback ?? "";
    const selectedOrFallback = selected || fallback;
    const needsLeadingBreak = tool.type === "line" && before && !before.endsWith("\n");
    const needsTrailingBreak = tool.type === "line" && after && !after.startsWith("\n");
    const core = tool.type === "line" ? formatLines(tool.prefix, selectedOrFallback) : `${tool.prefix}${selectedOrFallback}${suffix}`;
    const replacement = `${needsLeadingBreak ? "\n" : ""}${core}${needsTrailingBreak ? "\n" : ""}`;

    onChange(`${before}${replacement}${after}`);

    window.requestAnimationFrame(() => {
      textarea.focus();
      const nextPosition = start + replacement.length;
      textarea.setSelectionRange(nextPosition, nextPosition);
    });
  }

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
          <div className="editor-toolbar">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button type="button" className="icon-button" key={tool.label} onClick={() => insert(tool)} title={tool.label}>
                  <Icon size={16} />
                </button>
              );
            })}
          </div>
          <textarea ref={textareaRef} value={value} onChange={(event) => onChange(event.target.value)} rows={14} required />
        </div>
        <div className={mode === "preview" ? "markdown-preview active" : "markdown-preview"}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || "Preview appears here as you write."}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
