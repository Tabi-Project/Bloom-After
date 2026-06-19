const LOCAL_API_BASE_URL = "http://localhost:5000";

// Set your deployed backend URL here once.
// Example: "https://bloom-after-api.onrender.com"
const PRODUCTION_API_BASE_URL = "https://bloom-after.onrender.com";

declare global {
  interface Window {
    BLOOM_AFTER_API_BASE_URL?: string;
  }
}

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue | QueryValue[]>;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: QueryParams;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
}

interface ApiErrorDetails {
  status?: number;
  data?: unknown;
  url?: string;
}

const isBrowser = (): boolean => typeof window !== "undefined";

const trimTrailingSlash = (value = ""): string => value.replace(/\/+$/, "");

const isLocalHost = (): boolean => {
  if (!isBrowser()) return false;
  const host = window.location.hostname;
  return host === "" || host === "localhost" || host === "127.0.0.1";
};

const getConfiguredBaseUrl = (): string => {
  if (isBrowser()) {
    const globalOverride = window.BLOOM_AFTER_API_BASE_URL;
    if (globalOverride) {
      return trimTrailingSlash(globalOverride);
    }

    const metaOverride = document
      .querySelector('meta[name="bloom-after-api-base-url"]')
      ?.getAttribute("content");
    if (metaOverride) {
      return trimTrailingSlash(metaOverride);
    }

    if (isLocalHost()) {
      return trimTrailingSlash(LOCAL_API_BASE_URL);
    }
  }

  // Works on both the server and the client (inlined by Next at build time).
  const envOverride = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envOverride) {
    return trimTrailingSlash(envOverride);
  }

  if (!PRODUCTION_API_BASE_URL) {
    throw new Error(
      "Missing production API base URL. Set PRODUCTION_API_BASE_URL or window.BLOOM_AFTER_API_BASE_URL."
    );
  }

  return trimTrailingSlash(PRODUCTION_API_BASE_URL);
};

const appendQuery = (url: URL, query?: QueryParams): void => {
  if (!query || typeof query !== "object") return;

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === undefined || item === null) return;
        url.searchParams.append(key, String(item));
      });
      return;
    }

    url.searchParams.append(key, String(value));
  });
};

const buildUrl = (route: string, query?: QueryParams): string => {
  if (/^https?:\/\//i.test(route)) {
    const directUrl = new URL(route);
    appendQuery(directUrl, query);
    return directUrl.toString();
  }

  const cleanedRoute = route.startsWith("/") ? route.slice(1) : route;
  const url = new URL(`${getConfiguredBaseUrl()}/${cleanedRoute}`);
  appendQuery(url, query);
  return url.toString();
};

class ApiError extends Error {
  status?: number;
  data?: unknown;
  url?: string;

  constructor(message: string, details: ApiErrorDetails = {}) {
    super(message);
    this.name = "ApiError";
    this.status = details.status;
    this.data = details.data;
    this.url = details.url;
  }
}

const parseResponse = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
};

const getSessionToken = (): string => {
  if (!isBrowser()) return "";
  try {
    return sessionStorage.getItem("adminToken") || "";
  } catch {
    return "";
  }
};

const request = async <T = unknown>(
  route: string,
  {
    method = "GET",
    body,
    query,
    headers = {},
    credentials = "include",
    signal,
  }: RequestOptions = {}
): Promise<T> => {
  if (!route || typeof route !== "string") {
    throw new ApiError("A valid route string is required.");
  }

  let url: string;
  try {
    url = buildUrl(route, query);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not build request URL.";
    throw new ApiError(message);
  }

  const upperMethod = method.toUpperCase() as HttpMethod;
  const finalHeaders: Record<string, string> = { ...headers };
  const hasAuthorizationHeader = Object.keys(finalHeaders).some(
    (key) => key.toLowerCase() === "authorization"
  );
  const sessionToken = getSessionToken();
  if (!hasAuthorizationHeader && sessionToken) {
    finalHeaders.Authorization = `Bearer ${sessionToken}`;
  }

  const options: RequestInit = {
    method: upperMethod,
    headers: finalHeaders,
    credentials,
    signal,
  };

  if (body !== undefined && body !== null && upperMethod !== "GET") {
    if (body instanceof FormData) {
      options.body = body;
    } else {
      options.body = JSON.stringify(body);
      const hasContentType = Object.keys(finalHeaders).some(
        (key) => key.toLowerCase() === "content-type"
      );
      if (!hasContentType) {
        finalHeaders["Content-Type"] = "application/json";
      }
    }
  }

  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    throw new ApiError("Network error. Check your connection or server.", {
      url,
      data: error,
    });
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    const errorData = data as { error?: string; message?: string } | null;
    const message =
      errorData?.error ||
      errorData?.message ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, {
      status: response.status,
      data,
      url,
    });
  }

  return data as T;
};

const api = {
  get: <T = unknown>(route: string, options: RequestOptions = {}) =>
    request<T>(route, { ...options, method: "GET" }),
  post: <T = unknown>(route: string, body?: unknown, options: RequestOptions = {}) =>
    request<T>(route, { ...options, method: "POST", body }),
  put: <T = unknown>(route: string, body?: unknown, options: RequestOptions = {}) =>
    request<T>(route, { ...options, method: "PUT", body }),
  patch: <T = unknown>(route: string, body?: unknown, options: RequestOptions = {}) =>
    request<T>(route, { ...options, method: "PATCH", body }),
  delete: <T = unknown>(route: string, options: RequestOptions = {}) =>
    request<T>(route, { ...options, method: "DELETE" }),
  request,
  ApiError,
};

export default api;
export { ApiError, getConfiguredBaseUrl };
export type { RequestOptions, QueryParams, ApiErrorDetails };
