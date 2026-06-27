"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { authClient, clearStoredAuthTokens } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import { roleHomePath } from "@/lib/role-home";
import { BrandMark } from "./BrandMark";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/prompts", label: "All Prompts" }
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const [profile, setProfile] = useState(null);
  const dashboardHref = roleHomePath(profile?.role ?? session?.user?.role);

  useEffect(() => {
    let alive = true;
    if (!session) {
      setProfile(null);
      return;
    }

    apiFetch("/api/users/me")
      .then((user) => {
        if (alive) setProfile(user);
      })
      .catch(() => {
        if (alive) setProfile(session.user ?? null);
      });

    return () => {
      alive = false;
    };
  }, [session]);

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/creator") || pathname.startsWith("/admin")) {
    return null;
  }

  async function signOut() {
    clearStoredAuthTokens();
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/login")
      }
    });
  }

  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="PromptHive home">
        <span className="brand-mark">
          <BrandMark />
        </span>
        <span>PromptHive</span>
      </Link>

      <button className="icon-button menu-toggle" onClick={() => setOpen((value) => !value)} aria-label="Open menu">
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <nav className={open ? "nav-links open" : "nav-links"}>
        {links.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        ))}
        {session ? (
          <>
            <Link href={dashboardHref} onClick={() => setOpen(false)}>
              Dashboard
            </Link>
            <button className="text-button" onClick={signOut}>
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" onClick={() => setOpen(false)}>
              Login
            </Link>
            <Link className="button small" href="/register" onClick={() => setOpen(false)}>
              Register
            </Link>
          </>
        )}
        <ThemeToggle />
      </nav>
    </header>
  );
}
