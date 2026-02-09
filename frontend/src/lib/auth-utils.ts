export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
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
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    window.location.href = `${apiBaseUrl}/api/auth/google`;
  }, 500);
}
