import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../shared/routes";
import { useToast } from "@/hooks/use-toast";

type RunCodeParams = {
  code: string;
  language: "python" | "c" | "cpp" | "java";
  problemId: number;
}

export function useRunCode() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: RunCodeParams) => {
      const res = await fetch(api.submissions.run.path, {
        method: api.submissions.run.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to run code");
      }
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
      const res = await fetch(api.submissions.submit.path, {
        method: api.submissions.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Submission failed");
      }
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
      const res = await fetch(api.submissions.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch submissions");
      return api.submissions.list.responses[200].parse(await res.json());
    },
  });
}
