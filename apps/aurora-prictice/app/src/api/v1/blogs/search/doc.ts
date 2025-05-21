import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { InputSchema, ResponseSchema } from "./schema";

const doc = new Hono().get(
  "/blogs/search",
  describeRoute({
    description: "Blog Search",
    operationId: "blogSearch",
    security: [
      {
        Authorization: ["write:blog"],
      },
    ],
    tags: ["blogs"],
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(ResponseSchema.shape[200]) },
        },
      },
    },
  }),
  validator("query", InputSchema),
);

export default doc;
