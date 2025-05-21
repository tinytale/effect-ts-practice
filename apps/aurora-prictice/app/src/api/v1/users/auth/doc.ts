import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { InputSchema, ResponseSchema } from "./schema.js";

const END_POINT = "/users/auth";

const doc = new Hono()
  .post(
    END_POINT,
    describeRoute({
      description: "User Auth",
      operationId: "userAuth",
      tags: ["users"],
      responses: {
        201: {
          description: "Successful response",
          content: {
            "application/json": { schema: resolver(ResponseSchema.shape[201]) },
          },
        },
        400: {
          description: "BadRequest",
          content: {
            "application/json": { schema: resolver(ResponseSchema.shape[400]) },
          },
        },
      },
    }),
    validator("form",InputSchema)
  )


export default doc;
