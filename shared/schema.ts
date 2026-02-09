import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

// Re-export auth models
export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const problems = pgTable("problems", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  constraints: text("constraints").notNull(),
  sampleInput: text("sample_input").notNull(),
  sampleOutput: text("sample_output").notNull(),
  marks: integer("marks").default(25).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const testCases = pgTable("test_cases", {
  id: serial("id").primaryKey(),
  problemId: integer("problem_id").references(() => problems.id).notNull(),
  input: text("input").notNull(),
  expectedOutput: text("expected_output").notNull(),
  isHidden: boolean("is_hidden").default(true).notNull(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  problemId: integer("problem_id").references(() => problems.id).notNull(),
  code: text("code").notNull(),
  language: text("language").notNull(), // "python", "c", "cpp"
  status: text("status").notNull(), // "pass", "fail", "pending"
  score: integer("score").default(0).notNull(),
  output: text("output"), // Execution output or error
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const problemsRelations = relations(problems, ({ many }) => ({
  testCases: many(testCases),
  submissions: many(submissions),
}));

export const testCasesRelations = relations(testCases, ({ one }) => ({
  problem: one(problems, {
    fields: [testCases.problemId],
    references: [problems.id],
  }),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id],
  }),
  problem: one(problems, {
    fields: [submissions.problemId],
    references: [problems.id],
  }),
}));

// === SCHEMAS ===

export const insertProblemSchema = createInsertSchema(problems).omit({ id: true, createdAt: true });
export const insertTestCaseSchema = createInsertSchema(testCases).omit({ id: true });
export const insertSubmissionSchema = createInsertSchema(submissions).omit({ id: true, createdAt: true });

// === EXPLICIT TYPES ===

export type Problem = typeof problems.$inferSelect;
export type InsertProblem = z.infer<typeof insertProblemSchema>;
export type TestCase = typeof testCases.$inferSelect;
export type InsertTestCase = z.infer<typeof insertTestCaseSchema>;
export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

// Request types
export type CreateProblemRequest = InsertProblem & { testCases: Omit<InsertTestCase, "problemId">[] };
export type RunCodeRequest = {
  code: string;
  language: "python" | "c" | "cpp";
  problemId: number;
};

// Response types
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
