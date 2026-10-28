"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sliders, Sparkles, Wand2 } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/format";

export function PromptVariablePlayground({ content = "", title = "", locked = false, onRemix }) {
  // Extract placeholders like {{variable}} or {variable}
  const detectedVariables = useMemo(() => {
    if (!content) return [];
    const matches = content.match(/\{\{([a-zA-Z0-9_\-\s]+)\}\}|\{([a-zA-Z0-9_\-\s]+)\}/g) || [];
    const uniqueKeys = [];
    matches.forEach((m) => {
      const cleanKey = m.replace(/[\{\}]/g, "").trim();
      if (cleanKey && !uniqueKeys.some((item) => item.key === cleanKey)) {
        uniqueKeys.push({
          raw: m,
          key: cleanKey,
          label: cleanKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        });
      }
    });
    return uniqueKeys;
  }, [content]);

  const [values, setValues] = useState({});
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState("customized"); // "customized" | "raw"

  // Interpolate user values into the content
  const customizedContent = useMemo(() => {
    if (!content) return "";
    let output = content;
    detectedVariables.forEach((v) => {
      const val = values[v.key]?.trim();
      if (val) {
        // Replace all instances of {{key}} or {key}
        output = output.split(v.raw).join(val);
      }
    });
    return output;
  }, [content, detectedVariables, values]);

  const hasEdits = Object.values(values).some((v) => v && v.trim().length > 0);

  function handleReset() {
    setValues({});
    toast.info("Variables reset to template defaults.");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(customizedContent);
      setCopied(true);
      toast.success("Customized prompt copied to clipboard!");
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error("Could not copy prompt.");
    }
  }

  if (detectedVariables.length === 0) {
    return null;
  }

  return (
    <div className="variable-playground-card ring-1 ring-white/10">
      <div className="playground-header">
        <div className="playground-title-group">
          <span className="eyebrow flex items-center gap-1.5">
            <Sliders size={14} className="text-cyan-400" /> Interactive Variable Tuner
          </span>
          <h3>Customize Dynamic Parameters</h3>
          <p>
            Fill in the template variable slots below to live-generate your project-ready prompt before copying or running.
          </p>
        </div>

        <div className="playground-mode-toggle">
          <button
            type="button"
            className={cn("playground-toggle-btn", viewMode === "customized" && "active")}
            onClick={() => setViewMode("customized")}
          >
            <Wand2 size={13} /> Customized
          </button>
          <button
            type="button"
            className={cn("playground-toggle-btn", viewMode === "raw" && "active")}
            onClick={() => setViewMode("raw")}
          >
            Original Slots ({detectedVariables.length})
          </button>
        </div>
      </div>

      {/* Variable Input Grid */}
      <div className="variable-input-grid">
        {detectedVariables.map((v) => (
          <div key={v.key} className="variable-input-item">
            <label htmlFor={`var-${v.key}`} className="variable-label">
              <span className="variable-tag-badge">{"{{" + v.key + "}}"}</span>
              <span className="variable-name">{v.label}</span>
            </label>
            <input
              id={`var-${v.key}`}
              type="text"
              disabled={locked}
              className="variable-input"
              placeholder={`Enter ${v.label.toLowerCase()}...`}
              value={values[v.key] || ""}
              onChange={(e) => setValues((prev) => ({ ...prev, [v.key]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      {/* Playground Actions Bar */}
      <div className="playground-actions-bar">
        <div className="playground-stats">
          <span>{detectedVariables.length} variable slots detected</span>
          {hasEdits && <span className="text-emerald-400 font-semibold">• Live parameters applied</span>}
        </div>

        <div className="playground-buttons">
          {hasEdits && (
            <button type="button" className="button small ghost" onClick={handleReset}>
              <RotateCcw size={13} /> Reset
            </button>
          )}

          <button
            type="button"
            className={cn("button small copy-action", copied && "copied")}
            onClick={handleCopy}
            disabled={locked}
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-400" /> Copied
              </>
            ) : (
              <>
                <Copy size={14} /> Copy Customized Prompt
              </>
            )}
          </button>

          {onRemix && (
            <button type="button" className="button small secondary" onClick={onRemix}>
              <Sparkles size={13} className="text-amber-400" /> Remix in Studio
            </button>
          )}
        </div>
      </div>

      {/* Live Preview Screen if in Customized mode and user has values */}
      {viewMode === "customized" && hasEdits && (
        <div className="playground-preview-box">
          <div className="preview-label">Live Preview (Interpolated):</div>
          <pre className="preview-code">
            <code>{customizedContent}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
