import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertProblem, type Problem, type TestCase } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useProblems() {
  return useQuery({
    queryKey: [api.problems.list.path],
    queryFn: async () => {
      const res = await fetch(api.problems.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch problems");
      return api.problems.list.responses[200].parse(await res.json());
    },
  });
}

export function useProblem(id: number) {
  return useQuery({
    queryKey: [api.problems.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.problems.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch problem");
      return api.problems.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateProblem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertProblem & { testCases: Omit<TestCase, "id" | "problemId">[] }) => {
      const res = await fetch(api.problems.create.path, {
        method: api.problems.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create problem");
      }
      return api.problems.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.problems.list.path] });
      toast({ title: "Success", description: "Problem created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteProblem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.problems.delete.path, { id });
      const res = await fetch(url, { 
        method: api.problems.delete.method,
        credentials: "include" 
      });
      
      if (!res.ok) throw new Error("Failed to delete problem");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.problems.list.path] });
      toast({ title: "Success", description: "Problem deleted successfully" });
    },
  });
}
