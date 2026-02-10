import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/Layout";
import { Loader2, AlertTriangle, Wifi } from "lucide-react";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import ProblemList from "@/pages/ProblemList";
import SolveProblem from "@/pages/SolveProblem";
import Leaderboard from "@/pages/Leaderboard";
import AdminDashboard from "@/pages/AdminDashboard";

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType; adminOnly?: boolean }) {
  const { user, isLoading, error } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show error state if unable to load user data
  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background gap-4 p-4">
        <div className="flex items-center gap-3 text-destructive">
          <AlertTriangle className="w-8 h-8" />
          <div>
            <h2 className="text-xl font-bold">Connection Error</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Unable to connect to the backend server. Please check your connection and refresh the page.
            </p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  // Force profile completion for non-admins
  if (!user.isAdmin && (!user.college || !user.department) && window.location.pathname !== "/profile") {
    return <Redirect to="/profile" />;
  }

  if (adminOnly) {
    if (!user.isAdmin) return <Redirect to="/" />;
  }

  return <Component />;
}

function Router() {
  const { user, isLoading, error } = useAuth();

  if (isLoading) return null;

  // Show error state if unable to load user data
  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background gap-4 p-4">
        <Wifi className="w-12 h-12 text-muted-foreground opacity-50" />
        <div className="text-center max-w-2xl">
          <h1 className="text-2xl font-bold text-destructive mb-2">Connection Error</h1>
          <p className="text-muted-foreground mb-4">
            Unable to connect to the backend server. This could be due to:
          </p>
          <ul className="text-left text-sm/relaxed text-muted-foreground mb-6 bg-card p-4 rounded-lg border border-border">
            <li>• Your internet connection is offline</li>
            <li>• The backend server is temporarily unavailable</li>
            <li>• The API URL is incorrectly configured</li>
            <li>• Your firewall is blocking the connection</li>
          </ul>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/">
        {!user ? (
          <Landing />
        ) : user.isAdmin ? (
          <Redirect to="/admin" />
        ) : (
          <Home />
        )}
      </Route>

      {/* Protected Routes */}
      <Route path="/profile">
        <ProtectedRoute component={Profile} />
      </Route>

      <Route path="/problems">
        <ProtectedRoute component={ProblemList} />
      </Route>

      <Route path="/problems/:id">
        <ProtectedRoute component={SolveProblem} />
      </Route>

      <Route path="/leaderboard">
        <ProtectedRoute component={Leaderboard} />
      </Route>

      {/* Admin Route */}
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} adminOnly />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Layout>
          <Router />
        </Layout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
