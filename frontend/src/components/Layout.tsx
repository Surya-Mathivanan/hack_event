import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Trophy, Code2, User, Terminal, LayoutDashboard, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Don't show layout on problem solving page to maximize space/focus
  if (location.startsWith("/problems/") && location !== "/problems") {
    return <>{children}</>;
  }

  const isAdmin = user?.isAdmin || false;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Terminal className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <span className="font-display font-bold text-base md:text-xl tracking-tight whitespace-nowrap">HACK_<span className="text-primary">PLATFORM</span></span>
            </div>
          </Link>

          {user && (
            <div className="flex items-center gap-4 md:gap-6">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                <Link href="/problems">
                  <Button variant={location === "/problems" ? "secondary" : "ghost"} className="gap-2">
                    <Code2 className="w-4 h-4" />
                    Problems
                  </Button>
                </Link>
                <Link href="/leaderboard">
                  <Button variant={location === "/leaderboard" ? "secondary" : "ghost"} className="gap-2">
                    <Trophy className="w-4 h-4" />
                    Leaderboard
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant={location === "/admin" ? "secondary" : "ghost"} className="gap-2 text-orange-400 hover:text-orange-300 hover:bg-orange-400/10">
                      <LayoutDashboard className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                )}
              </nav>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-border hover:ring-primary/50 transition-all p-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                        {(user.firstName?.[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="text-red-500 focus:text-red-500 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {user && mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-card">
            <nav className="p-4 space-y-2">
              <Link href="/problems">
                <Button
                  variant={location === "/problems" ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Code2 className="w-4 h-4" />
                  Problems
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button
                  variant={location === "/leaderboard" ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Trophy className="w-4 h-4" />
                  Leaderboard
                </Button>
              </Link>
              {isAdmin && (
                <Link href="/admin">
                  <Button
                    variant={location === "/admin" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2 text-orange-400 hover:text-orange-300 hover:bg-orange-400/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border/40 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Hackathon Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
