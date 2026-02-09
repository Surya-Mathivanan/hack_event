import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { api } from "../shared/routes";

export function useLeaderboard() {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: [api.leaderboard.list.path],
    queryFn: async () => {
      const res = await fetch(api.leaderboard.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return api.leaderboard.list.responses[200].parse(await res.json());
    },
    refetchInterval: 30000, // Fallback: refresh every 30 seconds
  });

  // Real-time updates via socket.io
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    const socket = io(socketUrl, { path: "/socket.io", withCredentials: true });
    
    socket.on("leaderboardUpdated", (newLeaderboard) => {
      // Update the cache with new data
      queryClient.setQueryData([api.leaderboard.list.path], newLeaderboard);
    });

    return () => { socket.disconnect(); };
  }, [queryClient]);

  return query;
}
