export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

// Smart API URL detection for auth operations
function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl;
  
  if (import.meta.env.DEV) {
    return "http://localhost:3000";
  }
  
  return window.location.origin;
}

// Redirect to login with a toast notification
export function redirectToLogin(toast?: (options: { title: string; description: string; variant: string }) => void) {
  if (toast) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
  }
  setTimeout(() => {
    const apiBaseUrl = getApiBaseUrl();
    window.location.href = `${apiBaseUrl}/api/auth/google`;
  }, 500);
}
