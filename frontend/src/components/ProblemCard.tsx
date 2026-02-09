import { Link } from "wouter";
import { type Problem } from "../shared/schema";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";

interface ProblemCardProps {
  problem: Problem;
}

export function ProblemCard({ problem }: ProblemCardProps) {
  const [isSolved, setIsSolved] = useState(false);

  useEffect(() => {
    const solvedProblems = JSON.parse(localStorage.getItem("solvedProblems") || "[]");
    setIsSolved(solvedProblems.includes(problem.id));
  }, [problem.id]);

  return (
    <Card className={clsx(
      "group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 backdrop-blur-sm",
      isSolved ? "bg-green-900/10 border-green-600/30" : "bg-card/50"
    )}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className={clsx(
            "text-xl group-hover:text-primary transition-colors font-display",
            isSolved && "text-green-400"
          )}>
            {problem.title}
          </CardTitle>
          <div className="flex gap-2">
            {isSolved && (
              <Badge className="bg-green-600 text-white border-0">
                <CheckCircle className="w-3 h-3 mr-1" /> Solved
              </Badge>
            )}
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              {problem.marks} Points
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {problem.description.substring(0, 150)}...
        </p>
      </CardContent>
      <CardFooter className="pt-2">
        <Link href={`/problems/${problem.id}`} className="w-full">
          <Button className={clsx(
            "w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all",
            isSolved && "bg-green-600 hover:bg-green-700 text-white"
          )}>
            {isSolved ? (
              <><CheckCircle className="mr-2 w-4 h-4" /> Solved</>
            ) : (
              <><>Solve Challenge<ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></></>
            )}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
