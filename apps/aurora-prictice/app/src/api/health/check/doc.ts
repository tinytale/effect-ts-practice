import { defineResponse } from "@/core/define-route";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { ResponseSchema } from "./schema";

const END_POINT = "/blogs/create";

const doc = new Hono()
  .use(
    END_POINT,
    describeRoute({
      description: "Health Check",
      operationId: "healthCheck",
      tags: ["health"],
      responses: {
        200: defineResponse(ResponseSchema.shape[200], "Success"),
        500: defineResponse(ResponseSchema.shape[500], "Internal Server Error"),
      },
    }),
  )
  

export default doc;
