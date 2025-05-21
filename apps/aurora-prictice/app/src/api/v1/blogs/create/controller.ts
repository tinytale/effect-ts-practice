import { sValidator } from "@hono/standard-validator";
import { Effect } from "effect";
import { Hono } from "hono";
import { match } from "ts-pattern";
import type { z } from "zod";
import { useCase } from "@/api/v1/blogs/create/use-case";
import { InputSchema, ResponseSchema } from "./schema";

type Response201 = z.infer<(typeof ResponseSchema.shape)[201]>;
type Response400 = z.infer<(typeof ResponseSchema.shape)[400]>;

export const app = new Hono() //
  .post("/", sValidator("json", InputSchema), async (c) => {
    const { content } = c.req.valid("json");
    return useCase({
      userId: "userId",
      content: content,
    }).pipe(
      Effect.match({
        onSuccess: (result) => c.json<Response201, 201>(result, 201),
        onFailure: (error) =>
          match(error).otherwise(() =>
            c.json(
              {
                message: "InternalServerError",
              },
              500,
            ),
          ),
      }),
      Effect.runPromise,
    );
  });

export default app;
