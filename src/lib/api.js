"use client";

import { API_URL } from "./constants";

const RETRYABLE_STATUSES = new Set([502, 503, 504]);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiFetch(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const method = String(options.method ?? "GET").toUpperCase();
  const canRetry = method === "GET" || method === "HEAD";
  const attempts = canRetry ? 3 : 1;
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

  const requestWithRetry = async (headers) => {
    let lastError;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        const response = await request(headers);
        if (!canRetry || !RETRYABLE_STATUSES.has(response.status) || attempt === attempts - 1) {
          return response;
        }
      } catch (error) {
        lastError = error;
        if (!canRetry || attempt === attempts - 1) throw error;
      }
      await wait(800 * (attempt + 1));
    }
    throw lastError;
  };

  const headers = buildHeaders(true);
  const usedStoredBearer = typeof window !== "undefined" && Boolean(localStorage.getItem("bearer_token")) && !new Headers(options.headers).has("Authorization");

  let response;
  try {
    response = await requestWithRetry(headers);
  } catch {
    throw new Error(`The PromptHive API is waking up or temporarily unavailable at ${API_URL}. Please wait a moment and refresh.`);
  }

  if ((response.status === 401 || response.status === 403) && usedStoredBearer) {
    localStorage.removeItem("bearer_token");
    localStorage.removeItem("jwt_token");
    try {
      response = await requestWithRetry(buildHeaders(false));
    } catch {
      throw new Error(`The PromptHive API is waking up or temporarily unavailable at ${API_URL}. Please wait a moment and refresh.`);
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
