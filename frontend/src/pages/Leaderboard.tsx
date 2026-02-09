import { useLeaderboard } from "@/hooks/use-leaderboard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal } from "lucide-react";
import clsx from "clsx";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useLeaderboard();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">Live Leaderboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Real-time rankings. Auto-refreshes every 30s.</p>
        </div>
        <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-primary animate-pulse-slow self-start sm:self-center" />
      </div>

      <Card className="bg-card/50 backdrop-blur border-border">
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block">
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
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse mb-2" />
                      <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))
            ) : leaderboard?.map((entry) => (
              <div key={entry.userId} className={clsx(
                "p-4 border-b border-border/50 last:border-0",
                entry.rank <= 3 ? "bg-primary/5" : "hover:bg-primary/5"
              )}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 shrink-0">
                    {entry.rank === 1 && <Medal className="w-6 h-6 text-yellow-400" />}
                    {entry.rank === 2 && <Medal className="w-6 h-6 text-gray-400" />}
                    {entry.rank === 3 && <Medal className="w-6 h-6 text-amber-600" />}
                    {entry.rank > 3 && <span className="font-mono font-bold text-muted-foreground">#{entry.rank}</span>}
                  </div>
                  <Avatar className="h-10 w-10 ring-2 ring-border shrink-0">
                    <AvatarImage src={entry.profileImageUrl || undefined} />
                    <AvatarFallback>{entry.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className={clsx("font-medium truncate", entry.rank <= 3 ? "text-primary" : "text-foreground")}>
                      {entry.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.problemsSolved} solved
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg font-bold text-primary">{entry.totalScore}</p>
                    <p className="text-xs text-muted-foreground">pts</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
