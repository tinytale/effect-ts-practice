import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import health from "./api/health/route";
import blogs from "./api/v1/blogs/route";
import users from "./api/v1/users/route";

const app = new Hono()
  .use(logger()) //
  .route("/health", health)
  .basePath("v1")
  .route("/", blogs)
  .route("/", users)
  .onError((e, c) => {
    console.error(
      JSON.stringify({
        path: c.req.path,
        error: e,
      }),
    );
    return c.json({ message: "Opps, Internal Server Error " }, 500);
  });

const hostname = process.env.HOSTNAME ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 3000);

serve(
  {
    fetch: app.fetch,
    hostname: hostname,
    port: port,
  },
  (info) => {
    console.log(`Listening on http://${hostname}:${info.port}`);
  },
);

export default app