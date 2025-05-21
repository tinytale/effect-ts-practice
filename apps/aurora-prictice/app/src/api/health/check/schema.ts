import { z } from "zod";

export const ResponseSchema = z.object({
  200: z.object({ status: z.literal("ok") }),
  500: z.discriminatedUnion("code", [
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
