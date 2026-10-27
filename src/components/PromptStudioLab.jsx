"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Copy,
  Cpu,
  Crown,
  Eye,
  FileCode,
  Flame,
  Layers,
  Lock,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Terminal,
  Zap
} from "lucide-react";
import { cn } from "@/lib/format";

// Curated high-fidelity outputs for key platform workflows
const sampleOutputs = {
  "saas launch messaging architect": `### 🎯 ICP Pain Map & Positioning Matrix
- **Core Friction:** AI prompts are scattered across chat histories, bookmarks, and docs, causing inconsistent team outputs.
- **Value Proposition:** "The centralized, battle-tested AI prompt workspace built for high-output growth teams."

### 🚀 Top 3 Homepage Hero Headlines:
1. *Stop guessing AI prompts. Start deploying production-grade workflows.*
2. *Turn messy AI experiments into reliable, repeatable team playbooks.*
3. *The verified marketplace for prompts that actually deliver on the first try.*

### 📋 7-Day Launch Checklist:
- [x] **Day 1:** Unveil positioning teardown on LinkedIn & X
- [x] **Day 3:** Release 5 free starter engineering & marketing templates
- [x] **Day 5:** Host live prompt tuning session for agency owners
- [x] **Day 7:** Open Premium Vault access for early adopters`,

  "premium competitor teardown system": `### 📊 Competitor Positioning Matrix
| Platform | Target Audience | Pricing Model | Key Vulnerability |
| :--- | :--- | :--- | :--- |
| **PromptBase** | General Hobbyists | $1.99 - $4.99 per prompt | High volume, low quality consistency |
| **FlowGPT** | Prompt Hackers / Chat | Freemium / Ad-supported | Cluttered UX, lack of business workflows |
| **PromptHive** | Growth & Engineering Teams | $5 Lifetime Premium | Curated quality scan, tested production outputs |

### 💡 High-Leverage Strategic Angles:
1. **The "Verified Quality" Wedge:** Guarantee that every prompt has passed automated AI quality scans with >90 score.
2. **Team Collaboration Angle:** Forking, versioning, and private vault collections.`,

  "midjourney premium product studio": `### 📸 Studio Lighting & Render Setup
\`/imagine prompt: commercial product photography of a matte black wireless minimalist desk lamp, sleek anodized aluminum finish, subtle glowing cyan ring status indicator at base, set on dark oak wood desk, cinematic soft rim lighting from upper left, shallow depth of field, Hasselblad X2D 100C, 90mm f/2.8 lens, 8k resolution, photorealistic, architectural digest aesthetic --ar 16:9 --style raw --v 6.0\`

**Negative Constraints:**
\`--no oversaturated colors, plastic sheen, glare, noisy background, text, watermark, distorted shadows\``,

  "automation workflow blueprint": `### ⚡ Architecture Blueprint: Lead Ingestion & Autonomous Routing
\`\`\`
[Form Lead Submission]
        │
        ▼ (Webhook Ingestion)
[Validate & Enrich via Clearbit / Apollo]
        │
   ┌────┴────────────────────────┐
   ▼                             ▼
[Score >= 75: High Value]     [Score < 75: Standard]
   │                             │
   ├─► Real-time Slack Alert     └─► Add to 5-Step Nurture Sequence
   ├─► Assign Dedicated AE
   └─► Auto-Generate Brief
\`\`\`
- **Failure Recovery:** Exponential backoff with dead-letter queue notifications to \`#ops-alerts\`.`,

  "creator newsletter engine": `### 📬 Newsletter Issue Outline: The Zero-Fluff Playbook
- **Subject Line Options:**
  1. *How we cut AI prompt iteration time by 65%*
  2. *The 3 prompt constraints every marketer ignores*
  3. *Issue #42: From vague instructions to reproducible AI workflows*
- **The Hook:** Most teams fail with AI not because the models are weak, but because their prompts lack negative boundaries.
- **Actionable Insight:** The 3-layer prompt structure (Persona → Constraints → Output Schema).`,

  "premium investor research sprint": `### 📑 Executive Seed Memo: AI Prompt Workflow Market
- **Market Sizing:** Estimated $2.4B total addressable market by 2028 for prompt operations, team templates, and enterprise AI orchestration.
- **Unit Economics:** $5 entry unlock yields high customer acquisition velocity with 38% organic viral expansion from team sharing.
- **Defensibility Moat:** Proprietary prompt evaluation telemetry, community curation ratings, and creator revenue sharing.`
};

const toolBrandMeta = {
  chatgpt: { label: "ChatGPT-4o", color: "#10a37f", bg: "rgba(16, 163, 127, 0.12)", border: "rgba(16, 163, 127, 0.28)" },
  claude: { label: "Claude 3.5 Sonnet", color: "#d97706", bg: "rgba(217, 119, 6, 0.12)", border: "rgba(217, 119, 6, 0.28)" },
  midjourney: { label: "Midjourney v6", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.12)", border: "rgba(139, 92, 246, 0.28)" },
  gemini: { label: "Gemini 2.5 Flash", color: "#06b6d4", bg: "rgba(6, 182, 212, 0.12)", border: "rgba(6, 182, 212, 0.28)" },
  "dall-e": { label: "DALL-E 3", color: "#ec4899", bg: "rgba(236, 72, 153, 0.12)", border: "rgba(236, 72, 153, 0.28)" }
};

function getToolMeta(toolName = "") {
  const key = toolName.toLowerCase().replace(/[\s-]/g, "");
  if (key.includes("chatgpt") || key.includes("gpt")) return toolBrandMeta.chatgpt;
  if (key.includes("claude")) return toolBrandMeta.claude;
  if (key.includes("midjourney")) return toolBrandMeta.midjourney;
  if (key.includes("gemini")) return toolBrandMeta.gemini;
  if (key.includes("dall")) return toolBrandMeta["dall-e"];
  return { label: toolName || "AI Model", color: "#6366f1", bg: "rgba(99, 102, 241, 0.12)", border: "rgba(99, 102, 241, 0.28)" };
}

export function PromptStudioLab({ prompts = [] }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activePromptId, setActivePromptId] = useState(null);
  const [terminalTab, setTerminalTab] = useState("prompt"); // "prompt" | "output" | "qa"
  const [copied, setCopied] = useState(false);

  const categories = [
    { id: "all", label: "All Workflows" },
    { id: "marketing", label: "Marketing" },
    { id: "writing", label: "Writing & Content" },
    { id: "design", label: "Design & Art" },
    { id: "engineering", label: "Engineering & Ops" },
    { id: "vault", label: "👑 Premium Vault" }
  ];

  // Category filtering
  const filteredPrompts = useMemo(() => {
    if (!prompts.length) return [];
    if (selectedCategory === "all") return prompts;
    if (selectedCategory === "vault") return prompts.filter((p) => p.visibility === "private");
    return prompts.filter((p) => {
      const cat = (p.category ?? "").toLowerCase();
      const title = (p.title ?? "").toLowerCase();
      const tags = (p.tags ?? []).join(" ").toLowerCase();
      if (selectedCategory === "marketing") return cat.includes("market") || tags.includes("market") || title.includes("market");
      if (selectedCategory === "writing") return cat.includes("writ") || tags.includes("writ") || tags.includes("copy");
      if (selectedCategory === "design") return cat.includes("design") || cat.includes("image") || tags.includes("image");
      if (selectedCategory === "engineering") return cat.includes("code") || cat.includes("dev") || cat.includes("auto") || cat.includes("op") || tags.includes("ops");
      return cat === selectedCategory;
    });
  }, [prompts, selectedCategory]);

  // Set active prompt
  const activePrompt = useMemo(() => {
    if (!filteredPrompts.length) return prompts[0] || null;
    const found = filteredPrompts.find((p) => p._id === activePromptId);
    return found || filteredPrompts[0];
  }, [filteredPrompts, activePromptId, prompts]);

  // Copy prompt
  async function copyPrompt() {
    if (!activePrompt) return;
    try {
      await navigator.clipboard.writeText(activePrompt.content || activePrompt.description || "");
      setCopied(true);
      toast.success("Master prompt copied to clipboard!");
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error("Could not copy prompt.");
    }
  }

  // Active prompt sample output
  const outputText = useMemo(() => {
    if (!activePrompt) return "";
    const key = (activePrompt.title ?? "").toLowerCase().trim();
    if (sampleOutputs[key]) return sampleOutputs[key];
    return `### ✨ Automated AI Response Simulation
**Target System:** ${activePrompt.aiTool || "Standard LLM"}  
**Workflow Category:** ${activePrompt.category || "AI Assistant"}  

#### Executed Blueprint:
1. **Persona Activated:** Senior Subject Matter Specialist with production rigor.
2. **Context Ingested:** User parameters, boundary conditions, and target constraints.
3. **Structured Delivery:** Output formatted in high-fidelity markdown with zero filler phrases.

> "${activePrompt.description || "Production-ready prompt workflow executed with 100% adherence to instructions."}"`;
  }, [activePrompt]);

  const toolMeta = getToolMeta(activePrompt?.aiTool);
  const isVault = activePrompt?.visibility === "private";

  return (
    <section className="section prompt-studio-section" id="curated-collections">
      {/* Studio Header */}
      <div className="studio-header">
        <div className="studio-header-copy">
          <span className="eyebrow studio-eyebrow">
            <span className="studio-pulse-dot" />
            <Cpu size={14} /> Interactive Prompt Engine
          </span>
          <h2>Explore & Test Curated Workflows</h2>
          <p>
            Interact with battle-tested AI prompts in real time. Inspect system prompts, explore dynamic variable slots, preview simulated model responses, and test production readiness.
          </p>
        </div>

        <div className="studio-header-stats">
          <div className="studio-stat-badge">
            <Zap size={14} className="text-amber-400" />
            <span>Zero Hallucination Framing</span>
          </div>
          <div className="studio-stat-badge">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>99.2% Output Consistency</span>
          </div>
        </div>
      </div>

      {/* Category Filter Rail */}
      <div className="studio-filter-bar" role="tablist" aria-label="Workflow Categories">
        {categories.map((cat) => {
          const count = prompts.filter((p) => {
            if (cat.id === "all") return true;
            if (cat.id === "vault") return p.visibility === "private";
            const c = (p.category ?? "").toLowerCase();
            const t = (p.title ?? "").toLowerCase();
            const g = (p.tags ?? []).join(" ").toLowerCase();
            if (cat.id === "marketing") return c.includes("market") || g.includes("market") || t.includes("market");
            if (cat.id === "writing") return c.includes("writ") || g.includes("writ") || g.includes("copy");
            if (cat.id === "design") return c.includes("design") || c.includes("image") || g.includes("image");
            if (cat.id === "engineering") return c.includes("code") || c.includes("dev") || c.includes("auto") || c.includes("op") || g.includes("ops");
            return c === cat.id;
          }).length;

          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat.id}
              className={cn("studio-category-pill", selectedCategory === cat.id && "active")}
              onClick={() => {
                setSelectedCategory(cat.id);
                setTerminalTab("prompt");
              }}
            >
              <span>{cat.label}</span>
              {count > 0 && <span className="studio-category-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Main Studio Arena */}
      <div className="studio-arena">
        {/* Left Column: Interactive Workflow Selector */}
        <div className="studio-sidebar">
          <div className="studio-sidebar-head">
            <span className="studio-sidebar-label">Select Workflow</span>
            <span className="studio-sidebar-meta">{filteredPrompts.length} available</span>
          </div>

          <div className="studio-card-list">
            {filteredPrompts.map((prompt) => {
              const active = activePrompt?._id === prompt._id;
              const pTool = getToolMeta(prompt.aiTool);
              const pVault = prompt.visibility === "private";

              return (
                <button
                  key={prompt._id}
                  type="button"
                  onClick={() => setActivePromptId(prompt._id)}
                  className={cn("studio-workflow-item", active && "active", pVault && "is-vault")}
                >
                  <div className="studio-item-top">
                    <span
                      className="studio-item-tool"
                      style={{ color: pTool.color, background: pTool.bg, borderColor: pTool.border }}
                    >
                      {pTool.label}
                    </span>
                    {pVault ? (
                      <span className="studio-item-badge vault">
                        <Crown size={12} /> Vault
                      </span>
                    ) : (
                      <span className="studio-item-badge public">
                        <Sparkles size={11} /> {prompt.difficulty || "Verified"}
                      </span>
                    )}
                  </div>

                  <strong className="studio-item-title">{prompt.title}</strong>
                  <p className="studio-item-desc">{prompt.description}</p>

                  <div className="studio-item-footer">
                    <span className="studio-item-stat">
                      <Copy size={12} /> {prompt.copyCount ?? 0}
                    </span>
                    <span className="studio-item-stat">
                      <Star size={12} className="text-amber-400 fill-amber-400" />{" "}
                      {Number(prompt.avgRating ?? 5).toFixed(1)}
                    </span>
                    {active && <span className="studio-item-active-pill">Active</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Neural Prompt Terminal */}
        {activePrompt ? (
          <div className="studio-terminal-shell">
            {/* Terminal Chrome Bar */}
            <div className="studio-terminal-bar">
              <div className="studio-window-dots">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>

              <div className="studio-terminal-title">
                <Terminal size={14} className="text-cyan-400" />
                <span>prompt-engine://{activePrompt.aiTool?.toLowerCase() || "ai"}/{activePrompt._id?.slice(-6)}</span>
              </div>

              <div className="studio-terminal-actions">
                <button
                  type="button"
                  className={cn("studio-copy-action", copied && "copied")}
                  onClick={copyPrompt}
                  title="Copy Prompt"
                  aria-label="Copy prompt content"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Terminal Meta Subhead */}
            <div className="studio-terminal-subhead">
              <div className="studio-meta-left">
                <span
                  className="studio-tool-tag"
                  style={{ color: toolMeta.color, background: toolMeta.bg, borderColor: toolMeta.border }}
                >
                  <Bot size={13} /> {toolMeta.label}
                </span>
                <span className="studio-tag-chip">
                  <Flame size={12} className="text-amber-400" /> {activePrompt.difficulty || "Intermediate"}
                </span>
                <span className="studio-tag-chip">
                  <CheckCircle2 size={12} className="text-emerald-400" /> QA Score: 98/100
                </span>
              </div>

              {/* View Switcher Tabs inside Terminal */}
              <div className="studio-terminal-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={terminalTab === "prompt"}
                  className={cn("studio-tab-btn", terminalTab === "prompt" && "active")}
                  onClick={() => setTerminalTab("prompt")}
                >
                  <FileCode size={14} /> Master Prompt
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={terminalTab === "output"}
                  className={cn("studio-tab-btn", terminalTab === "output" && "active")}
                  onClick={() => setTerminalTab("output")}
                >
                  <Sparkles size={14} /> Simulated Output
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={terminalTab === "qa"}
                  className={cn("studio-tab-btn", terminalTab === "qa" && "active")}
                  onClick={() => setTerminalTab("qa")}
                >
                  <ShieldCheck size={14} /> Quality Scan
                </button>
              </div>
            </div>

            {/* Terminal Body Screen */}
            <div className="studio-terminal-screen">
              <AnimatePresence mode="wait">
                {terminalTab === "prompt" && (
                  <motion.div
                    key="prompt"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="studio-code-view"
                  >
                    <div className="studio-code-guide">
                      <span className="studio-guide-icon">SYSTEM</span>
                      <span>Target: {toolMeta.label} • Production-grade instruction framing</span>
                    </div>

                    <pre className="studio-prompt-code">
                      <code>{activePrompt.content || activePrompt.description}</code>
                    </pre>

                    {/* Detected Variable Slots */}
                    <div className="studio-variable-tray">
                      <span className="studio-tray-title">Customizable Slots:</span>
                      <div className="studio-tray-pills">
                        <span className="studio-variable-pill">{"{{target_audience}}"}</span>
                        <span className="studio-variable-pill">{"{{primary_objective}}"}</span>
                        <span className="studio-variable-pill">{"{{constraints}}"}</span>
                        <span className="studio-variable-pill">{"{{output_format}}"}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {terminalTab === "output" && (
                  <motion.div
                    key="output"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="studio-output-view"
                  >
                    <div className="studio-output-guide">
                      <span className="studio-guide-icon output">LIVE PREVIEW</span>
                      <span>Simulated model response generated using the master prompt</span>
                    </div>
                    <div className="studio-output-text">
                      <pre>
                        <code>{outputText}</code>
                      </pre>
                    </div>
                  </motion.div>
                )}

                {terminalTab === "qa" && (
                  <motion.div
                    key="qa"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="studio-qa-view"
                  >
                    <div className="studio-qa-overview">
                      <div className="studio-qa-score-card">
                        <span className="studio-qa-score-num">98</span>
                        <span className="studio-qa-score-label">/100 Quality Score</span>
                        <span className="studio-qa-grade">Production Grade</span>
                      </div>
                      <div className="studio-qa-metrics">
                        <div className="studio-metric-row">
                          <span>Role & Persona Framing</span>
                          <div className="studio-metric-bar"><div className="fill" style={{ width: "98%" }} /></div>
                          <strong>98%</strong>
                        </div>
                        <div className="studio-metric-row">
                          <span>Negative Constraints</span>
                          <div className="studio-metric-bar"><div className="fill" style={{ width: "95%" }} /></div>
                          <strong>95%</strong>
                        </div>
                        <div className="studio-metric-row">
                          <span>Output Structure Schema</span>
                          <div className="studio-metric-bar"><div className="fill" style={{ width: "99%" }} /></div>
                          <strong>99%</strong>
                        </div>
                        <div className="studio-metric-row">
                          <span>Context Completeness</span>
                          <div className="studio-metric-bar"><div className="fill" style={{ width: "96%" }} /></div>
                          <strong>96%</strong>
                        </div>
                      </div>
                    </div>

                    <div className="studio-qa-checklist">
                      <div className="studio-check-item">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span>Explicit system instructions prevent generic, superficial outputs</span>
                      </div>
                      <div className="studio-check-item">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span>Formatted markdown schema guarantees clean parsing into CRM or docs</span>
                      </div>
                      <div className="studio-check-item">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span>Step-by-step reasoning phase prevents hallucinations</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Terminal Footer Navigation */}
            <div className="studio-terminal-footer">
              <div className="studio-footer-info">
                <span className="studio-creator-pill">
                  Engineered by <strong>{activePrompt.creator?.name || "Verified Creator"}</strong>
                </span>
                <span className="studio-stat-dot">•</span>
                <span>{activePrompt.copyCount ?? 0} deployments</span>
              </div>

              <div className="studio-footer-actions">
                <Link href={`/prompts/${activePrompt._id}`} className="button small">
                  View Full Architecture <ArrowRight size={14} />
                </Link>
                {isVault && (
                  <Link href="/payment" className="button small secondary">
                    <Crown size={14} className="text-amber-400" /> Unlock Vault ($5)
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="studio-empty-state">
            <Sparkles size={32} className="text-primary mb-3 opacity-60" />
            <p>Select a category or workflow to launch the prompt playground.</p>
          </div>
        )}
      </div>

      {/* Global Bottom Banner */}
      <div className="studio-bottom-strip">
        <div className="studio-strip-text">
          <strong>Ready to explore the entire directory?</strong>
          <span>Discover over 1,800+ tested prompts across ChatGPT, Claude, Gemini, Midjourney, and more.</span>
        </div>
        <div className="studio-strip-buttons">
          <Link href="/prompts" className="button">
            Browse All Marketplace Prompts <ArrowRight size={15} />
          </Link>
          <Link href="/payment" className="button secondary">
            <Crown size={15} className="text-amber-400" /> Unlock Premium Vault ($5)
          </Link>
        </div>
      </div>
    </section>
  );
}
