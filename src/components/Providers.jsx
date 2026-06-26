"use client";

import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function applyTheme(theme) {
  const next = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  document.documentElement.style.colorScheme = next;
  return next;
}

export function Providers({ children }) {
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = applyTheme(localStorage.getItem("theme") ?? document.documentElement.dataset.theme ?? "dark");
    setTheme(saved);
    setReady(true);

    function handleThemeChange(event) {
      const next = applyTheme(event.detail?.theme);
      setTheme(next);
    }

    function handleStorage(event) {
      if (event.key === "theme") {
        const next = applyTheme(event.newValue);
        setTheme(next);
      }
    }

    window.addEventListener("prompthive-theme", handleThemeChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("prompthive-theme", handleThemeChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return (
    <>
      {children}
      {ready && <ToastContainer position="top-right" theme={theme === "dark" ? "dark" : "light"} autoClose={2600} />}
    </>
  );
}
