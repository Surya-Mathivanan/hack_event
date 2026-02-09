import { db } from "./db";
import {
  problems, testCases, submissions, users,
  type Problem, type InsertProblem, type TestCase, type InsertTestCase,
  type Submission, type InsertSubmission, type LeaderboardEntry
} from "./shared/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { authStorage } from "./auth/storage";

export interface IStorage {
  // Problems
  getProblems(): Promise<Problem[]>;
  getProblem(id: number): Promise<Problem | undefined>;
  createProblem(problem: InsertProblem): Promise<Problem>;
  updateProblem(id: number, problem: Partial<InsertProblem>): Promise<Problem | undefined>;
  deleteProblem(id: number): Promise<void>;

  // Test Cases
  getTestCases(problemId: number): Promise<TestCase[]>;
  createTestCase(testCase: InsertTestCase): Promise<TestCase>;
  deleteTestCasesForProblem(problemId: number): Promise<void>;

  // Submissions
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmissionsForUser(userId: string): Promise<(Submission & { problemTitle: string })[]>;
  getLeaderboard(): Promise<LeaderboardEntry[]>;

  // Users (delegated/extended)
  getUser(id: string): Promise<typeof users.$inferSelect | undefined>;
  getUsers(): Promise<typeof users.$inferSelect[]>;
  updateUser(id: string, updates: Partial<typeof users.$inferSelect>): Promise<typeof users.$inferSelect>;
  deleteUser(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string) {
    return authStorage.getUser(id);
  }

  async updateUser(id: string, updates: Partial<typeof users.$inferSelect>) {
    const [updated] = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async getUsers() {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteUser(id: string) {
    await db.delete(submissions).where(eq(submissions.userId, id));
    await db.delete(users).where(eq(users.id, id));
  }

  // Problems
  async getProblems(): Promise<Problem[]> {
    return db.select().from(problems).orderBy(desc(problems.createdAt));
  }

  async getProblem(id: number): Promise<Problem | undefined> {
    const [problem] = await db.select().from(problems).where(eq(problems.id, id));
    return problem;
  }

  async createProblem(problem: InsertProblem): Promise<Problem> {
    const [newProblem] = await db.insert(problems).values(problem).returning();
    return newProblem;
  }

  async updateProblem(id: number, updates: Partial<InsertProblem>): Promise<Problem | undefined> {
    const [updated] = await db.update(problems)
      .set(updates)
      .where(eq(problems.id, id))
      .returning();
    return updated;
  }

  async deleteProblem(id: number): Promise<void> {
    // Delete related test cases and submissions first (or rely on cascade if configured, but explicit is safer here)
    await db.delete(testCases).where(eq(testCases.problemId, id));
    await db.delete(submissions).where(eq(submissions.problemId, id));
    await db.delete(problems).where(eq(problems.id, id));
  }

  // Test Cases
  async getTestCases(problemId: number): Promise<TestCase[]> {
    return db.select().from(testCases).where(eq(testCases.problemId, problemId));
  }

  async createTestCase(testCase: InsertTestCase): Promise<TestCase> {
    const [newTestCase] = await db.insert(testCases).values(testCase).returning();
    return newTestCase;
  }

  async deleteTestCasesForProblem(problemId: number): Promise<void> {
    await db.delete(testCases).where(eq(testCases.problemId, problemId));
  }

  // Submissions
  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const [newSubmission] = await db.insert(submissions).values(submission).returning();
    return newSubmission;
  }

  async getSubmissionsForUser(userId: string): Promise<(Submission & { problemTitle: string })[]> {
    return db.select({
      ...submissions,
      problemTitle: problems.title,
    })
      .from(submissions)
      .innerJoin(problems, eq(submissions.problemId, problems.id))
      .where(eq(submissions.userId, userId))
      .orderBy(desc(submissions.createdAt));
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    // This is a simplified leaderboard query.
    // It sums the max score per problem for each user.
    // Logic: For each user, find their BEST submission for each problem, then sum those up.

    // Step 1: Get best score per problem per user
    const bestSubmissions = db.$with('best_submissions').as(
      db.select({
        userId: submissions.userId,
        problemId: submissions.problemId,
        maxScore: sql<number>`MAX(${submissions.score})`.as('max_score')
      })
        .from(submissions)
        .groupBy(submissions.userId, submissions.problemId)
    );

    // Step 2: Sum scores and join with user info
    const leaderboard = await db.with(bestSubmissions)
      .select({
        userId: users.id,
        username: users.email, // Using email as username/identifier
        profileImageUrl: users.profileImageUrl,
        totalScore: sql<number>`COALESCE(SUM(${bestSubmissions.maxScore}), 0)`.mapWith(Number),
        problemsSolved: sql<number>`COUNT(${bestSubmissions.problemId})`.mapWith(Number),
        // Rank will be calculated in application code or via window function if supported
      })
      .from(users)
      .leftJoin(bestSubmissions, eq(users.id, bestSubmissions.userId))
      .groupBy(users.id, users.email, users.profileImageUrl)
      .orderBy(sql`COALESCE(SUM(${bestSubmissions.maxScore}), 0) DESC`);

    return leaderboard.map((entry, index) => ({
      userId: entry.userId,
      username: entry.username || "Anonymous",
      profileImageUrl: entry.profileImageUrl,
      totalScore: entry.totalScore,
      problemsSolved: entry.problemsSolved,
      rank: index + 1
    }));
  }
}

export const storage = new DatabaseStorage();
