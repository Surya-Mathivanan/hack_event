import { Button } from "@/components/ui/button";
import { Terminal, Code2, ShieldCheck, Trophy, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    window.location.href = `${apiBaseUrl}/api/auth/google`;
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const response = await fetch(`${apiBaseUrl}/api/auth/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword,
        }),
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Admin login successful!",
        });
        // Redirect to home/dashboard
        window.location.href = "/";
      } else {
        toast({
          title: "Error",
          description: "Invalid admin credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row font-sans selection:bg-primary/30">
      {/* Left Section - Hero */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto lg:mx-0">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Terminal className="w-8 h-8 text-primary" />
            </div>
            <span className="text-xl font-mono font-bold tracking-tight text-white/80">HACK_<span className="text-primary">OS</span>_v2.0</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-display font-bold leading-tight mb-6 tracking-tight">
            Code. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Compete.</span><br />
            Conquer.
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
            The ultimate secure coding environment for the next generation of developers.
            Test your skills in C, C++, and Python in a sandboxed, competitive arena.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {[
              { icon: ShieldCheck, text: "Secure Environment" },
              { icon: Code2, text: "Multi-language Support" },
              { icon: Trophy, text: "Real-time Leaderboard" },
              { icon: Terminal, text: "Integrated Shell" }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                <feature.icon className="w-5 h-5 text-primary" />
                {feature.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Section - Auth */}
      <div className="lg:w-1/2 bg-card border-l border-border/50 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-gradient-to-tl from-background to-card z-0" />

        <Card className="w-full max-w-md p-8 bg-background/50 backdrop-blur-xl border-white/5 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 font-display">Access Terminal</h2>
            <p className="text-muted-foreground text-sm">
              {showAdminLogin ? "Admin Authentication" : "Authenticate via Google to begin your session"}
            </p>
          </div>

          {!showAdminLogin ? (
            <>
              <Button
                size="lg"
                className="w-full h-14 text-base font-semibold bg-white text-black hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                onClick={handleLogin}
              >
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 text-base font-semibold border-primary/50 hover:bg-primary/10 transition-all"
                onClick={() => setShowAdminLogin(true)}
              >
                <ShieldCheck className="mr-2 h-5 w-5" />
                Admin Login
              </Button>
            </>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Username
                </label>
                <Input
                  type="text"
                  placeholder="Enter admin username"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login as Admin"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setShowAdminLogin(false)}
              >
                Back to Student Login
              </Button>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              By logging in, you agree to our Code of Conduct and Exam Integrity Policy.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
