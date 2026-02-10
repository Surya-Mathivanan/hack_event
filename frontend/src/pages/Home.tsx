import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4 md:p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-primary/10 rounded-full blur-[80px] md:blur-[100px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl"
      >
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold mb-4 md:mb-6 tracking-tighter leading-tight">
          Welcome, <span className="text-primary text-4xl sm:text-5xl md:text-6xl lg:text-7xl">{user?.firstName || "Hacker"}</span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto font-light leading-relaxed px-2">
          The arena is ready. The problems are set. It's time to prove your worth in the code.
        </p>

        <Link href="/problems">
          <Button 
            size="lg" 
            className="h-12 md:h-16 px-8 md:px-12 text-base md:text-lg rounded-full shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-emerald-600 border-0 w-full sm:w-auto"
          >
            <PlayCircle className="mr-2 md:mr-3 w-5 md:w-6 h-5 md:h-6" />
            Start Hackathon
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
