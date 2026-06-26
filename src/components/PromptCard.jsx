"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, Copy, Lock, Sparkles, Star, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { cn, rating } from "@/lib/format";

export function PromptCard({ prompt, index = 0 }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const href = `/prompts/${prompt._id}`;
  const premium = prompt.visibility === "private";
  const [bookmarked, setBookmarked] = useState(Boolean(prompt.isBookmarked));

  useEffect(() => {
    setBookmarked(Boolean(prompt.isBookmarked));
  }, [prompt.isBookmarked]);

  function handleDetails(event) {
    if (!session) {
      event.preventDefault();
      router.push(`/login?redirect=${encodeURIComponent(href)}`);
    }
  }

  async function toggleBookmark(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!session) {
      router.push(`/login?redirect=${encodeURIComponent(href)}`);
      return;
    }
    try {
      const result = await apiFetch(`/api/bookmarks/${prompt._id}`, { method: "POST" });
      setBookmarked(result.bookmarked);
      toast.success(result.message);
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <motion.article
      className={cn("prompt-card group ring-1 ring-white/10", premium && "premium-prompt-card")}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: Math.min(index * 0.04, 0.22) }}
      whileHover={{ y: -8, scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
    >
      {premium && <span className="premium-card-glint" aria-hidden="true" />}
      <div className="prompt-image">
        <Image
          src={prompt.thumbnailUrl || "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80"}
          alt={prompt.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {prompt.visibility === "private" && (
          <span className="stamp-badge stamp-badge--premium image-badge">
            <Lock size={14} /> Premium Vault
          </span>
        )}
        <button
          className={cn("bookmark-float", bookmarked && "saved")}
          title={bookmarked ? "Remove bookmark" : "Bookmark prompt"}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark prompt"}
          aria-pressed={bookmarked}
          onClick={toggleBookmark}
        >
          {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>
      <div className="prompt-card-body">
        <div className="card-meta">
          <span>{prompt.category}</span>
          <span>{prompt.aiTool}</span>
          <span>{prompt.difficulty}</span>
        </div>
        <h3>{prompt.title}</h3>
        <p>{prompt.description}</p>
        <div className="tag-row">
          {prompt.tags?.slice(0, 3).map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
        <div className="card-bottom">
          <span>
            <UserRound size={15} /> {prompt.creator?.name ?? "Creator"}
          </span>
          <span>
            <Copy size={15} /> {prompt.copyCount}
          </span>
          <span>
            <Star size={15} /> {rating(prompt.avgRating)}
          </span>
        </div>
        <div className="signal-meter">
          <span style={{ width: `${Math.min(96, 34 + Number(prompt.copyCount ?? 0) / 3)}%` }} />
        </div>
        <Link href={href} onClick={handleDetails} className={cn("button block", premium && "premium-card-button")}>
          <Sparkles size={17} /> {premium ? "Enter Premium Vault" : "View Details"}
        </Link>
      </div>
    </motion.article>
  );
}
