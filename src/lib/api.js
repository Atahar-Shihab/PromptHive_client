"use client";

import { API_URL } from "./constants";

export async function apiFetch(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const buildHeaders = (includeStoredBearer = true) => {
    const headers = new Headers(options.headers);
    if (!isFormData && options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (includeStoredBearer && typeof window !== "undefined") {
      const bearer = localStorage.getItem("bearer_token");
      if (bearer && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${bearer}`);
    }

    return headers;
  };

  const request = async (headers) => fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include"
  });

  const headers = buildHeaders(true);
  const usedStoredBearer = typeof window !== "undefined" && Boolean(localStorage.getItem("bearer_token")) && !new Headers(options.headers).has("Authorization");

  let response;
  try {
    response = await request(headers);
  } catch {
    throw new Error(`Could not reach the API at ${API_URL}. Make sure the Express server is running.`);
  }

  if ((response.status === 401 || response.status === 403) && usedStoredBearer) {
    localStorage.removeItem("bearer_token");
    localStorage.removeItem("jwt_token");
    try {
      response = await request(buildHeaders(false));
    } catch {
      throw new Error(`Could not reach the API at ${API_URL}. Make sure the Express server is running.`);
    }
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === "string" ? payload : payload.message;
    throw new Error(message || "Request failed");
  }

  return payload;
}

export function absoluteUploadUrl(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
}
