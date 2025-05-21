import type z from "zod";
import { resolver } from "hono-openapi";

export function defineResponse<T extends z.ZodTypeAny>(
  schema: T,
  description = "",
) {
  return {
    description,
    content: {
      "application/json": {
        schema: resolver(schema),
      },
    },
  };
}
