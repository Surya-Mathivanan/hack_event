import { useProblems } from "@/hooks/use-problems";
import { ProblemCard } from "@/components/ProblemCard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function ProblemList() {
  const { data: problems, isLoading, error } = useProblems();

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-64 rounded-xl bg-card/50" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl text-red-500 mb-2">Error Loading Problems</h2>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (!problems || problems.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl mb-2 font-display">No Problems Found</h2>
        <p className="text-muted-foreground">Wait for the admin to upload the challenges.</p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-4xl font-display font-bold mb-2 sm:mb-4">Challenges</h1>
        <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
          Select a problem to begin. Once started, you'll enter the secure coding environment.
          Good luck.
        </p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        {problems.map((problem) => (
          <motion.div key={problem.id} variants={item}>
            <ProblemCard problem={problem} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
