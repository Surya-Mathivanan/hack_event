import { z } from "zod";

// === USER TYPES ===

export type User = {
  id: string;
  email: string;
  username: string;
  profileImageUrl: string | null;
  isAdmin: boolean;
  createdAt: Date | null;
};

// === PROBLEM TYPES ===

export type Problem = {
  id: number;
  title: string;
  description: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
  marks: number;
  createdAt: Date | null;
};

export type TestCase = {
  id: number;
  problemId: number;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
};

export type Submission = {
  id: number;
  userId: string;
  problemId: number;
  code: string;
  language: string;
  status: string;
  score: number;
  output: string | null;
  createdAt: Date | null;
};

// === INSERT SCHEMAS (Zod) ===

export const insertProblemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  constraints: z.string().min(1, "Constraints are required"),
  sampleInput: z.string().min(1, "Sample input is required"),
  sampleOutput: z.string().min(1, "Sample output is required"),
  marks: z.number().int().positive().default(25),
});

export const insertTestCaseSchema = z.object({
  problemId: z.number().int().positive(),
  input: z.string(),
  expectedOutput: z.string(),
  isHidden: z.boolean().default(true),
});

export const insertSubmissionSchema = z.object({
  userId: z.string(),
  problemId: z.number().int().positive(),
  code: z.string(),
  language: z.string(),
  status: z.string(),
  score: z.number().int().default(0),
  output: z.string().nullable().optional(),
});

// === INFERRED TYPES ===

export type InsertProblem = z.infer<typeof insertProblemSchema>;
export type InsertTestCase = z.infer<typeof insertTestCaseSchema>;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

// === REQUEST TYPES ===

export type CreateProblemRequest = InsertProblem & {
  testCases: Omit<InsertTestCase, "problemId">[]
};

export type RunCodeRequest = {
  code: string;
  language: "python" | "c" | "cpp";
  problemId: number;
};

// === RESPONSE TYPES ===

export type TestResult = {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  isHidden: boolean;
  error?: string;
};

export type RunCodeResponse = {
  status: "pass" | "fail" | "error";
  results: TestResult[];
  message?: string;
};

export type LeaderboardEntry = {
  userId: string;
  username: string;
  profileImageUrl: string | null;
  totalScore: number;
  problemsSolved: number;
  rank: number;
};
