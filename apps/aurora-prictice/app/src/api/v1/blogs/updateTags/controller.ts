import { Hono } from "hono";
import { validator } from "hono-openapi";
import { prisma } from "../../../../prisma";
import { InputSchema } from "./schema";

const app = new Hono() //
  .post("/", validator("json", InputSchema), async (c) => {
    const { tags, blogId } = c.req.valid("json");
    const result = await prisma.blog.findUnique({
      where: {
        id: blogId,
      },
    });

    if (result === null) {
      return c.json(
        { code: "NOT_FOUND" as const, message: `not found:${blogId} ` },
        404,
      );
    }

    const blog = await prisma.blog.updateMany({
      where: {
        id: blogId,
      },
      data: {
        tags: tags,
      },
    });

    return c.json(
      {
        id: result.id,
        content: result.content,
        tags: tags,
        updateAt: result.updatedAt,
        createdAt: result.createdAt,
      },
      200,
    );
  });

export default app;
