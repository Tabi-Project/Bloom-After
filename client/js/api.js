const LOCAL_API_BASE_URL = "http://localhost:3000";

// Set your deployed backend URL here once.
// Example: "https://bloom-after-api.onrender.com"
const PRODUCTION_API_BASE_URL = "https://bloom-after.onrender.com";

const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");

const isLocalHost = () => {
  const host = window.location.hostname;
  return host === "" || host === "localhost" || host === "127.0.0.1";
};

const getConfiguredBaseUrl = () => {
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

  if (!PRODUCTION_API_BASE_URL) {
    throw new Error(
      "Missing production API base URL. Set PRODUCTION_API_BASE_URL or window.BLOOM_AFTER_API_BASE_URL."
    );
  }

  return trimTrailingSlash(PRODUCTION_API_BASE_URL);
};

const buildUrl = (route, query) => {
  if (/^https?:\/\//i.test(route)) {
    const directUrl = new URL(route);

    if (query && typeof query === "object") {
      Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (Array.isArray(value)) {
          value.forEach((item) => {
            directUrl.searchParams.append(key, String(item));
          });
          return;
        }

        directUrl.searchParams.append(key, String(value));
      });
    }

    return directUrl.toString();
  }

  const cleanedRoute = route.startsWith("/") ? route.slice(1) : route;
  const url = new URL(`${getConfiguredBaseUrl()}/${cleanedRoute}`);

  if (query && typeof query === "object") {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        value.forEach((item) => {
          url.searchParams.append(key, String(item));
        });
        return;
      }

      url.searchParams.append(key, String(value));
    });
  }

  return url.toString();
};

class ApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ApiError";
    this.status = details.status;
    this.data = details.data;
    this.url = details.url;
  }
}

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
};

const request = async (
  route,
  {
    method = "GET",
    body,
    query,
    headers = {},
    credentials = "include",
    signal,
  } = {}
) => {
  if (!route || typeof route !== "string") {
    throw new ApiError("A valid route string is required.");
  }

  let url;
  try {
    url = buildUrl(route, query);
  } catch (error) {
    throw new ApiError(error?.message || "Could not build request URL.");
  }

  const upperMethod = method.toUpperCase();
  const finalHeaders = { ...headers };
  const options = {
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

  let response;
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
    const message =
      data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, {
      status: response.status,
      data,
      url,
    });
  }

  return data;
};

const api = {
  get: (route, options = {}) => request(route, { ...options, method: "GET" }),
  post: (route, body, options = {}) =>
    request(route, { ...options, method: "POST", body }),
  put: (route, body, options = {}) =>
    request(route, { ...options, method: "PUT", body }),
  patch: (route, body, options = {}) =>
    request(route, { ...options, method: "PATCH", body }),
  delete: (route, options = {}) => request(route, { ...options, method: "DELETE" }),
  request,
  ApiError,
};

export default api;
export { ApiError, getConfiguredBaseUrl };
