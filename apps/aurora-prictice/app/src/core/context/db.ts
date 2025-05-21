import { Context, Layer } from "effect";
import type { PrismaClient } from "@/.prisma/client";
// import { type KyselyClient, kysely } from "@/kysely";
import { prisma } from "@/prisma";

type Client = {
  prisma: PrismaClient;
  // kysely: KyselyClient;
};

export class DB extends Context.Tag("DB")<DB, Client>() {}

export const DBLayer = Layer.succeed(DB, {
  prisma: prisma,
  // kysely: kysely,
});
