import { z } from "zod";
import { BlogObject } from "../object.js";

export const InputSchema = z.object({
  keyWord: z.string().trim().min(1).max(32).optional(),
  tag: z.string().optional()
});

export const ResponseSchema = z.object({
  200: BlogObject,
  400: z.discriminatedUnion("code", [
    z.object({
      code: z.literal("INVALID_PARAMETER"),
      message: z.string(),
    }),
    z.object({
      code: z.literal("INVALID_PARAMETER"),
      message: z.string(),
    }),
  ]),
});
