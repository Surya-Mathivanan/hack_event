import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../shared/routes";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "../lib/queryClient";

type RunCodeParams = {
  code: string;
  language: "python" | "c" | "cpp" | "java";
  problemId: number;
}

export function useRunCode() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: RunCodeParams) => {
      const res = await apiRequest(
        api.submissions.run.method,
        api.submissions.run.path,
        data
      );

      return api.submissions.run.responses[200].parse(await res.json());
    },
    onError: (error: Error) => {
      toast({ title: "Execution Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useSubmitCode() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: RunCodeParams) => {
      const res = await apiRequest(
        api.submissions.submit.method,
        api.submissions.submit.path,
        data
      );

      return api.submissions.submit.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({
        title: "Submission Received",
        description: "Your code has been submitted successfully.",
        className: "bg-green-900 border-green-700 text-white"
      });
    },
    onError: (error: Error) => {
      toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
    },
  });
}

export function useSubmissions() {
  return useQuery({
    queryKey: [api.submissions.list.path],
    queryFn: async () => {
      const res = await apiRequest('GET', api.submissions.list.path);
      return api.submissions.list.responses[200].parse(await res.json());
    },
  });
}
