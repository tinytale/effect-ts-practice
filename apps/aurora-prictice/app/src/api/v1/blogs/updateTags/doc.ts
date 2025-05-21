import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import { defineResponse } from "../../../../core/define-route.js";
import { InputSchema, ResponseSchema } from "./schema.js";

const END_POINT = "/blogs/tags/update";
const doc = new Hono()
  .post(
    END_POINT,
    describeRoute({
      description: "Tags Update",
      operationId: "blogTagsUpdate",
      security: [
        {
          Authorization: ["write:blog"],
        },
      ],
      tags: ["blogs"],
      responses: {
        200: defineResponse(ResponseSchema.shape[200], "Success"),
        400: defineResponse(ResponseSchema.shape[400], "BadRequest"),
        404: defineResponse(ResponseSchema.shape[404], "NotFound"),
      },
    }),
    validator("form",InputSchema)
  )
  

export default doc;
