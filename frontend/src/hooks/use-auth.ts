import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "../shared/types";

// Smart API URL detection
function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl;
  
  if (import.meta.env.DEV) {
    return "http://localhost:3000";
  }
  
  return window.location.origin;
}

async function fetchUser(): Promise<User | null> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/api/auth/user`, {
      credentials: "include",
    });

    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      if (error.message.includes("fetch")) {
        throw new Error("Network Error: Unable to reach backend");
      }
    }
    throw error;
  }
}

async function logout(): Promise<void> {
  const apiBaseUrl = getApiBaseUrl();
  window.location.href = `${apiBaseUrl}/api/auth/logout`;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
