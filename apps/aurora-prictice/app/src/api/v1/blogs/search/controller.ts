import { prisma } from "@/prisma";
import { sValidator } from '@hono/standard-validator';
import { Hono } from "hono";
import { InputSchema } from "./schema";

const app = new Hono() //
  .get("/", sValidator("query", InputSchema), async (c) => {
    const { keyWord } = c.req.valid("query");
    const blogs = await prisma.blog.findMany({
      where: {
        userId: "user-123",
        content: {
          contains: keyWord,
        },
      },
      take: 20,
    });
    return c.json(blogs, 200);
  });

export default app;
