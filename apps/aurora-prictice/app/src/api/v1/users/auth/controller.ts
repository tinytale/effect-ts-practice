import { prisma } from "@/prisma";
import { sValidator } from "@hono/standard-validator";
import dayjs from "dayjs";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { InputSchema } from "./schema";

const app = new Hono() //
  .post("/", sValidator("json", InputSchema), async (c) => {
    const { username, password } = c.req.valid("json");
    const userOrNull = await prisma.user.findUnique({
      where: {
        name: username,
      },
    });

    if (userOrNull === null) {
      return c.json(
        {
          code: "USER_NOT_FOUND",
        },
        400,
      );
    }
    const user = userOrNull;
    if (user.password !== password) {
      return c.json(
        {
          code: "PASSWORD_MISS_MATCH",
        },
        400,
      );
    }

    const accesToken = await prisma.accessToken.upsert({
      where: {
        username: username,
      },
      create: {
        username: username,
        expiresAt: dayjs().add(1, "day").toDate(),
        accessToken: crypto.randomUUID(),
      },
      update: {
        expiresAt: dayjs().add(1, "day").toDate(),
        accessToken: crypto.randomUUID(),
      },
    });

    setCookie(c, "access_token", accesToken.accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24, // 1日
      path: "/",
      sameSite: "Strict",
    });

    return c.json(
      {
        accessToken: accesToken.accessToken,
      },
      201,
    );
  });

export default app;
