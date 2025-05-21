import { Hono } from "hono";
import create from "./create/controller";
import auth from "./auth/controller";

const app = new Hono() //
  .basePath("users")
  .route("create", create)
  .route("auth", auth);

export default app;
