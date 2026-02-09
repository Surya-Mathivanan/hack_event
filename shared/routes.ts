import { z } from 'zod';
import { insertProblemSchema, insertTestCaseSchema, insertSubmissionSchema, problems, testCases, submissions, users } from './schema';
import { updateUserSchema } from './models/auth';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  forbidden: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    updateProfile: {
      method: 'PUT' as const,
      path: '/api/profile' as const,
      input: updateUserSchema,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  problems: {
    list: {
      method: 'GET' as const,
      path: '/api/problems' as const,
      responses: {
        200: z.array(z.custom<typeof problems.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/problems/:id' as const,
      responses: {
        200: z.custom<typeof problems.$inferSelect & { testCases: typeof testCases.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/problems' as const,
      input: insertProblemSchema.extend({
        testCases: z.array(insertTestCaseSchema.omit({ problemId: true })),
      }),
      responses: {
        201: z.custom<typeof problems.$inferSelect>(),
        403: errorSchemas.forbidden,
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/problems/:id' as const,
      input: insertProblemSchema.partial().extend({
        testCases: z.array(insertTestCaseSchema.omit({ problemId: true })).optional(),
      }),
      responses: {
        200: z.custom<typeof problems.$inferSelect>(),
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/problems/:id' as const,
      responses: {
        204: z.void(),
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
  },
  submissions: {
    run: {
      method: 'POST' as const,
      path: '/api/run' as const,
      input: z.object({
        code: z.string(),
        language: z.enum(["python", "c", "cpp"]),
        problemId: z.number(),
      }),
      responses: {
        200: z.object({
          status: z.enum(["pass", "fail", "error"]),
          results: z.array(z.object({
            passed: z.boolean(),
            input: z.string(),
            expectedOutput: z.string(),
            actualOutput: z.string(),
            isHidden: z.boolean(),
            error: z.string().optional(),
          })),
        }),
        404: errorSchemas.notFound,
      },
    },
    submit: {
      method: 'POST' as const,
      path: '/api/submissions' as const,
      input: z.object({
        code: z.string(),
        language: z.enum(["python", "c", "cpp"]),
        problemId: z.number(),
      }),
      responses: {
        201: z.custom<typeof submissions.$inferSelect>(),
        400: z.object({ message: z.string() }), // Failed test cases
        404: errorSchemas.notFound,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/submissions' as const,
      responses: {
        200: z.array(z.custom<typeof submissions.$inferSelect & { problemTitle: string }>()),
      },
    },
  },
  leaderboard: {
    list: {
      method: 'GET' as const,
      path: '/api/leaderboard' as const,
      responses: {
        200: z.array(z.object({
          userId: z.string(),
          username: z.string(),
          profileImageUrl: z.string().nullable(),
          totalScore: z.number(),
          problemsSolved: z.number(),
          rank: z.number(),
        })),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
