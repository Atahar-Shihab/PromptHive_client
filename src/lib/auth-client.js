"use client";

import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";
import { API_URL } from "./constants";

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL ?? (typeof window !== "undefined" ? window.location.origin : API_URL);

export function clearStoredAuthTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("bearer_token");
  localStorage.removeItem("jwt_token");
}

export const authClient = createAuthClient({
  baseURL: AUTH_URL,
  plugins: [jwtClient()],
  fetchOptions: {
    credentials: "include",
    onSuccess: (ctx) => {
      const bearer = ctx.response.headers.get("set-auth-token");
      const jwt = ctx.response.headers.get("set-auth-jwt");
      if (bearer) localStorage.setItem("bearer_token", bearer);
      if (jwt) localStorage.setItem("jwt_token", jwt);
    }
  }
});

export function clientCallbackURL(path = "/dashboard") {
  if (typeof window === "undefined") return path;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const url = new URL(path);
      return url.origin === window.location.origin ? url.toString() : `${window.location.origin}/dashboard`;
    } catch {
      return `${window.location.origin}/dashboard`;
    }
  }
  return `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;
}
