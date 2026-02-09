import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/Layout";
import { Loader2 } from "lucide-react";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import ProblemList from "@/pages/ProblemList";
import SolveProblem from "@/pages/SolveProblem";
import Leaderboard from "@/pages/Leaderboard";
import AdminDashboard from "@/pages/AdminDashboard";

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType; adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

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
