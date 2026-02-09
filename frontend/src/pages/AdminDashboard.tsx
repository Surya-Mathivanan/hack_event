import { useState } from "react";
import { useProblems, useCreateProblem, useDeleteProblem } from "@/hooks/use-problems";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertProblemSchema, insertTestCaseSchema, type Problem, type User } from "../shared/schema";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useUsers, useDeleteUser } from "@/hooks/use-users";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Loader2, Code2, Trophy, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Leaderboard from "./Leaderboard";

// Schema merging problem + test cases for the form
const formSchema = insertProblemSchema.extend({
  testCases: z.array(insertTestCaseSchema.omit({ problemId: true })),
});

type ProblemFormValues = z.infer<typeof formSchema>;

function ProblemForm({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const createProblem = useCreateProblem();
  const form = useForm<ProblemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      constraints: "",
      sampleInput: "",
      sampleOutput: "",
      marks: 25,
      testCases: [{ input: "", expectedOutput: "", isHidden: false }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "testCases",
  });

  const onSubmit = (data: ProblemFormValues) => {
    createProblem.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Challenge</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Title</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Description (Markdown)</FormLabel>
                      <FormControl><Textarea className="h-32 font-mono" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="constraints"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Constraints (Markdown)</FormLabel>
                      <FormControl><Textarea className="h-20 font-mono" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sampleInput"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sample Input</FormLabel>
                      <FormControl><Textarea className="font-mono" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sampleOutput"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sample Output</FormLabel>
                      <FormControl><Textarea className="font-mono" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marks</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Test Cases</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ input: "", expectedOutput: "", isHidden: true })}>
                    <Plus className="w-4 h-4 mr-2" /> Add Case
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-start bg-secondary/30 p-4 rounded-lg">
                    <div className="col-span-5">
                      <FormField
                        control={form.control}
                        name={`testCases.${index}.input`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Input</FormLabel>
                            <FormControl><Textarea className="h-20 font-mono text-xs" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-5">
                      <FormField
                        control={form.control}
                        name={`testCases.${index}.expectedOutput`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Expected Output</FormLabel>
                            <FormControl><Textarea className="h-20 font-mono text-xs" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-2 flex flex-col items-center gap-4 pt-8">
                      <FormField
                        control={form.control}
                        name={`testCases.${index}.isHidden`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col items-center space-y-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="text-xs">Hidden</FormLabel>
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="ghost" size="icon" className="text-red-400 hover:text-red-300" onClick={() => remove(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button type="submit" className="w-full" disabled={createProblem.isPending}>
                {createProblem.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Challenge
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminDashboard() {
  const { data: problems, isLoading } = useProblems();
  const deleteProblem = useDeleteProblem();
  const [open, setOpen] = useState(false);

  // Users & Stats
  const { data: users, isLoading: isLoadingUsers } = useUsers();
  const deleteUser = useDeleteUser();
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    const socket = io(socketUrl, { path: "/socket.io", withCredentials: true });
    socket.on("activeUsers", (count: number) => {
      setActiveUsers(count);
    });
    return () => { socket.disconnect(); };
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-display font-bold mb-2">Admin Command Center</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage challenges and monitor user progress</p>
        </div>
        <div className="flex gap-2 sm:gap-4 w-full lg:w-auto">
          <Card className="bg-primary/10 border-primary/20 flex-1 lg:flex-none">
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Active Users</p>
                <p className="text-xl sm:text-2xl font-bold">{activeUsers}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-secondary/50 flex-1 lg:flex-none">
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-secondary flex items-center justify-center">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Members</p>
                <p className="text-xl sm:text-2xl font-bold">{users?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="challenges" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-full sm:max-w-[600px] text-xs sm:text-sm">
          <TabsTrigger value="challenges" className="flex items-center gap-1 sm:gap-2 px-1 sm:px-3">
            <Code2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Manage</span>
            <span className="sm:hidden">Challenges</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-1 sm:gap-2 px-1 sm:px-3">
            <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Leaderboard</span>
            <span className="sm:hidden">Rank</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1 sm:gap-2 px-1 sm:px-3">
            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Users</span>
            <span className="sm:hidden">Users</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="challenges">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold">Active Challenges</h2>
            <Button onClick={() => setOpen(true)} className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Challenge</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>

          <div className="grid gap-4">
            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : problems?.map((problem: Problem) => (
              <Card key={problem.id} className="bg-card/50 hover:bg-card/80 transition-colors">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg font-medium">{problem.title}</CardTitle>
                    <div className="text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2 max-w-full sm:max-w-[400px] lg:max-w-[600px]">{problem.description}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 w-8"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this challenge? This cannot be undone.")) {
                          deleteProblem.mutate(problem.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-xs font-mono text-muted-foreground">
                    <span className="bg-secondary px-2 py-1 rounded">Marks: {problem.marks}</span>
                    <span className="bg-secondary px-2 py-1 rounded">ID: {problem.id}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Leaderboard />
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl">Registered Users</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {isLoadingUsers ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users?.map((user: User) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {user.profileImageUrl && <img src={user.profileImageUrl} alt="" className="w-6 h-6 rounded-full" />}
                                {user.firstName} {user.lastName}
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.isAdmin ? "Admin" : "Student"}</TableCell>
                            <TableCell className="text-right">
                              {!user.isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this user? This cannot be undone.")) {
                                      deleteUser.mutate(user.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-border">
                    {users?.map((user: User) => (
                      <div key={user.id} className="p-4 flex items-center gap-3">
                        {user.profileImageUrl && (
                          <img src={user.profileImageUrl} alt="" className="w-10 h-10 rounded-full shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          <Badge variant={user.isAdmin ? "default" : "secondary"} className="mt-1 text-xs">
                            {user.isAdmin ? "Admin" : "Student"}
                          </Badge>
                        </div>
                        {!user.isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 w-8 shrink-0"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this user? This cannot be undone.")) {
                                deleteUser.mutate(user.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ProblemForm open={open} setOpen={setOpen} />
    </div>
  );
}
