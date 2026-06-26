"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

function commitTheme(theme) {
  const next = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  document.documentElement.style.colorScheme = next;
  localStorage.setItem("theme", next);
  window.dispatchEvent(new CustomEvent("prompthive-theme", { detail: { theme: next } }));
  return next;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const initial = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    setTheme(initial);

    function syncTheme(event) {
      setTheme(event.detail?.theme === "light" ? "light" : "dark");
    }

    window.addEventListener("prompthive-theme", syncTheme);
    return () => window.removeEventListener("prompthive-theme", syncTheme);
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(commitTheme(next));
  }

  return (
    <button
      className="icon-button theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      aria-pressed={theme === "dark"}
      title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
