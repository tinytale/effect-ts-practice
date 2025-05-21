import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { InputSchema, ResponseSchema } from "./schema";

const END_POINT = "/users/create";

const doc = new Hono()
  .post(
    END_POINT,
    describeRoute({
      description: "User Create",
      operationId: "userCreate",
      tags: ["v1", "users"],
      responses: {
        201: {
          description: "Successful response",
          content: {
            "application/json": { schema: resolver(ResponseSchema.shape[201]) },
          },
        },
        400: {
          description: "Successful response",
          content: {
            "application/json": { schema: resolver(ResponseSchema.shape[400]) },
          },
        },
      },
    }),
    validator("json",InputSchema)
  )
  

export default doc;
