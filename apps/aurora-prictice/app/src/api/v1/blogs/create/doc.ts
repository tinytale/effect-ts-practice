import { defineResponse } from "@/core/define-route.js";
import { Hono } from "hono";
import { describeRoute ,validator} from "hono-openapi";
import { InputSchema, ResponseSchema } from "./schema";

const END_POINT = "/blogs/create";

const doc = new Hono()
  .post(
    END_POINT,
    describeRoute({
      description: "Blog Create",
      operationId: "blogCreate",
      security: [
        {
          Authorization: [],
        },
      ],
      tags: ["v1", "blogs"],
      responses: {
        201: defineResponse(ResponseSchema.shape[201], "Success"),
        400: defineResponse(ResponseSchema.shape[400], "BadRequest"),
      },
    }),
    validator("json",InputSchema)
  )
  

export default doc;
