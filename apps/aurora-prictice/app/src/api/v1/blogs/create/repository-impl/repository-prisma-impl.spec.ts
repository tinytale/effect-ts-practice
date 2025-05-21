// tests/blog.spec.ts

import { PrismaPg } from "@prisma/adapter-pg";
import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";
import { PrismaClient } from "@/.prisma/client";
import { BlogRepository } from "@/api/v1/blogs/create/repository";
import { BlogRepositoryPrismaImpl } from "@/api/v1/blogs/create/repository-impl/repository-prisma-impl";
import { DB } from "@/core/context/db";

describe.concurrent("Impl", () => {
  it("aaa", async (ctx) => {
    const dbUrl = ctx.DB_URL as string;
    const PrismaLayer = Layer.succeed(DB, {
      prisma: new PrismaClient({
        adapter: new PrismaPg({ connectionString: dbUrl }),
      }),
    });

    const program = Effect.gen(function* (_) {
      const repo = yield* _(BlogRepository);
      return yield* _(
        repo.exec({
          content: "aaa",
          userId: "user",
        }),
      );
    });

    const actual = await program.pipe(
      Effect.provide(BlogRepositoryPrismaImpl),
      Effect.provide(PrismaLayer),
      Effect.runPromise,
    );

    expect(actual).toStrictEqual({});
  });
});
