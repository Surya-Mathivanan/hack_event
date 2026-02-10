import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Smart API URL detection: use environment variable, fallback to current origin for production, localhost for dev
function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl;
  
  // In development, use localhost
  if (import.meta.env.DEV) {
    return "http://localhost:3000";
  }
  
  // In production, use the current origin (same domain)
  // This allows the app to work on any domain without needing env vars
  return window.location.origin;
}

const API_BASE_URL = getApiBaseUrl();

console.log(`API Base URL: ${API_BASE_URL} (DEV: ${import.meta.env.DEV})`);

export function getUrl(path: string) {
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorText = "", text = await res.text();
    try {
      const json = JSON.parse(text);
      errorText = json.message || text;
    } catch {
      errorText = text || res.statusText;
    }
    
    // Provide more informative error messages
    if (res.status === 401) {
      throw new Error(`401: Unauthorized - ${errorText || "Session expired"}`);
    } else if (res.status === 403) {
      throw new Error(`403: Forbidden - ${errorText || "You don't have permission"}`);
    } else if (res.status === 404) {
      throw new Error(`404: Not Found - ${errorText || "Resource not found"}`);
    } else if (res.status === 500) {
      throw new Error(`500: Server Error - ${errorText || "Backend server error"}`);
    } else if (res.status === 503) {
      throw new Error(`503: Service Unavailable - ${errorText || "Backend is temporarily down"}`);
    } else {
      throw new Error(`${res.status}: ${errorText || res.statusText}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    const res = await fetch(getUrl(url), {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    // Network errors or other fetch failures
    if (error instanceof TypeError) {
      if (error.message.includes("fetch")) {
        throw new Error(`Network Error: Unable to reach ${API_BASE_URL}. Please check your connection.`);
      }
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      try {
        const res = await fetch(getUrl(queryKey.join("/")), {
          credentials: "include",
        });

        if (unauthorizedBehavior === "returnNull" && res.status === 401) {
          return null;
        }

        await throwIfResNotOk(res);
        return await res.json();
      } catch (error) {
        if (error instanceof TypeError) {
          if (error.message.includes("fetch")) {
            throw new Error(`Network Error: Unable to reach backend. Please check your connection.`);
          }
        }
        throw error;
      }
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: 1, // Retry once on network failure
    },
    mutations: {
      retry: 1,
    },
  },
});
