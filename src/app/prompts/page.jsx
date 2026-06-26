"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { categories, difficulties, tools } from "@/lib/constants";
import { PromptCard } from "@/components/PromptCard";
import { SkeletonGrid } from "@/components/Spinner";

export default function PromptsPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get("search") ?? "",
    category: "",
    aiTool: "",
    difficulty: "",
    access: "",
    sort: "latest"
  });
  const [prompts, setPrompts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const defaultFilters = {
    search: "",
    category: "",
    aiTool: "",
    difficulty: "",
    access: "",
    sort: "latest"
  };

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: "1", limit: "12", sort: filters.sort, includePrivate: "true" });
    Object.entries(filters).forEach(([key, value]) => {
      if (!value || key === "sort") return;
      if (key === "access") {
        params.set("visibility", value);
        return;
      }
      params.set(key, value);
    });
    return params.toString();
  }, [filters]);

  const activeFilterCount = useMemo(
    () => Object.entries(filters).filter(([key, value]) => key !== "sort" && Boolean(value)).length,
    [filters]
  );

  useEffect(() => {
    setLoading(true);
    setError("");
    const timer = setTimeout(() => {
      apiFetch(`/api/prompts?${query}`)
        .then((result) => {
          setPrompts(result.data ?? []);
          setMeta(result.meta ?? { page: 1, totalPages: 1, total: 0 });
        })
        .catch((requestError) => {
          const message = requestError?.message ?? "Could not load prompts.";
          setError(message);
          toast.error(message);
        })
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  async function loadMore() {
    const nextPage = meta.page + 1;
    const params = new URLSearchParams(query);
    params.set("page", String(nextPage));
    try {
      const result = await apiFetch(`/api/prompts?${params.toString()}`);
      setPrompts((current) => [...current, ...(result.data ?? [])]);
      setMeta(result.meta);
    } catch (requestError) {
      toast.error(requestError?.message ?? "Could not load more prompts.");
    }
  }

  function update(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function resetFilters() {
    setFilters(defaultFilters);
  }

  return (
    <section className="marketplace">
      <div className="page-heading">
        <p className="eyebrow">All prompts</p>
        <h1>Search the prompt marketplace</h1>
        <p>Browse public prompts and premium vault cards with filtering, sorting, and pagination handled by the Express API.</p>
      </div>

      <div className="market-filter-panel">
        <div className="market-filter-header">
          <div>
            <span className="filter-kicker">
              <SlidersHorizontal size={16} /> Marketplace controls
            </span>
            <h2>Refine the prompt library</h2>
          </div>
          <div className="filter-status">
            <span>{loading ? "Syncing..." : `${meta.total} prompts found`}</span>
            <button type="button" onClick={resetFilters} disabled={!activeFilterCount && filters.sort === "latest"}>
              <RotateCcw size={15} /> Reset
            </button>
          </div>
        </div>

        <div className="access-segment" aria-label="Prompt access filter">
          {[
            { label: "All Prompts", value: "" },
            { label: "Public", value: "public" },
            { label: "Premium Vault", value: "private" }
          ].map((item) => (
            <button
              className={filters.access === item.value ? "active" : ""}
              key={item.label}
              type="button"
              onClick={() => update("access", item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="filter-bar">
          <label className="filter-search-field">
            <span className="eyebrow">Search</span>
            <div className="filter-input-shell">
              <Search size={18} />
              <input value={filters.search} onChange={(event) => update("search", event.target.value)} placeholder="Title, tag, or AI tool" />
            </div>
          </label>
          <label>
            <span className="eyebrow">Category</span>
            <select value={filters.category} onChange={(event) => update("category", event.target.value)}>
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="eyebrow">Tool</span>
            <select value={filters.aiTool} onChange={(event) => update("aiTool", event.target.value)}>
              <option value="">All tools</option>
              {tools.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="eyebrow">Difficulty</span>
            <select value={filters.difficulty} onChange={(event) => update("difficulty", event.target.value)}>
              <option value="">Any level</option>
              {difficulties.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="eyebrow">Sort</span>
            <select value={filters.sort} onChange={(event) => update("sort", event.target.value)}>
              <option value="latest">Latest</option>
              <option value="popular">Most Popular</option>
              <option value="copied">Most Copied</option>
              <option value="trending">Trending</option>
            </select>
          </label>
        </div>
      </div>

      {error && !loading ? (
        <div className="container">
          <article className="details-panel empty-state-panel">
            <h2>Prompt library unavailable</h2>
            <p>{error}</p>
            <button className="button" onClick={() => window.location.reload()}>Try Again</button>
          </article>
        </div>
      ) : loading ? (
        <SkeletonGrid />
      ) : (
        <>
          <div className="prompt-grid">
            {prompts.map((prompt, index) => (
              <PromptCard prompt={prompt} key={prompt._id} index={index} />
            ))}
          </div>
          <div className="container action-row" style={{ justifyContent: "center", marginTop: 28 }}>
            {meta.page < meta.totalPages ? (
              <button className="button" onClick={loadMore}>
                <Search size={18} /> Load More
              </button>
            ) : (
              <span className="status-pill">{meta.total} prompts loaded</span>
            )}
          </div>
        </>
      )}
    </section>
  );
}
