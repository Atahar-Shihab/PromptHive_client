"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Boxes, Copy, Crown, Gem, Layers3, Lock, Search, ShieldCheck, Sparkles, Star, TrendingUp, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { absoluteUploadUrl, apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { benefitCards, extraSections, tools, trendingTags } from "@/lib/constants";
import { PromptCard } from "@/components/PromptCard";
import { PromptStudioLab } from "@/components/PromptStudioLab";
import { SkeletonGrid } from "@/components/Spinner";

const studioCards = [
  {
    icon: Layers3,
    title: "Discovery engine",
    stat: "9 smart filters",
    text: "Search by category, model, difficulty, trend score, creator, and premium status without losing the marketplace flow."
  },
  {
    icon: ShieldCheck,
    title: "Trust layer",
    stat: "Reports + reviews",
    text: "Moderation, ratings, bookmarks, and admin actions keep high-signal prompts visible and low-quality prompts controlled."
  },
  {
    icon: TrendingUp,
    title: "Creator analytics",
    stat: "Live copy signal",
    text: "Creators can track published prompts, copies, reviews, and premium growth from a focused SaaS dashboard."
  }
];

function uniquePrompts(...groups) {
  const byId = new Map();
  const byTitle = new Set();
  groups.flat().forEach((prompt) => {
    const key = (prompt?.title ?? "").trim().toLowerCase();
    if (prompt?._id && key && !byTitle.has(key)) {
      byTitle.add(key);
      byId.set(prompt._id, prompt);
    }
  });
  return Array.from(byId.values());
}

export default function HomePage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [featured, setFeatured] = useState([]);
  const [carouselPrompts, setCarouselPrompts] = useState([]);
  const [creators, setCreators] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  const loggedInCta = mounted && Boolean(session);

  useEffect(() => {
    setMounted(true);
    Promise.all([
      apiFetch("/api/prompts?featured=true&limit=6&sort=trending&includePrivate=true"),
      apiFetch("/api/prompts?page=1&limit=10&sort=trending&includePrivate=true"),
      apiFetch("/api/prompts/top-creators"),
      apiFetch("/api/reviews/public")
    ])
      .then(([prompts, showcasePrompts, topCreators, publicReviews]) => {
        setFeatured(prompts.data ?? []);
        setCarouselPrompts(uniquePrompts(showcasePrompts.data ?? [], prompts.data ?? []).slice(0, 10));
        setCreators(topCreators ?? []);
        setReviews(publicReviews ?? []);
      })
      .catch((requestError) => {
        toast.error(requestError?.message ?? "Could not load marketplace data.");
      })
      .finally(() => setLoading(false));
  }, []);

  function submit(event) {
    event.preventDefault();
    router.push(`/prompts?search=${encodeURIComponent(search)}`);
  }

  return (
    <>
      <section className="hero">
        <div className="hero-inner hero-composition relative grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:items-center">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="eyebrow">
              <Sparkles size={16} /> Community prompt marketplace
            </span>
            <h1 className="hero-brand-title">PromptHive</h1>
            <p>
              A futuristic prompt marketplace where creators publish premium AI workflows and teams discover prompts for
              ChatGPT, Gemini, Claude, Midjourney, and more.
            </p>
            <form className="search-panel" onSubmit={submit}>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title, tag, or AI tool..." />
              <button className="button" type="submit" aria-label="Search prompts">
                <Search size={16} /> <span>Search</span>
              </button>
            </form>
            <div className="hero-tags">
              {trendingTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className="tag-chip-btn"
                  onClick={() => router.push(`/prompts?search=${encodeURIComponent(tag)}`)}
                >
                  #{tag}
                </button>
              ))}
            </div>
            <div className="action-row">
              <Link href="/prompts" className="button">
                Explore Prompts <ArrowRight size={18} />
              </Link>
              <Link href="/dashboard/add-prompt" className="button secondary">
                Publish Prompt
              </Link>
            </div>
            <div className="hero-signal-strip">
              <div>
                <Boxes size={22} />
                <strong>{featured.length || "6"}+</strong>
                <span>featured prompts</span>
              </div>
              <div>
                <Users size={22} />
                <strong>{creators.length || "6"}+</strong>
                <span>top creators</span>
              </div>
              <div>
                <Copy size={22} />
                <strong>{featured.reduce((sum, item) => sum + Number(item.copyCount ?? 0), 0) || "800"}+</strong>
                <span>prompt copies</span>
              </div>
              <div>
                <Crown size={22} />
                <strong>$5</strong>
                <span>premium unlock</span>
              </div>
            </div>
            <div className="hero-ticker">
              <div className="ticker-track">
                {tools.concat(tools).map((tool, index) => (
                  <span key={`${tool}-${index}`}>{tool}</span>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="hero-showcase hidden md:block"
            initial={{ opacity: 0, y: 36, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.16, duration: 0.7 }}
          >
            <div className="showcase-shell">
              <div className="showcase-topline">
                <span>
                  <Gem size={15} /> Prompt OS
                </span>
                <strong>Live</strong>
              </div>
              <div className="prompt-window">
                <div className="console-toolbar">
                  <span className="console-dot" />
                  <span className="console-dot cyan" />
                  <span className="console-dot gold" />
                </div>
                <div className="prompt-line bright">Create a premium launch prompt for a SaaS team.</div>
                <div className="prompt-line">Role: senior growth strategist</div>
                <div className="prompt-line">Output: 5 experiments, ICP angle, landing copy</div>
                <div className="prompt-line glow">Status: approved, featured, premium-ready</div>
              </div>
              <div className="showcase-stack">
                {[
                  { label: "Private prompt vault", value: "Locked", icon: Crown },
                  { label: "Community signal", value: "4.9", icon: Star },
                  { label: "Copy velocity", value: "+32%", icon: Zap }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div className="showcase-metric" key={item.label} whileHover={{ y: -4, scale: 1.02 }}>
                      <Icon size={18} />
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section command-section">
        <div className="section-heading">
          <p className="eyebrow">Marketplace command deck</p>
          <h2>Everything required for a serious prompt platform</h2>
          <p>PromptHive connects discovery, creator tools, moderation, premium payment, and AI testing in one polished workflow.</p>
        </div>
        <div className="command-grid">
          {studioCards.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                className="command-card group"
                key={item.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                whileHover={{ y: -6 }}
              >
                <div className="command-icon">
                  <Icon size={24} />
                </div>
                <span>{item.stat}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </motion.article>
            );
          })}
        </div>
        <div className="signal-board">
          {["Google sign-in", "Live marketplace data", "Premium checkout", "Admin moderation", "Creator dashboard"].map((item) => (
            <span key={item}>
              <Sparkles size={14} /> {item}
            </span>
          ))}
          </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Trending now</p>
          <h2>Featured prompts from the marketplace</h2>
          <p>Six approved prompts are loaded from MongoDB with server-side trend scoring.</p>
        </div>
        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="prompt-grid">
            {featured.map((prompt, index) => (
              <PromptCard key={prompt._id} prompt={prompt} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* Interactive Neural Prompt Studio Lab */}
      <PromptStudioLab prompts={uniquePrompts(carouselPrompts, featured)} />

      <section className="section alt">
        <div className="section-heading">
          <p className="eyebrow">Why choose us</p>
          <h2>A marketplace built for useful prompts</h2>
        </div>
        <div className="benefit-grid">
          {benefitCards.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                className="info-card"
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
              >
                <Icon size={28} color="var(--primary)" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Top creators</p>
          <h2>Creators with copy-worthy work</h2>
        </div>
        <div className="creator-grid">
          {creators.map((creator) => (
            <article className="creator-card" key={creator._id}>
              <img src={absoluteUploadUrl(creator.image) || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"} alt={creator.name} />
              <h3>{creator.name}</h3>
              <p>{creator.prompts} prompts published</p>
              <strong>{creator.copies} copies</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="section alt reviews-section">
        <div className="section-heading">
          <p className="eyebrow">Customer reviews</p>
          <h2>Signals from the community</h2>
        </div>
        <div className="review-grid">
          {reviews.slice(0, 4).map((review) => (
            <motion.article
              className="review-card"
              key={review._id}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="card-bottom">
                <span>
                  <Star size={15} /> {review.rating}.0
                </span>
                <span>{review.promptId?.title ?? "Prompt"}</span>
              </div>
              <p>{review.comment}</p>
              <strong>{review.user?.name}</strong>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="section premium-band">
        <div className="section-heading">
          <p className="eyebrow">Premium access</p>
          <h2>Unlock private prompts for one simple price</h2>
          <p>PromptHive Premium gives users access to locked prompt content, copy access, premium reviews, and creator growth features.</p>
        </div>
        <div className="pricing-grid">
          <motion.article
            className="pricing-card"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="eyebrow">Free</span>
            <h3>$0</h3>
            <p>Browse public prompts, bookmark favorites, review open prompts, and publish up to three prompts.</p>
            <Link href={loggedInCta ? "/dashboard" : "/register"} className="button secondary">
              {loggedInCta ? "Go to Dashboard" : "Start Free"}
            </Link>
          </motion.article>
          <motion.article
            className="pricing-card featured-price"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
          >
            <span className="eyebrow">Premium</span>
            <h3>$5</h3>
            <p>One-time payment to unlock private prompts, copy premium content, download PDFs, and publish without the free limit.</p>
            <Link href="/payment" className="button">
              Unlock Premium <ArrowRight size={18} />
            </Link>
          </motion.article>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Platform Capabilities</p>
          <h2>Built for modern AI teams & creators</h2>
          <p>Everything you need to author, evaluate, test, and ship high-performing prompt workflows.</p>
        </div>
        <div className="extra-grid">
          {extraSections.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                className="info-card"
                key={item.title}
                initial={{ opacity: 0, x: index % 2 ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Icon size={28} color="var(--accent)" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </motion.article>
            );
          })}
        </div>
      </section>
    </>
  );
}
