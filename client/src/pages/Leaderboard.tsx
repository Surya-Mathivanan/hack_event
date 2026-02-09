import { useLeaderboard } from "@/hooks/use-leaderboard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal } from "lucide-react";
import clsx from "clsx";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useLeaderboard();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Live Leaderboard</h1>
          <p className="text-muted-foreground">Real-time rankings. Auto-refreshes every 30s.</p>
        </div>
        <Trophy className="w-12 h-12 text-primary animate-pulse-slow" />
      </div>

      <Card className="bg-card/50 backdrop-blur border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="w-[100px]">Rank</TableHead>
                <TableHead>Hacker</TableHead>
                <TableHead className="text-right">Solved</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading state
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-6 w-8 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-6 w-32 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell className="text-right"><div className="h-6 w-8 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                    <TableCell className="text-right"><div className="h-6 w-12 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : leaderboard?.map((entry) => (
                <TableRow key={entry.userId} className="hover:bg-primary/5 transition-colors border-border/50">
                  <TableCell className="font-mono text-lg font-bold">
                    {entry.rank === 1 && <Medal className="w-5 h-5 text-yellow-400 inline mr-2" />}
                    {entry.rank === 2 && <Medal className="w-5 h-5 text-gray-400 inline mr-2" />}
                    {entry.rank === 3 && <Medal className="w-5 h-5 text-amber-600 inline mr-2" />}
                    #{entry.rank}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 ring-2 ring-border">
                        <AvatarImage src={entry.profileImageUrl || undefined} />
                        <AvatarFallback>{entry.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className={clsx("font-medium", entry.rank <= 3 ? "text-primary" : "text-foreground")}>
                        {entry.username}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {entry.problemsSolved}
                  </TableCell>
                  <TableCell className="text-right font-mono text-lg font-bold text-primary">
                    {entry.totalScore}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
