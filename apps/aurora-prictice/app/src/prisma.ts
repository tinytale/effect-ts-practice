import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./.prisma/client";

const {
  DB_HOST,
  DB_PORT = "5432",
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_SCHEMA,
} = process.env;

const adapter = new PrismaPg(
  {
    host: DB_HOST,
    port: Number(DB_PORT ?? 5432),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    ssl: process.env.NODE_ENV === "production" && { rejectUnauthorized: false },
  },
  { schema: DB_SCHEMA },
);

export const prisma = new PrismaClient({ adapter });
