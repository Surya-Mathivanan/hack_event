import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useProblem } from "@/hooks/use-problems";
import { useRunCode, useSubmitCode } from "@/hooks/use-submissions";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import Editor from "@monaco-editor/react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Send, Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import remarkGfm from "remark-gfm";

// Languages mapping
const LANGUAGES = {
  python: { label: "Python 3", id: "python", defaultCode: "# Write your Python code here\n" },
  c: { label: "C", id: "c", defaultCode: "#include <stdio.h>\n\nint main() {\n    // Write your C code here\n    return 0;\n}\n" },
  cpp: { label: "C++", id: "cpp", defaultCode: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ code here\n    return 0;\n}\n" }
};

export default function SolveProblem() {
  const { id } = useParams();
  const problemId = Number(id);
  const [, setLocation] = useLocation();
  const { data: problem, isLoading } = useProblem(problemId);
  const { toast } = useToast();
  
  const [language, setLanguage] = useState<"python" | "c" | "cpp">("python");
  const [code, setCode] = useState(LANGUAGES.python.defaultCode);
  const [output, setOutput] = useState<any>(null); // run results

  const runCode = useRunCode();
  const submitCode = useSubmitCode();

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
    // Prompt user on click if auto fails
    document.addEventListener("click", enterFullScreen, { once: true });

    // 2. Tab Switching Detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        toast({
          title: "WARNING: TAB SWITCHING DETECTED",
          description: "This incident has been logged. Persistent violations will result in disqualification.",
          variant: "destructive",
          duration: 10000,
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 3. Disable Context Menu
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", enterFullScreen);
      // Optional: exit fullscreen on unmount? Maybe better to leave it.
    };
  }, [toast]);

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
    submitCode.mutate(
      { code, language, problemId },
      {
        onSuccess: () => {
          setLocation("/problems"); // Redirect to list on success
        },
      }
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden font-sans">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/problems")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold truncate max-w-md">{problem.title}</h1>
        </div>

        <div className="flex items-center gap-3">
           <Select value={language} onValueChange={(val: any) => {
             setLanguage(val);
             setCode(LANGUAGES[val as keyof typeof LANGUAGES].defaultCode);
           }}>
            <SelectTrigger className="w-[120px] h-8 bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="python">Python 3</SelectItem>
              <SelectItem value="c">C</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            size="sm" 
            variant="secondary" 
            onClick={handleRun} 
            disabled={runCode.isPending}
            className="h-8"
          >
            {runCode.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2 text-green-400" />}
            Run Tests
          </Button>

          <Button 
            size="sm" 
            onClick={handleSubmit} 
            disabled={submitCode.isPending || (output?.status !== "pass")}
            className={clsx("h-8 transition-all", output?.status === "pass" ? "bg-primary hover:bg-primary/90" : "bg-muted text-muted-foreground")}
          >
            {submitCode.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            Submit
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel: Problem Description */}
          <ResizablePanel defaultSize={40} minSize={20}>
            <ScrollArea className="h-full p-6">
              <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-primary">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.description}</ReactMarkdown>
                
                <h3 className="mt-6 text-lg font-semibold text-foreground">Constraints</h3>
                <ReactMarkdown>{problem.constraints}</ReactMarkdown>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <h4 className="text-sm font-mono text-muted-foreground mb-2">Sample Input</h4>
                    <pre className="text-xs bg-background p-2 rounded">{problem.sampleInput}</pre>
                  </div>
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <h4 className="text-sm font-mono text-muted-foreground mb-2">Sample Output</h4>
                    <pre className="text-xs bg-background p-2 rounded">{problem.sampleOutput}</pre>
                  </div>
                </div>
              </div>
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
    </div>
  );
}
