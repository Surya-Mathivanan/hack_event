import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useProblem, useProblems } from "@/hooks/use-problems";
import { useRunCode, useSubmitCode } from "@/hooks/use-submissions";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import Editor from "@monaco-editor/react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Send, Loader2, ArrowLeft, AlertTriangle, CheckCircle, ChevronRight, FileText, Code } from "lucide-react";
import clsx from "clsx";
import remarkGfm from "remark-gfm";

// Languages mapping
const LANGUAGES = {
  python: { label: "Python 3", id: "python", defaultCode: "# Write your Python code here\n" },
  c: { label: "C", id: "c", defaultCode: "#include <stdio.h>\n\nint main() {\n    // Write your C code here\n    return 0;\n}\n" },
  cpp: { label: "C++", id: "cpp", defaultCode: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ code here\n    return 0;\n}\n" },
  java: { label: "Java", id: "java", defaultCode: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your Java code here\n    }\n}\n" }
};

export default function SolveProblem() {
  const { id } = useParams();
  const problemId = Number(id);
  const [, setLocation] = useLocation();
  const { data: problem, isLoading } = useProblem(problemId);
  const { data: allProblems } = useProblems();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [language, setLanguage] = useState<"python" | "c" | "cpp" | "java">("python");
  const [code, setCode] = useState(LANGUAGES.python.defaultCode);
  const [output, setOutput] = useState<any>(null);
  const [isSolved, setIsSolved] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [hasViolation, setHasViolation] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const runCode = useRunCode();
  const submitCode = useSubmitCode();

  // Check if problem is already solved from localStorage
  useEffect(() => {
    const solvedProblems = JSON.parse(localStorage.getItem("solvedProblems") || "[]");
    setIsSolved(solvedProblems.includes(problemId));
  }, [problemId]);

  // Get next unsolved problem
  const getNextProblem = () => {
    if (!allProblems) return null;
    const solvedProblems = JSON.parse(localStorage.getItem("solvedProblems") || "[]");
    const unsolved = allProblems.filter((p: any) => !solvedProblems.includes(p.id) && p.id !== problemId);
    return unsolved.length > 0 ? unsolved[0] : null;
  };

  // === SECURITY ENFORCEMENT ===
  useEffect(() => {
    // 1. Request Fullscreen
    const enterFullScreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (e) {
        console.warn("Fullscreen request denied", e);
      }
    };
    document.addEventListener("click", enterFullScreen, { once: true });

    // 2. Tab Switching & Fullscreen Exit Detection
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        setViolationCount(prev => prev + 1);
        setHasViolation(true);
        toast({
          title: "⚠️ VIOLATION: TAB SWITCHING DETECTED",
          description: `Warning ${violationCount + 1}/3: You will receive 0 marks if you continue. Stay in fullscreen mode.`,
          variant: "destructive",
          duration: 10000,
        });
      }
    };

    // 3. Fullscreen Change Detection
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isSubmitted) {
        setViolationCount(prev => prev + 1);
        setHasViolation(true);
        toast({
          title: "⚠️ VIOLATION: FULLSCREEN EXITED",
          description: `Warning ${violationCount + 1}/3: You have exited fullscreen. You will receive 0 marks. Click anywhere to re-enter fullscreen.`,
          variant: "destructive",
          duration: 10000,
        });
        // Re-prompt for fullscreen on next click
        document.addEventListener("click", enterFullScreen, { once: true });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // 4. Disable Context Menu
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);

    // 5. Disable Copy/Paste
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast({ title: "Copy disabled", variant: "destructive" });
    };
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      toast({ title: "Paste disabled", variant: "destructive" });
    };
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", enterFullScreen);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
    };
  }, [toast, violationCount, isSubmitted]);

  if (isLoading || !problem) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const handleRun = () => {
    runCode.mutate(
      { code, language, problemId },
      {
        onSuccess: (data) => {
          setOutput(data);
          if (data.status === "error") {
            toast({ title: "Compilation Error", description: "Check output console", variant: "destructive" });
          } else if (data.status === "fail") {
            toast({ title: "Tests Failed", description: "Some test cases failed", variant: "default" });
          } else {
            toast({ title: "Tests Passed", description: "All test cases passed!", className: "bg-green-600 text-white" });
          }
        },
      }
    );
  };

  const handleSubmit = () => {
    // If there were violations, submit with 0 marks
    const finalScore = hasViolation ? 0 : (problem?.marks || 0);
    
    submitCode.mutate(
      { code, language, problemId },
      {
        onSuccess: () => {
          setIsSubmitted(true);
          
          // Mark problem as solved in localStorage
          const solvedProblems = JSON.parse(localStorage.getItem("solvedProblems") || "[]");
          if (!solvedProblems.includes(problemId)) {
            solvedProblems.push(problemId);
            localStorage.setItem("solvedProblems", JSON.stringify(solvedProblems));
          }
          setIsSolved(true);

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
          queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });

          if (hasViolation) {
            toast({
              title: "Submitted with 0 Marks",
              description: "Due to tab switching/fullscreen violations, you received 0 marks for this problem.",
              variant: "destructive",
              duration: 10000,
            });
          } else {
            toast({
              title: "✅ Problem Solved!",
              description: `You earned ${problem?.marks} marks. Great job!`,
              className: "bg-green-600 text-white",
            });
          }
        },
      }
    );
  };

  const handleNextProblem = () => {
    const nextProblem = getNextProblem();
    if (nextProblem) {
      setLocation(`/problems/${nextProblem.id}`);
    } else {
      toast({
        title: "All Problems Completed!",
        description: "You have solved all available problems. Great work!",
        className: "bg-green-600 text-white",
      });
      setLocation("/problems");
    }
  };

  const nextProblem = getNextProblem();

  // Mobile Problem Content Component
  const ProblemContent = () => (
    <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-primary">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.description}</ReactMarkdown>
      
      <h3 className="mt-6 text-lg font-semibold text-foreground">Constraints</h3>
      <ReactMarkdown>{problem.constraints}</ReactMarkdown>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div className="bg-card p-4 rounded-lg border border-border">
          <h4 className="text-sm font-mono text-muted-foreground mb-2">Sample Input</h4>
          <pre className="text-xs bg-background p-2 rounded overflow-x-auto">{problem.sampleInput}</pre>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <h4 className="text-sm font-mono text-muted-foreground mb-2">Sample Output</h4>
          <pre className="text-xs bg-background p-2 rounded overflow-x-auto">{problem.sampleOutput}</pre>
        </div>
      </div>
    </div>
  );

  // Mobile Editor Content Component
  const EditorContent = () => (
    <div className="flex flex-col h-full">
      <Editor
        height="calc(100% - 200px)"
        language={language === "c" || language === "cpp" ? "cpp" : "python"}
        theme="vs-dark"
        value={code}
        onChange={(val) => setCode(val || "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "JetBrains Mono",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16 },
        }}
      />
      {/* Output / Console */}
      <div className="h-[200px] flex flex-col bg-[#1e1e1e] border-t border-border">
        <div className="h-8 bg-card border-b border-border px-4 flex items-center text-xs text-muted-foreground font-mono">
          TERMINAL OUTPUT
        </div>
        <ScrollArea className="flex-1 p-4 font-mono text-sm">
          {!output && <p className="text-muted-foreground/50 italic">Run code to see output...</p>}
          
          {output && output.status === "error" && (
            <div className="text-red-400 whitespace-pre-wrap">{output.results[0]?.error || output.message}</div>
          )}

          {output && output.results && (
            <div className="space-y-4">
              {output.results.map((result: any, i: number) => (
                <div key={i} className={clsx("p-3 rounded border", result.passed ? "border-green-900/50 bg-green-900/10" : "border-red-900/50 bg-red-900/10")}>
                  <div className="flex items-center gap-2 mb-2">
                    {result.passed ? (
                      <Badge variant="outline" className="text-green-400 border-green-800">Passed</Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-400 border-red-800">Failed</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">Test Case {i + 1} {result.isHidden && "(Hidden)"}</span>
                  </div>
                  
                  {!result.passed && !result.isHidden && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mt-2">
                      <div>
                        <div className="text-muted-foreground">Input:</div>
                        <pre className="bg-background/50 p-1 rounded mt-1">{result.input}</pre>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Expected:</div>
                        <pre className="bg-background/50 p-1 rounded mt-1">{result.expectedOutput}</pre>
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <div className="text-muted-foreground">Actual:</div>
                        <pre className="bg-background/50 p-1 rounded mt-1 text-red-300">{result.actualOutput}</pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden font-sans">
      {/* Header - Responsive */}
      <header className="h-auto min-h-[56px] border-b border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-2 shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/problems")} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold truncate text-sm sm:text-base max-w-[200px] sm:max-w-md">{problem.title}</h1>
          <div className="flex gap-1 sm:gap-2 shrink-0">
            {isSolved && (
              <Badge className="bg-green-600 text-white border-0 text-xs">
                <CheckCircle className="w-3 h-3 mr-1 hidden sm:inline" /> 
                <span className="sm:hidden">✓</span>
                <span className="hidden sm:inline">Solved</span>
              </Badge>
            )}
            {hasViolation && !isSubmitted && (
              <Badge variant="destructive" className="animate-pulse text-xs">
                <AlertTriangle className="w-3 h-3 mr-1 hidden sm:inline" /> 
                <span className="sm:hidden">0</span>
                <span className="hidden sm:inline">0 Marks</span>
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <Select value={language} onValueChange={(val: any) => {
            setLanguage(val);
            setCode(LANGUAGES[val as keyof typeof LANGUAGES].defaultCode);
          }}>
            <SelectTrigger className="w-[100px] sm:w-[120px] h-8 bg-background border-border text-xs sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="python">Python 3</SelectItem>
              <SelectItem value="c">C</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="java">Java</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            size="sm" 
            variant="secondary" 
            onClick={handleRun} 
            disabled={runCode.isPending || isSubmitted}
            className="h-8 text-xs sm:text-sm px-2 sm:px-3"
          >
            {runCode.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 sm:mr-2 text-green-400" />}
            <span className="hidden sm:inline">Run Tests</span>
          </Button>

          {!isSolved ? (
            <Button 
              size="sm" 
              onClick={handleSubmit} 
              disabled={submitCode.isPending || (output?.status !== "pass") || isSubmitted}
              className={clsx("h-8 text-xs sm:text-sm px-2 sm:px-3 transition-all", output?.status === "pass" ? "bg-primary hover:bg-primary/90" : "bg-muted text-muted-foreground")}
            >
              {submitCode.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 sm:mr-2" />}
              <span className="hidden sm:inline">Submit</span>
            </Button>
          ) : (
            <Button 
              size="sm" 
              onClick={handleNextProblem}
              className="h-8 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-2 sm:px-3"
            >
              {nextProblem ? (
                <><ChevronRight className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Next Question</span><span className="sm:hidden">Next</span></>
              ) : (
                <><CheckCircle className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">All Done</span><span className="sm:hidden">Done</span></>
              )}
            </Button>
          )}
        </div>
      </header>

      {/* Desktop: Resizable Panels */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel: Problem Description */}
          <ResizablePanel defaultSize={40} minSize={20}>
            <ScrollArea className="h-full p-6">
              <ProblemContent />
            </ScrollArea>
          </ResizablePanel>
          
          <ResizableHandle withHandle className="bg-border" />

          {/* Right Panel: Editor & Output */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <ResizablePanelGroup direction="vertical">
              {/* Editor */}
              <ResizablePanel defaultSize={70} minSize={30}>
                <Editor
                  height="100%"
                  language={language === "c" || language === "cpp" ? "cpp" : "python"}
                  theme="vs-dark"
                  value={code}
                  onChange={(val) => setCode(val || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "JetBrains Mono",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16 },
                  }}
                />
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-border" />

              {/* Output / Console */}
              <ResizablePanel defaultSize={30} minSize={10}>
                <div className="h-full flex flex-col bg-[#1e1e1e]">
                  <div className="h-8 bg-card border-b border-border px-4 flex items-center text-xs text-muted-foreground font-mono">
                    TERMINAL OUTPUT
                  </div>
                  <ScrollArea className="flex-1 p-4 font-mono text-sm">
                    {!output && <p className="text-muted-foreground/50 italic">Run code to see output...</p>}
                    
                    {output && output.status === "error" && (
                      <div className="text-red-400 whitespace-pre-wrap">{output.results[0]?.error || output.message}</div>
                    )}

                    {output && output.results && (
                      <div className="space-y-4">
                        {output.results.map((result: any, i: number) => (
                          <div key={i} className={clsx("p-3 rounded border", result.passed ? "border-green-900/50 bg-green-900/10" : "border-red-900/50 bg-red-900/10")}>
                            <div className="flex items-center gap-2 mb-2">
                              {result.passed ? (
                                <Badge variant="outline" className="text-green-400 border-green-800">Passed</Badge>
                              ) : (
                                <Badge variant="outline" className="text-red-400 border-red-800">Failed</Badge>
                              )}
                              <span className="text-xs text-muted-foreground">Test Case {i + 1} {result.isHidden && "(Hidden)"}</span>
                            </div>
                            
                            {!result.passed && !result.isHidden && (
                              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                <div>
                                  <div className="text-muted-foreground">Input:</div>
                                  <pre className="bg-background/50 p-1 rounded mt-1">{result.input}</pre>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Expected:</div>
                                  <pre className="bg-background/50 p-1 rounded mt-1">{result.expectedOutput}</pre>
                                </div>
                                <div className="col-span-2">
                                  <div className="text-muted-foreground">Actual:</div>
                                  <pre className="bg-background/50 p-1 rounded mt-1 text-red-300">{result.actualOutput}</pre>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile: Tabbed Interface */}
      <div className="md:hidden flex-1 overflow-hidden">
        <Tabs defaultValue="editor" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-border bg-card h-10 shrink-0">
            <TabsTrigger value="problem" className="text-xs sm:text-sm">
              <FileText className="w-4 h-4 mr-2" /> Problem
            </TabsTrigger>
            <TabsTrigger value="editor" className="text-xs sm:text-sm">
              <Code className="w-4 h-4 mr-2" /> Code
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="problem" className="flex-1 m-0 overflow-hidden data-[state=active]:flex">
            <ScrollArea className="h-full p-4">
              <ProblemContent />
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="editor" className="flex-1 m-0 overflow-hidden p-0 data-[state=active]:flex">
            <EditorContent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
