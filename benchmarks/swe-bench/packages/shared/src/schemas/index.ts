import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  balance: z.number().int().default(0),
});

export const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  authorId: z.string(),
});

export const createBenchmarkSchema = z.object({
  name: z.string().min(1),
  score: z.number(),
  tags: z.string().optional(),
});

export const createOrderSchema = z.object({
  userId: z.string(),
  total: z.number().int().positive(),
});

export const createMemberSchema = z.object({
  orgId: z.string(),
  userId: z.string(),
  role: z.string(),
});

export const updateBalanceSchema = z.object({
  userId: z.string(),
  amount: z.number().int(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const filterSchema = z.object({
  status: z.enum(["draft", "published"]).optional(),
  authorId: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateBenchmarkInput = z.infer<typeof createBenchmarkSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateBalanceInput = z.infer<typeof updateBalanceSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type FilterInput = z.infer<typeof filterSchema>;
