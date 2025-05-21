import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";

const main = async () => {
  const docs = fs.globSync("./src/api/v1/**/{openapi,doc}.ts");
  console.debug("OpenAPI docs found:", docs);
  const modules = await Promise.all(
    docs.map((p) => {
      const abs = path.resolve(p);
      const url = pathToFileURL(abs).href;
      return import(url);
    }),
  );

  const openapi = modules
    .filter((m) => m.default)
    .reduce((app, m) => app.route("/v1", m.default), new Hono());

  const root = new Hono()
    .get(
      "/oepenapi",
      openAPIRouteHandler(openapi, {
        documentation: {
          info: {
            title: "ExampleApi",
            version: "1.0.0",
            description: "This is the API documentation for Example",
          },
          components: {
            parameters: {
              "x-trace-id": {
                name: "x-trace-id",
                in: "header",
                required: false,
                description: "Trace ID for request tracking",
                schema: {
                  type: "string",
                },
              },
            },
            securitySchemes: {
              "x-api-key": {
                type: "apiKey",
                in: "header",
                name: "x-api-key",
              },
              Authorization: {
                type: "oauth2",
                flows: {
                  clientCredentials: {
                    tokenUrl: "https://auth.example.com/oauth/token",
                    scopes: {
                      "admin:all": "管理者権限",
                      "read:blog": "ブログの読み取り権限",
                      "write:blog": "ブログの書き込み権限",
                    },
                  },
                },
              },
            },
          },
          servers: [
            { url: "http://localhost:3000", description: "Local Server" },
          ],
        },
      }),
    )
    .get(
      "/scalar",
      Scalar({
        url: "/oepenapi",
        theme: "kepler",
      }),
    )
    .get(
      "/swagger",
      swaggerUI({
        url: "/oepenapi",
      }),
    )
    .get("/redoc", (c) => {
      return c.html(/* html */ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="SwaggerUI" />
        <title>Sample API | Redoc</title>
      </head>
      <body>
        <redoc spec-url="/oepenapi"></redoc>
        <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
      </body>
    </html>
  `);
    });

  const host = process.env.HOSTNAME || "localhost";
  const p = process.env.PORT || 3333;
  serve(
    {
      fetch: root.fetch,
      hostname: host,
      port: Number(p),
    },
    (info) => {
      console.log(`Listening on http://${host}:${info.port}/scalar`);
      console.log(`Listening on http://${host}:${info.port}/swagger`);
      console.log(`Listening on http://${host}:${info.port}/redoc`);
    },
  );
};

main();
