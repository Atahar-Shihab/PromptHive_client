"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BellRing, CheckCheck, CircleAlert, CreditCard, FileText, Flag, Loader2, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/format";

function notificationHref(item) {
  if (item.type === "payment") return "/dashboard/profile";
  if (item.type === "prompt" || item.type === "report") return "/dashboard/my-prompts";
  return "/dashboard";
}

function notificationIcon(type) {
  if (type === "prompt") return FileText;
  if (type === "report") return Flag;
  if (type === "payment") return CreditCard;
  if (type === "system") return Sparkles;
  return CircleAlert;
}

function relativeTime(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Just now";
  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell({ className = "" }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const rootRef = useRef(null);

  const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items]);

  async function loadNotifications({ quiet = false } = {}) {
    try {
      if (!quiet) setLoading(true);
      setError("");
      const data = await apiFetch("/api/notifications");
      setItems(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError?.message || "Notifications unavailable");
    } finally {
      if (!quiet) setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(() => loadNotifications({ quiet: true }), 45000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function markAllRead() {
    const previousItems = items;
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    try {
      await apiFetch("/api/notifications/read-all", { method: "PATCH" });
    } catch {
      setItems(previousItems);
    }
  }

  return (
    <div ref={rootRef} className={cn("notification-bell", className)}>
      <button
        type="button"
        className={cn("notification-trigger", unreadCount > 0 && "has-unread")}
        aria-label={unreadCount ? `${unreadCount} unread notifications` : "Open notifications"}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <BellRing size={18} />
        {unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <section className="notification-panel" role="dialog" aria-label="PromptHive notifications">
          <div className="notification-panel-head">
            <div>
              <p>Signal Center</p>
              <h3>Notifications</h3>
            </div>
            <button type="button" onClick={markAllRead} disabled={!unreadCount}>
              <CheckCheck size={15} />
              Mark read
            </button>
          </div>

          {loading ? (
            <div className="notification-empty">
              <Loader2 className="notification-spinner" size={22} />
              <span>Syncing updates...</span>
            </div>
          ) : error ? (
            <div className="notification-empty is-error">
              <CircleAlert size={22} />
              <span>{error}</span>
            </div>
          ) : items.length ? (
            <div className="notification-list">
              {items.slice(0, 8).map((item) => {
                const Icon = notificationIcon(item.type);
                return (
                  <Link
                    key={item._id}
                    href={notificationHref(item)}
                    className={cn("notification-item", !item.read && "unread", `notification-item--${item.type}`)}
                    onClick={() => setOpen(false)}
                  >
                    <span className="notification-item-icon">
                      <Icon size={17} />
                    </span>
                    <span className="notification-item-copy">
                      <strong>{item.title}</strong>
                      <small>{item.message}</small>
                      <em>{relativeTime(item.createdAt)}</em>
                    </span>
                    {!item.read && <span className="notification-dot" aria-label="Unread" />}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="notification-empty">
              <Sparkles size={22} />
              <span>No notifications yet. Approval, report, warning, and payment updates will appear here.</span>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
