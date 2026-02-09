import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "../shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useUsers() {
    return useQuery<User[]>({
        queryKey: ["/api/users"],
        queryFn: async () => {
            const res = await fetch("/api/users", { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch users");
            return res.json();
        }
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (userId: string) => {
            const res = await fetch(`/api/users/${userId}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (!res.ok) throw new Error("Failed to delete user");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/users"] });
            queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
            toast({ title: "Success", description: "User deleted successfully" });
        },
        onError: (error) => {
            toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
        }
    });
}
