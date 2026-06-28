import Link from "next/link";
import { ArrowRight, Compass, Home, Library, Search, Sparkles } from "lucide-react";

const routeCards = [
  {
    href: "/prompts",
    icon: Search,
    label: "Explore marketplace",
    text: "Search approved prompt workflows by tool, category, and access."
  },
  {
    href: "/dashboard",
    icon: Library,
    label: "Open dashboard",
    text: "Return to your saved prompts, submissions, and premium workspace."
  },
  {
    href: "/",
    icon: Home,
    label: "Back to home",
    text: "Restart from the PromptHive command deck."
  }
];

export default function NotFound() {
  return (
    <section className="not-found-shell">
      <div className="not-found-aurora" aria-hidden="true" />
      <div className="not-found-grid">
        <div className="not-found-copy">
          <p className="eyebrow">
            <Sparkles size={16} />
            Route scanner
          </p>
          <div className="not-found-code" aria-label="404">
            <span>4</span>
            <span>0</span>
            <span>4</span>
          </div>
          <h1>Prompt signal lost.</h1>
          <p>
            The page you requested is not in the PromptHive index. Jump back into the marketplace,
            review your workspace, or restart from the home deck.
          </p>
          <div className="not-found-actions">
            <Link href="/prompts" className="button">
              Browse Prompts <ArrowRight size={18} />
            </Link>
            <Link href="/" className="button secondary">
              <Home size={18} /> Go Home
            </Link>
          </div>
        </div>

        <aside className="not-found-panel" aria-label="PromptHive route recovery panel">
          <div className="not-found-panel-top">
            <div>
              <p className="eyebrow">Recovery path</p>
              <h2>Choose your next signal</h2>
            </div>
            <span className="not-found-compass">
              <Compass size={24} />
            </span>
          </div>

          <div className="not-found-terminal">
            <div className="terminal-lights" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p>route.check("/asdasd")</p>
            <strong>STATUS: route missing, marketplace online</strong>
          </div>

          <div className="not-found-routes">
            {routeCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link href={card.href} className="not-found-route-card" key={card.href}>
                  <span>
                    <Icon size={19} />
                  </span>
                  <div>
                    <strong>{card.label}</strong>
                    <p>{card.text}</p>
                  </div>
                  <ArrowRight size={17} />
                </Link>
              );
            })}
          </div>
        </aside>
      </div>
    </section>
  );
}
