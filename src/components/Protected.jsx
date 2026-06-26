"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { roleHomePath } from "@/lib/role-home";
import { Spinner } from "./Spinner";

export function Protected({ children, roles }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Checking access");

  useEffect(() => {
    let alive = true;
    if (isPending) return;
    if (!session) {
      const current = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
      router.replace(`/login?redirect=${encodeURIComponent(current)}`);
      return;
    }

    setLoading(true);
    setMessage("Restoring your session");
    apiFetch("/api/users/me")
      .then((user) => {
        if (!alive) return;
        setProfile(user);
        if (roles?.length && !roles.includes(user.role)) router.replace(roleHomePath(user.role));
      })
      .catch(() => {
        if (!alive) return;
        const fallbackUser = {
          id: session.user?.id,
          name: session.user?.name ?? "Member",
          email: session.user?.email ?? "",
          image: session.user?.image,
          role: session.user?.role ?? "user",
          subscription: session.user?.subscription ?? "free"
        };

        if (roles?.length && !roles.includes(fallbackUser.role)) {
          router.replace(roleHomePath(fallbackUser.role));
          return;
        }

        setProfile(fallbackUser);
        setMessage("Session restored");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [isPending, pathname, router, searchParams, session, roles]);

  if (isPending || loading || !profile) return <Spinner label={message} />;
  if (roles?.length && !roles.includes(profile.role)) return <Spinner label="Redirecting" />;
  return <>{children(profile)}</>;
}
