import crypto from "node:crypto";
import path from "node:path";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { execa } from "execa";
import { Client } from "pg";

export const startUpPostgresContainer = async () => {
  const identifer = "vites";
  const databaseName = "postgres";
  const container = await new PostgreSqlContainer(
    "docker.io/library/postgres:16-alpine",
  )
    .withName(identifer)
    .withDatabase(databaseName)
    .withUsername(identifer)
    .withPassword(identifer)
    .withReuse()
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(5432);
  const user = container.getUsername();
  const pass = container.getPassword();

  const connectionString = `postgresql://${user}:${pass}@${host}:${port}/${databaseName}`;

  return {
    container,
    host,
    port,
    user,
    pass,
    connectionString,
  };
};

export const createUniqueDatabase = async (param: {
  connectionString: string;
}) => {
  const DB_NAME = `t_${crypto.randomBytes(4).toString("hex")}`;
  const admin = new Client({ connectionString: param.connectionString });
  await admin.connect();
  await admin.query(`CREATE DATABASE "${DB_NAME}"`);
  await admin.end();

  const DB_URL = `${param.connectionString.replace("/postgres", `/${DB_NAME}`)}?schema=public`;
  const schemaPath = path.resolve(__dirname, "../", "prisma");
  await execa(
    "pnpm",
    [
      "prisma",
      "db",
      "push",
      "--accept-data-loss",
      "--force-reset",
      "--skip-generate",
      "--schema",
      schemaPath,
    ],
    {
      env: { ...process.env, DB_URL: DB_URL },
      stdio: "inherit",
    },
  );

  return {
    DB_NAME,
    DB_URL,
  };
};
