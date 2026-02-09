import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile } from "@/hooks/use-profile";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
  age: z.coerce.number().min(16, "Must be at least 16").max(100, "Invalid age"),
  college: z.string().min(2, "College name required"),
  department: z.string().min(2, "Department required"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const [, setLocation] = useLocation();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age: user?.age || undefined,
      college: user?.college || "",
      department: user?.department || "",
    },
  });

  // Redirect if already complete
  useEffect(() => {
    if (user?.college && user?.department && user?.age) {
      // Optional: uncomment if you want to auto-redirect
      // setLocation("/"); 
    }
  }, [user, setLocation]);

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile.mutate(data, {
      onSuccess: () => {
        setLocation("/");
      },
    });
  };

  return (
    <div className="max-w-lg mx-auto mt-8 sm:mt-20 px-4 sm:px-0">
      <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-display">Complete Your Profile</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            We need a few more details before you can enter the hackathon arena.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="20" {...field} className="bg-background/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="college"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College / University</FormLabel>
                    <FormControl>
                      <Input placeholder="MIT, Stanford, etc." {...field} className="bg-background/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Computer Science" {...field} className="bg-background/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={updateProfile.isPending}>
                {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save & Continue
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
