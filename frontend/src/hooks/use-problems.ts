import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "../shared/routes";
import { type InsertProblem, type Problem, type TestCase } from "../shared/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getUrl } from "../lib/queryClient";

export function useProblems() {
  return useQuery({
    queryKey: [api.problems.list.path],
    queryFn: async () => {
      const res = await apiRequest('GET', api.problems.list.path);
      return api.problems.list.responses[200].parse(await res.json());
    },
  });
}

export function useProblem(id: number) {
  return useQuery({
    queryKey: [api.problems.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.problems.get.path, { id });
      const res = await fetch(getUrl(url), { credentials: "include" });
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
      const res = await apiRequest(
        api.problems.create.method,
        api.problems.create.path,
        data
      );

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
      const res = await fetch(getUrl(url), {
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
