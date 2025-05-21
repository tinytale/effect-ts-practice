import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { prisma } from "@/prisma";
import { InputSchema } from "./schema";

const app = new Hono() //
  .post("/", sValidator("json", InputSchema), async (c) => {
    const { name, password } = c.req.valid("json");
    const exisit = await prisma.user
      .count({
        where: {
          name: name,
        },
      })
      .then((result) => result > 0);

    if (exisit) {
      return c.json(
        {
          code: "ALREADY_USED_NAME" as const,
        },
        400,
      );
    }

    const result = await prisma.user.create({
      data: {
        name: name,
        password: password,
      },
    });

    return c.json(
      {
        id: result.id,
        name: result.name,
        password: result.password,
        updateAt: result.updateAt.toISOString(),
        createdAt: result.createdAt.toISOString(),
      },
      200,
    );
  });

export default app;
