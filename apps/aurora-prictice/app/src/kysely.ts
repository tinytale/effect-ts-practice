import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { DB } from "@/.kysely/types";

const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT = "5432",
  DB_NAME,
  DB_SCHEMA = "public",
} = process.env;

// const DATABASE_URL = `postgresql://${encodeURIComponent(DB_USER as string)}:${encodeURIComponent(DB_PASSWORD as string)}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=${DB_SCHEMA}`;

const dialect = new PostgresDialect({
  pool: new Pool({
    //  connectionString:
    host: DB_HOST,
    port: Number(DB_PORT ?? 5432),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    ssl: process.env.NODE_ENV === "production" && { rejectUnauthorized: false },
  }),
});

export type KyselyClient = Kysely<DB>;

export const kysely = new Kysely<DB>({
  dialect,
});
