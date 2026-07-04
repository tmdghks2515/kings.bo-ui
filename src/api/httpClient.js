const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const ACCESS_TOKEN_KEY = process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY ?? "kings.bo.accessToken";
const TOKEN_TYPE_KEY = process.env.NEXT_PUBLIC_TOKEN_TYPE_KEY ?? "kings.bo.tokenType";
const TOKEN_EXPIRES_AT_KEY = `${ACCESS_TOKEN_KEY}.expiresAt`;
const AUTH_STORE_KEY = "kings.bo.auth";
const LOGIN_PATH = "/login";

const getStoredAuthHeader = () => {
  if (typeof window === "undefined") {
    return {};
  }

  const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  const tokenType = window.localStorage.getItem(TOKEN_TYPE_KEY) || "Bearer";

  return accessToken ? { Authorization: `${tokenType} ${accessToken}` } : {};
};

const buildUrl = (path, params) => {
  const url = new URL(`${API_BASE_URL}${path}`, "http://localhost");

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, value);
      }
    });
  }

  return API_BASE_URL ? url.toString() : `${url.pathname}${url.search}`;
};

const redirectToLogin = () => {
  if (typeof window === "undefined") {
    return;
  }

  authTokenStorage.clear();
  window.localStorage.removeItem(AUTH_STORE_KEY);

  if (window.location.pathname !== LOGIN_PATH) {
    window.location.replace(LOGIN_PATH);
  }
};

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  const hasJson = contentType?.includes("application/json");
  const data = hasJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401) {
      redirectToLogin();
    }

    const message = data?.message || response.statusText || "API request failed";
    throw new Error(message);
  }

  return data;
};

export const httpClient = {
  async request(path, { method = "GET", params, body, headers, ...options } = {}) {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    const response = await fetch(buildUrl(path, params), {
      method,
      headers: {
        ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
        ...getStoredAuthHeader(),
        ...headers,
      },
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      credentials: "include",
      ...options,
    });

    return parseResponse(response);
  },

  get(path, options) {
    return this.request(path, { ...options, method: "GET" });
  },

  post(path, body, options) {
    return this.request(path, { ...options, body, method: "POST" });
  },

  put(path, body, options) {
    return this.request(path, { ...options, body, method: "PUT" });
  },

  patch(path, body, options) {
    return this.request(path, { ...options, body, method: "PATCH" });
  },

  delete(path, options) {
    return this.request(path, { ...options, method: "DELETE" });
  },
};

export const authTokenStorage = {
  set({ accessToken, tokenType = "Bearer", expiresIn }) {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    window.localStorage.setItem(TOKEN_TYPE_KEY, tokenType);

    if (expiresIn) {
      window.localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(Date.now() + expiresIn * 1000));
    }
  },

  clear() {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(TOKEN_TYPE_KEY);
    window.localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
  },
};
