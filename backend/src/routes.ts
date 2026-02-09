import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "./shared/routes";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./auth";
import { z } from "zod";
import { executeCodeWithPiston } from "./piston";
import { setupSocket, io } from "./socket";


export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);
  setupSocket(httpServer);

  // User Management
  app.get("/api/users", isAuthenticated, async (req: any, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Admin access required" });
    const users = await storage.getUsers();
    res.json(users);
  });

  app.delete("/api/users/:id", isAuthenticated, async (req: any, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Admin access required" });
    await storage.deleteUser(req.params.id);
    res.status(204).send();
  });

  // Profile
  app.put(api.auth.updateProfile.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.auth.updateProfile.input.parse(req.body);
      const user = await storage.updateUser(req.user.id, input);
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Problems
  app.get(api.problems.list.path, isAuthenticated, async (req, res) => {
    const problems = await storage.getProblems();
    res.json(problems);
  });

  app.get(api.problems.get.path, isAuthenticated, async (req, res) => {
    const id = Number(req.params.id);
    const problem = await storage.getProblem(id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    const testCases = await storage.getTestCases(id);
    // Hide hidden test cases from user
    const safeTestCases = testCases.map(tc => tc.isHidden ? { ...tc, input: "Hidden", expectedOutput: "Hidden" } : tc);
    res.json({ ...problem, testCases: safeTestCases });
  });

  app.post(api.problems.create.path, isAuthenticated, async (req: any, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const input = api.problems.create.input.parse(req.body);
      const { testCases, ...problemData } = input;
      const problem = await storage.createProblem(problemData);

      for (const tc of testCases) {
        await storage.createTestCase({ ...tc, problemId: problem.id });
      }
      res.status(201).json(problem);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.put(api.problems.update.path, isAuthenticated, async (req: any, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const id = Number(req.params.id);
    try {
      const input = api.problems.update.input.parse(req.body);
      const { testCases: newTestCases, ...problemUpdates } = input;

      const updated = await storage.updateProblem(id, problemUpdates);
      if (!updated) return res.status(404).json({ message: "Problem not found" });

      if (newTestCases) {
        await storage.deleteTestCasesForProblem(id);
        for (const tc of newTestCases) {
          await storage.createTestCase({ ...tc, problemId: id });
        }
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Update failed" });
    }
  });

  app.delete(api.problems.delete.path, isAuthenticated, async (req: any, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    const id = Number(req.params.id);
    await storage.deleteProblem(id);
    res.status(204).send();
  });

  // Submissions & Execution
  async function runTests(problemId: number, code: string, language: string) {
    const testCases = await storage.getTestCases(problemId);
    const results = [];
    let allPassed = true;

    for (const tc of testCases) {
      const { output, error } = await executeCodeWithPiston(language, code, tc.input);
      const passed = !error && output === tc.expectedOutput.trim();
      if (!passed) allPassed = false;

      results.push({
        passed,
        input: tc.isHidden ? "Hidden" : tc.input,
        expectedOutput: tc.isHidden ? "Hidden" : tc.expectedOutput,
        actualOutput: tc.isHidden ? (passed ? "Hidden" : "Incorrect") : output, // Don't reveal hidden output if failed
        isHidden: tc.isHidden,
        error
      });
    }
    return { results, allPassed };
  }

  app.post(api.submissions.run.path, isAuthenticated, async (req, res) => {
    try {
      const { code, language, problemId } = api.submissions.run.input.parse(req.body);
      const { results, allPassed } = await runTests(problemId, code, language);

      res.json({
        status: allPassed ? "pass" : "fail",
        results
      });
    } catch (err) {
      res.status(500).json({ message: "Execution failed" });
    }
  });

  app.post(api.submissions.submit.path, isAuthenticated, async (req: any, res) => {
    try {
      const { code, language, problemId } = api.submissions.submit.input.parse(req.body);
      const { results, allPassed } = await runTests(problemId, code, language);

      if (!allPassed) {
        return res.status(400).json({ message: "All test cases must pass to submit." });
      }

      const problem = await storage.getProblem(problemId);
      const submission = await storage.createSubmission({
        userId: req.user.id,
        problemId,
        code,
        language,
        status: "pass",
        score: problem?.marks || 0,
        output: "All test cases passed"
      });

      // Broadcast leaderboard update to all clients
      const updatedLeaderboard = await storage.getLeaderboard();
      io.emit("leaderboardUpdated", updatedLeaderboard);

      res.status(201).json(submission);
    } catch (err) {
      res.status(500).json({ message: "Submission failed" });
    }
  });

  app.get(api.submissions.list.path, isAuthenticated, async (req: any, res) => {
    const submissions = await storage.getSubmissionsForUser(req.user.id);
    res.json(submissions);
  });

  app.get(api.leaderboard.list.path, isAuthenticated, async (req, res) => {
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  });

  // Seed Admin and Problems if empty
  (async () => {
    const problems = await storage.getProblems();
    if (problems.length === 0) {
      console.log("Seeding database...");
      const p1 = await storage.createProblem({
        title: "Two Sum",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
        constraints: "2 <= nums.length <= 10^4",
        sampleInput: "2 7 11 15\n9",
        sampleOutput: "0 1",
        marks: 25
      });
      await storage.createTestCase({
        problemId: p1.id,
        input: "2 7 11 15\n9",
        expectedOutput: "0 1",
        isHidden: false
      });
      await storage.createTestCase({
        problemId: p1.id,
        input: "3 2 4\n6",
        expectedOutput: "1 2",
        isHidden: true
      });
    }
  })();

  return httpServer;
}
