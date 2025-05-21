import { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { afterAll, beforeAll, beforeEach } from "vitest";
import {
  createUniqueDatabase,
  startUpPostgresContainer,
} from "./vitest.helper.js";

let _container: StartedPostgreSqlContainer;
let _connectionString: string; // postgresql://user:pass@host:port/postgres

beforeAll(async () => {
  const { container, connectionString } = await startUpPostgresContainer();
  _container = container;
  _connectionString = connectionString;
});

afterAll(async () => {
  await _container?.stop().catch(() => {});
});

// 各テストごとに専用DBを作って context に渡す
beforeEach(async (ctx) => {
  const { DB_NAME, DB_URL } = await createUniqueDatabase({
    connectionString: _connectionString,
  });

  ctx.DB_NAME = DB_NAME;
  ctx.DB_URL = DB_URL;
});
