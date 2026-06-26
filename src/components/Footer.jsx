"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, Linkedin, Sparkles } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/creator") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="site-footer">
      <div>
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Sparkles size={18} />
          </span>
          <span>PromptHive</span>
        </Link>
        <p>AI prompt marketplace for creators, teams, automation builders, and premium prompt buyers.</p>
      </div>
      <div className="footer-links">
        <Link href="/prompts">Marketplace</Link>
        <Link href="/dashboard/add-prompt">Add Prompt</Link>
        <a href="https://github.com/" target="_blank" rel="noreferrer" aria-label="GitHub">
          <Github size={18} />
        </a>
        <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
          <Linkedin size={18} />
        </a>
      </div>
    </footer>
  );
}
