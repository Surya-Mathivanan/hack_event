import axios from "axios";

const PISTON_API = "https://emkc.org/api/v2/piston";

interface ExecutionResult {
    output: string;
    error?: string;
}

// Map our language names to Piston's language names
const languageMap: Record<string, string> = {
    python: "python",
    c: "c",
    cpp: "c++",
    java: "java",
};

/**
 * Execute code using Piston API
 * @param language - Programming language (python, c, cpp)
 * @param code - Source code to execute
 * @param input - Standard input for the program
 * @returns Execution result with output or error
 */
export async function executeCodeWithPiston(
    language: string,
    code: string,
    input: string
): Promise<ExecutionResult> {
    try {
        // Map language to Piston's format
        const pistonLanguage = languageMap[language];

        if (!pistonLanguage) {
            return {
                output: "",
                error: `Unsupported language: ${language}`,
            };
        }

        // Call Piston API
        const response = await axios.post(
            `${PISTON_API}/execute`,
            {
                language: pistonLanguage,
                version: "*", // Use latest version
                files: [
                    {
                        name: `main.${language === "cpp" ? "cpp" : language === "java" ? "java" : language}`,
                        content: code,
                    },
                ],
                stdin: input,
                compile_timeout: 10000, // 10 seconds
                run_timeout: 5000, // 5 seconds
                compile_memory_limit: -1,
                run_memory_limit: -1,
            },
            {
                timeout: 15000, // 15 seconds total timeout
            }
        );

        const result = response.data;

        // Check if compilation failed (for C/C++)
        if (result.compile && result.compile.code !== 0) {
            return {
                output: "",
                error: `Compilation Error:\n${result.compile.stderr || result.compile.output}`,
            };
        }

        // Check if execution succeeded
        if (result.run.code === 0) {
            return {
                output: result.run.stdout.trim(),
            };
        } else {
            // Runtime error
            const errorMessage = result.run.stderr || result.run.output || "Unknown error";

            // Check for timeout
            if (result.run.signal === "SIGKILL") {
                return {
                    output: "",
                    error: "Time Limit Exceeded",
                };
            }

            return {
                output: "",
                error: `Runtime Error:\n${errorMessage}`,
            };
        }
    } catch (error: any) {
        // Handle network errors or API errors
        if (error.code === "ECONNABORTED") {
            return {
                output: "",
                error: "Time Limit Exceeded",
            };
        }

        if (error.response) {
            return {
                output: "",
                error: `API Error: ${error.response.data?.message || error.message}`,
            };
        }

        return {
            output: "",
            error: `Execution failed: ${error.message}`,
        };
    }
}
