import { Link } from "wouter";
import { type Problem } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy } from "lucide-react";

interface ProblemCardProps {
  problem: Problem;
}

export function ProblemCard({ problem }: ProblemCardProps) {
  return (
    <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl group-hover:text-primary transition-colors font-display">
            {problem.title}
          </CardTitle>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            {problem.marks} Points
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {problem.description.substring(0, 150)}...
        </p>
      </CardContent>
      <CardFooter className="pt-2">
        <Link href={`/problems/${problem.id}`} className="w-full">
          <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            Solve Challenge
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
