import { Hono } from "hono";
import create from "./create/controller";
import search from "./search/controller";

const app = new Hono()
  .basePath("blogs")
  .route("create", create)
  .route("search", search)
  .route("updateTags", search);

export default app;
