import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Effect, Layer } from "effect";
import { BlogRepository } from "@/api/v1/blogs/create/repository";
import type { BlogObject } from "@/api/v1/blogs/object";
import { DB } from "@/core/context/db";

export const BlogRepositoryPrismaImpl = Layer.effect(
  BlogRepository,
  Effect.gen(function* (_) {
    const { prisma } = yield* _(DB);
    return {
      exec: (i): Effect.Effect<BlogObject, never, never> =>
        Effect.gen(function* (_) {
          const result = yield* _(
            Effect.tryPromise({
              try: () => {
                return prisma.blog.create({
                  data: {
                    userId: i.userId,
                    content: i.content,
                  },
                  select: {
                    id: true,
                    userId: true,
                    content: true,
                    tags: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                });
              },
              catch: (e) => {
                console.error(e);
                if (
                  e instanceof PrismaClientKnownRequestError &&
                  e.code === "P2002"
                ) {
                  return new Error("この ID はすでに使われています");
                }
                return new Error(String(e));
              },
            }).pipe(Effect.orDie), // エラーを例外として処理
          );

          return {
            id: result.id,
            userId: result.userId,
            content: result.content,
            tags: result.tags,
            createdAt: result.createdAt.toISOString(),
            updatedAt: result.updatedAt.toISOString(),
          };
        }),
    };
  }),
);
