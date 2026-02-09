import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../shared/routes";
import { useToast } from "@/hooks/use-toast";

type UpdateProfileParams = {
  age?: number;
  college?: string;
  department?: string;
};

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateProfileParams) => {
      const res = await fetch(api.auth.updateProfile.path, {
        method: api.auth.updateProfile.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }
      return api.auth.updateProfile.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      // Invalidate both the user profile query and update the cache immediately
      queryClient.setQueryData(["/api/auth/user"], data);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({ title: "Profile Updated", description: "Your details have been saved." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
